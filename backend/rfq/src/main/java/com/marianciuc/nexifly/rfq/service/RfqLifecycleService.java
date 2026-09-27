package com.marianciuc.nexifly.rfq.service;

import com.marianciuc.nexifly.rfq.domain.dto.*;
import com.marianciuc.nexifly.rfq.domain.entity.BidEn;
import com.marianciuc.nexifly.rfq.domain.entity.BidItemEn;
import com.marianciuc.nexifly.rfq.domain.entity.RfqItemEn;
import com.marianciuc.nexifly.rfq.domain.entity.RfqRequestEn;
import com.marianciuc.nexifly.rfq.kafka.RfqProducer;
import com.marianciuc.nexifly.rfq.kafka.events.RfqAwardedEvent;
import com.marianciuc.nexifly.rfq.kafka.events.RfqBidReceivedEvent;
import com.marianciuc.nexifly.rfq.kafka.events.RfqPublishedEvent;
import com.marianciuc.nexifly.rfq.repository.BidRepository;
import com.marianciuc.nexifly.rfq.repository.RfqRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RfqLifecycleService {

    private final RfqRequestRepository rfqRepository;
    private final BidRepository bidRepository;
    private final BidScoringService scoringService;
    private final RfqProducer rfqProducer;

    @Transactional
    public RfqResponse createRfq(UUID buyerCompanyId, UUID tenantId, CreateRfqRequest req) {
        String rfqNumber = "RFQ-2026-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        RfqRequestEn rfq = RfqRequestEn.builder()
                .rfqNumber(rfqNumber)
                .buyerCompanyId(buyerCompanyId)
                .tenantId(tenantId)
                .title(req.title())
                .description(req.description())
                .category(req.category())
                .status("DRAFT")
                .deadline(req.deadline() != null ? req.deadline() : Instant.now().plusSeconds(86400 * 7))
                .deliveryDate(req.deliveryDate())
                .deliveryAddress(req.deliveryAddress())
                .deliveryCity(req.deliveryCity())
                .budgetAmount(req.budgetAmount())
                .budgetHidden(req.budgetHidden() != null && req.budgetHidden())
                .currency(req.currency() != null ? req.currency() : "PLN")
                .paymentTerms(req.paymentTerms() != null ? req.paymentTerms() : "NET_30")
                .build();

        if (req.items() != null) {
            for (RfqItemRequest ir : req.items()) {
                RfqItemEn item = RfqItemEn.builder()
                        .sku(ir.sku())
                        .productName(ir.productName())
                        .quantity(ir.quantity() != null ? ir.quantity() : BigDecimal.ONE)
                        .unitOfMeasure(ir.unitOfMeasure() != null ? ir.unitOfMeasure() : "PCE")
                        .description(ir.description())
                        .allowAlternatives(ir.allowAlternatives() != null && ir.allowAlternatives())
                        .build();
                rfq.addItem(item);
            }
        }

        rfq = rfqRepository.save(rfq);
        log.info("Created RFQ: {}", rfqNumber);
        return mapToResponse(rfq, true);
    }

    @Transactional
    public RfqResponse publishRfq(UUID id) {
        RfqRequestEn rfq = rfqRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("RFQ not found: " + id));

        rfq.setStatus("PUBLISHED");
        rfq = rfqRepository.save(rfq);

        rfqProducer.publishRfqPublished(RfqPublishedEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType("RFQ_PUBLISHED")
                .rfqId(rfq.getId())
                .rfqNumber(rfq.getRfqNumber())
                .title(rfq.getTitle())
                .category(rfq.getCategory())
                .deadline(rfq.getDeadline())
                .timestamp(Instant.now())
                .build());

        log.info("Published RFQ: {}", rfq.getRfqNumber());
        return mapToResponse(rfq, true);
    }

    @Transactional
    public BidResponse submitBid(UUID rfqId, SubmitBidRequest req) {
        RfqRequestEn rfq = rfqRepository.findById(rfqId)
                .orElseThrow(() -> new IllegalArgumentException("RFQ not found: " + rfqId));

        if (!"PUBLISHED".equalsIgnoreCase(rfq.getStatus()) && !"EVALUATING".equalsIgnoreCase(rfq.getStatus())) {
            throw new IllegalStateException("Cannot submit bid to RFQ with status: " + rfq.getStatus());
        }

        BidEn bid = BidEn.builder()
                .supplierCompanyId(req.supplierCompanyId())
                .status("SUBMITTED")
                .totalPrice(req.totalPrice() != null ? req.totalPrice() : BigDecimal.ZERO)
                .currency(req.currency() != null ? req.currency() : "PLN")
                .deliveryDate(req.deliveryDate())
                .paymentTerms(req.paymentTerms() != null ? req.paymentTerms() : "NET_30")
                .validityDays(req.validityDays() != null ? req.validityDays() : 30)
                .notes(req.notes())
                .build();

        if (req.items() != null) {
            for (BidItemRequest bir : req.items()) {
                BidItemEn item = BidItemEn.builder()
                        .rfqItemId(bir.rfqItemId())
                        .offeredSku(bir.offeredSku())
                        .productName(bir.productName())
                        .quantity(bir.quantity() != null ? bir.quantity() : BigDecimal.ONE)
                        .unitPrice(bir.unitPrice() != null ? bir.unitPrice() : BigDecimal.ZERO)
                        .totalPrice(bir.totalPrice() != null ? bir.totalPrice() : BigDecimal.ZERO)
                        .isAlternative(bir.isAlternative() != null && bir.isAlternative())
                        .alternativeReason(bir.alternativeReason())
                        .leadTimeDays(bir.leadTimeDays())
                        .vatRate(bir.vatRate() != null ? bir.vatRate() : new BigDecimal("23.00"))
                        .build();
                bid.addItem(item);
            }
        }

        rfq.addBid(bid);
        scoringService.scoreBids(rfq);
        rfq = rfqRepository.save(rfq);

        BidEn savedBid = rfq.getBids().getLast();
        log.info("Bid submitted for RFQ {}: bidId={}, total={}", rfq.getRfqNumber(), savedBid.getId(), savedBid.getTotalPrice());

        rfqProducer.publishBidReceived(RfqBidReceivedEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType("BID_RECEIVED")
                .rfqId(rfq.getId())
                .bidId(savedBid.getId())
                .supplierCompanyId(savedBid.getSupplierCompanyId())
                .totalPrice(savedBid.getTotalPrice())
                .timestamp(Instant.now())
                .build());

        return mapToBidResponse(savedBid);
    }

    @Transactional
    public RfqResponse awardBid(UUID rfqId, UUID bidId) {
        RfqRequestEn rfq = rfqRepository.findById(rfqId)
                .orElseThrow(() -> new IllegalArgumentException("RFQ not found: " + rfqId));

        BidEn winningBid = null;
        for (BidEn b : rfq.getBids()) {
            if (b.getId().equals(bidId)) {
                b.setStatus("ACCEPTED");
                winningBid = b;
            } else {
                b.setStatus("REJECTED");
            }
        }

        if (winningBid == null) {
            throw new IllegalArgumentException("Bid not found in RFQ: " + bidId);
        }

        rfq.setStatus("AWARDED");
        rfq.setAwardedBidId(winningBid.getId());
        rfq = rfqRepository.save(rfq);

        rfqProducer.publishRfqAwarded(RfqAwardedEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType("RFQ_AWARDED")
                .rfqId(rfq.getId())
                .rfqNumber(rfq.getRfqNumber())
                .winningBidId(winningBid.getId())
                .supplierCompanyId(winningBid.getSupplierCompanyId())
                .buyerCompanyId(rfq.getBuyerCompanyId())
                .totalPrice(winningBid.getTotalPrice())
                .currency(winningBid.getCurrency())
                .timestamp(Instant.now())
                .build());

        log.info("Awarded RFQ {} to bid {} (supplier: {})", rfq.getRfqNumber(), bidId, winningBid.getSupplierCompanyId());
        return mapToResponse(rfq, true);
    }

    @Transactional
    public RfqResponse cancelRfq(UUID id) {
        RfqRequestEn rfq = rfqRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("RFQ not found: " + id));

        rfq.setStatus("CANCELLED");
        rfq = rfqRepository.save(rfq);
        return mapToResponse(rfq, true);
    }

    @Transactional(readOnly = true)
    public RfqResponse getRfqById(UUID id, boolean isBuyer) {
        RfqRequestEn rfq = rfqRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("RFQ not found: " + id));
        return mapToResponse(rfq, isBuyer);
    }

    @Transactional(readOnly = true)
    public Page<RfqResponse> getBuyerRfqs(UUID tenantId, Pageable pageable) {
        return rfqRepository.findByTenantId(tenantId, pageable)
                .map(r -> mapToResponse(r, true));
    }

    @Transactional(readOnly = true)
    public Page<RfqResponse> getPublicBoard(String category, Pageable pageable) {
        Page<RfqRequestEn> page = category != null && !category.isBlank()
                ? rfqRepository.findByStatusAndCategory("PUBLISHED", category, pageable)
                : rfqRepository.findByStatus("PUBLISHED", pageable);
        return page.map(r -> mapToResponse(r, false));
    }

    @Transactional(readOnly = true)
    public Page<BidResponse> getSupplierBids(UUID supplierCompanyId, Pageable pageable) {
        return bidRepository.findBySupplierCompanyId(supplierCompanyId, pageable)
                .map(this::mapToBidResponse);
    }

    @Transactional(readOnly = true)
    public RfqStatsResponse getStats(UUID tenantId) {
        List<RfqRequestEn> all = rfqRepository.findAll();
        long total = all.size();
        long active = all.stream().filter(r -> "PUBLISHED".equalsIgnoreCase(r.getStatus()) || "EVALUATING".equalsIgnoreCase(r.getStatus())).count();
        long awarded = all.stream().filter(r -> "AWARDED".equalsIgnoreCase(r.getStatus())).count();
        long totalBids = all.stream().mapToInt(r -> r.getBids().size()).sum();

        BigDecimal avgBids = total > 0
                ? BigDecimal.valueOf((double) totalBids / total).setScale(1, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return RfqStatsResponse.builder()
                .totalRfqs(total)
                .activeRfqs(active)
                .awardedRfqs(awarded)
                .totalBids(totalBids)
                .avgBidsPerRfq(avgBids)
                .avgSavingsPercent(BigDecimal.valueOf(14.8)) // average benchmark savings
                .build();
    }

    private RfqResponse mapToResponse(RfqRequestEn r, boolean isBuyer) {
        List<RfqItemResponse> items = r.getItems() != null ? r.getItems().stream().map(i -> RfqItemResponse.builder()
                .id(i.getId())
                .sku(i.getSku())
                .productName(i.getProductName())
                .quantity(i.getQuantity())
                .unitOfMeasure(i.getUnitOfMeasure())
                .description(i.getDescription())
                .allowAlternatives(i.getAllowAlternatives())
                .build()).toList() : List.of();

        List<BidResponse> bids = isBuyer && r.getBids() != null ? r.getBids().stream().map(this::mapToBidResponse).toList() : List.of();

        return RfqResponse.builder()
                .id(r.getId())
                .rfqNumber(r.getRfqNumber())
                .buyerCompanyId(r.getBuyerCompanyId())
                .tenantId(r.getTenantId())
                .title(r.getTitle())
                .description(r.getDescription())
                .category(r.getCategory())
                .status(r.getStatus())
                .deadline(r.getDeadline())
                .deliveryDate(r.getDeliveryDate())
                .deliveryAddress(r.getDeliveryAddress())
                .deliveryCity(r.getDeliveryCity())
                .budgetAmount(isBuyer || !Boolean.TRUE.equals(r.getBudgetHidden()) ? r.getBudgetAmount() : null)
                .budgetHidden(r.getBudgetHidden())
                .currency(r.getCurrency())
                .paymentTerms(r.getPaymentTerms())
                .awardedBidId(r.getAwardedBidId())
                .bidsCount(r.getBids() != null ? r.getBids().size() : 0)
                .items(items)
                .bids(bids)
                .createdAt(r.getCreatedAt())
                .build();
    }

    private BidResponse mapToBidResponse(BidEn b) {
        List<BidItemResponse> items = b.getItems() != null ? b.getItems().stream().map(bi -> BidItemResponse.builder()
                .id(bi.getId())
                .rfqItemId(bi.getRfqItemId())
                .offeredSku(bi.getOfferedSku())
                .productName(bi.getProductName())
                .quantity(bi.getQuantity())
                .unitPrice(bi.getUnitPrice())
                .totalPrice(bi.getTotalPrice())
                .isAlternative(bi.getIsAlternative())
                .alternativeReason(bi.getAlternativeReason())
                .leadTimeDays(bi.getLeadTimeDays())
                .vatRate(bi.getVatRate())
                .build()).toList() : List.of();

        return BidResponse.builder()
                .id(b.getId())
                .rfqId(b.getRfq() != null ? b.getRfq().getId() : null)
                .supplierCompanyId(b.getSupplierCompanyId())
                .status(b.getStatus())
                .totalPrice(b.getTotalPrice())
                .currency(b.getCurrency())
                .deliveryDate(b.getDeliveryDate())
                .paymentTerms(b.getPaymentTerms())
                .validityDays(b.getValidityDays())
                .validUntil(b.getValidUntil())
                .notes(b.getNotes())
                .score(b.getScore())
                .items(items)
                .submittedAt(b.getSubmittedAt())
                .build();
    }
}
