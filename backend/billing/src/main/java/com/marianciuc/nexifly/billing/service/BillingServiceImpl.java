package com.marianciuc.nexifly.billing.service;

import com.marianciuc.nexifly.billing.domain.dto.*;
import com.marianciuc.nexifly.billing.domain.entity.CreditNoteEn;
import com.marianciuc.nexifly.billing.domain.entity.InvoiceEn;
import com.marianciuc.nexifly.billing.domain.entity.InvoiceLineEn;
import com.marianciuc.nexifly.billing.kafka.BillingProducer;
import com.marianciuc.nexifly.billing.kafka.events.InvoiceIssuedEvent;
import com.marianciuc.nexifly.billing.kafka.events.PaymentSucceededEvent;
import com.marianciuc.nexifly.billing.repository.CreditNoteRepository;
import com.marianciuc.nexifly.billing.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BillingServiceImpl implements BillingService {

    private final InvoiceRepository invoiceRepository;
    private final CreditNoteRepository creditNoteRepository;
    private final InvoiceGeneratorService invoiceGeneratorService;
    private final BillingProducer billingProducer;

    @Override
    @Transactional
    public InvoiceDetailResponse createInvoice(InvoiceCreateRequest req) {
        String invoiceNumber = invoiceGeneratorService.generateInvoiceNumber();
        LocalDate now = LocalDate.now();

        LocalDate dueDate = req.paymentTerms() != null && req.paymentTerms().contains("60")
                ? now.plusDays(60) : now.plusDays(30);

        BigDecimal totalNet = BigDecimal.ZERO;
        BigDecimal totalVat = BigDecimal.ZERO;
        BigDecimal totalGross = BigDecimal.ZERO;

        List<InvoiceLineEn> lines = new ArrayList<>();
        int lineNum = 1;

        if (req.lines() != null) {
            for (InvoiceLineRequest lr : req.lines()) {
                BigDecimal qty = lr.quantity() != null ? lr.quantity() : BigDecimal.ONE;
                BigDecimal unitPrice = lr.unitPriceNet() != null ? lr.unitPriceNet() : BigDecimal.ZERO;
                BigDecimal discount = lr.discountPercent() != null ? lr.discountPercent() : BigDecimal.ZERO;
                BigDecimal vatRate = lr.vatRate() != null ? lr.vatRate() : new BigDecimal("23.00");

                BigDecimal factor = BigDecimal.ONE.subtract(discount.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
                BigDecimal lineNet = qty.multiply(unitPrice).multiply(factor).setScale(2, RoundingMode.HALF_UP);
                BigDecimal lineVat = lineNet.multiply(vatRate).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
                BigDecimal lineGross = lineNet.add(lineVat);

                totalNet = totalNet.add(lineNet);
                totalVat = totalVat.add(lineVat);
                totalGross = totalGross.add(lineGross);

                InvoiceLineEn line = InvoiceLineEn.builder()
                        .lineNumber(lr.lineNumber() != null ? lr.lineNumber() : lineNum++)
                        .sku(lr.sku() != null ? lr.sku() : "SKU-GEN")
                        .description(lr.description() != null ? lr.description() : "Item")
                        .quantity(qty)
                        .unitOfMeasure(lr.unitOfMeasure() != null ? lr.unitOfMeasure() : "PCE")
                        .unitPriceNet(unitPrice)
                        .discountPercent(discount)
                        .vatRate(vatRate)
                        .netAmount(lineNet)
                        .vatAmount(lineVat)
                        .grossAmount(lineGross)
                        .build();
                lines.add(line);
            }
        }

        InvoiceEn invoice = InvoiceEn.builder()
                .invoiceNumber(invoiceNumber)
                .invoiceType("SALES")
                .orderId(req.orderId())
                .sellerCompanyId(req.sellerCompanyId())
                .buyerCompanyId(req.buyerCompanyId())
                .sellerNip(req.sellerNip() != null ? req.sellerNip() : "0000000000")
                .buyerNip(req.buyerNip() != null ? req.buyerNip() : "0000000000")
                .sellerName(req.sellerName() != null ? req.sellerName() : "Nexlify Logistics")
                .buyerName(req.buyerName() != null ? req.buyerName() : "Customer")
                .sellerAddress(req.sellerAddress() != null ? req.sellerAddress() : "Warszawa, Poland")
                .buyerAddress(req.buyerAddress() != null ? req.buyerAddress() : "Warszawa, Poland")
                .issueDate(now)
                .saleDate(req.saleDate() != null ? req.saleDate() : now)
                .dueDate(dueDate)
                .paymentTerms(req.paymentTerms() != null ? req.paymentTerms() : "NET_30")
                .currency(req.currency() != null ? req.currency() : "PLN")
                .netAmount(totalNet)
                .vatAmount(totalVat)
                .grossAmount(totalGross)
                .status("ISSUED")
                .paymentMethod(req.paymentMethod() != null ? req.paymentMethod() : "BANK_TRANSFER")
                .build();

        for (InvoiceLineEn l : lines) {
            invoice.addLine(l);
        }

        invoice = invoiceRepository.save(invoice);
        log.info("Saved Invoice: {} with gross={}", invoice.getInvoiceNumber(), invoice.getGrossAmount());

        billingProducer.publishInvoiceIssued(InvoiceIssuedEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType("INVOICE_ISSUED")
                .invoiceId(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .orderId(invoice.getOrderId())
                .buyerCompanyId(invoice.getBuyerCompanyId())
                .grossAmount(invoice.getGrossAmount())
                .dueDate(invoice.getDueDate())
                .timestamp(Instant.now())
                .build());

        return mapToDetailResponse(invoice);
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceDetailResponse getInvoiceById(UUID id) {
        InvoiceEn invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + id));
        return mapToDetailResponse(invoice);
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceDetailResponse getInvoiceByOrderId(UUID orderId) {
        InvoiceEn invoice = invoiceRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found for order: " + orderId));
        return mapToDetailResponse(invoice);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InvoiceDetailResponse> getInvoices(UUID tenantId, String status, Pageable pageable) {
        Page<InvoiceEn> page;
        if (tenantId != null) {
            page = invoiceRepository.findBySellerCompanyIdOrBuyerCompanyId(tenantId, tenantId, pageable);
        } else {
            page = invoiceRepository.findAll(pageable);
        }
        return page.map(this::mapToDetailResponse);
    }

    @Override
    @Transactional
    public InvoiceDetailResponse markInvoiceAsPaid(UUID id, String transactionId, String paymentMethod) {
        InvoiceEn invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + id));

        invoice.setStatus("PAID");
        if (paymentMethod != null) {
            invoice.setPaymentMethod(paymentMethod);
        }
        invoice = invoiceRepository.save(invoice);

        billingProducer.publishPaymentSucceeded(PaymentSucceededEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType("PAYMENT_SUCCEEDED")
                .orderId(invoice.getOrderId())
                .invoiceId(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .amount(invoice.getGrossAmount())
                .currency(invoice.getCurrency())
                .transactionId(transactionId != null ? transactionId : "TXN-" + UUID.randomUUID())
                .timestamp(Instant.now())
                .build());

        return mapToDetailResponse(invoice);
    }

    @Override
    @Transactional
    public String createPaymentIntent(UUID invoiceId) {
        InvoiceEn invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + invoiceId));

        String intentId = "pi_" + UUID.randomUUID().toString().replace("-", "");
        String clientSecret = intentId + "_secret_" + UUID.randomUUID().toString().substring(0, 8);

        invoice.setStripePaymentIntentId(intentId);
        invoice.setStripePaymentStatus("requires_payment_method");
        invoiceRepository.save(invoice);

        return clientSecret;
    }

    @Override
    @Transactional
    public CreditNoteResponse createCreditNote(CreditNoteRequest req) {
        InvoiceEn invoice = invoiceRepository.findById(req.originalInvoiceId())
                .orElseThrow(() -> new IllegalArgumentException("Original invoice not found: " + req.originalInvoiceId()));

        String creditNumber = invoiceGeneratorService.generateCreditNoteNumber();
        BigDecimal netAdj = req.netAdjustment() != null ? req.netAdjustment() : BigDecimal.ZERO;
        BigDecimal vatAdj = req.vatAdjustment() != null ? req.vatAdjustment() : netAdj.multiply(new BigDecimal("0.23")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal grossAdj = netAdj.add(vatAdj);

        CreditNoteEn creditNote = CreditNoteEn.builder()
                .creditNoteNumber(creditNumber)
                .originalInvoice(invoice)
                .orderId(invoice.getOrderId())
                .reason(req.reason() != null ? req.reason() : "Order correction")
                .netAdjustment(netAdj)
                .vatAdjustment(vatAdj)
                .grossAdjustment(grossAdj)
                .issueDate(LocalDate.now())
                .status("ISSUED")
                .build();

        creditNote = creditNoteRepository.save(creditNote);
        log.info("Created Credit Note: {} for order: {}", creditNumber, invoice.getOrderId());

        return mapToCreditResponse(creditNote);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CreditNoteResponse> getCreditNotes(UUID orderId) {
        return creditNoteRepository.findByOrderId(orderId).stream()
                .map(this::mapToCreditResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BillingStatsResponse getBillingStats(UUID tenantId) {
        List<InvoiceEn> invoices = tenantId != null
                ? invoiceRepository.findBySellerCompanyIdOrBuyerCompanyId(tenantId, tenantId, Pageable.unpaged()).getContent()
                : invoiceRepository.findAll();

        BigDecimal totalReceivables = BigDecimal.ZERO;
        BigDecimal overdueAmount = BigDecimal.ZERO;
        BigDecimal paidThisMonth = BigDecimal.ZERO;
        long openCount = 0;

        LocalDate firstOfMonth = LocalDate.now().withDayOfMonth(1);

        for (InvoiceEn inv : invoices) {
            if ("ISSUED".equalsIgnoreCase(inv.getStatus())) {
                totalReceivables = totalReceivables.add(inv.getGrossAmount());
                openCount++;
                if (inv.getDueDate().isBefore(LocalDate.now())) {
                    overdueAmount = overdueAmount.add(inv.getGrossAmount());
                }
            } else if ("OVERDUE".equalsIgnoreCase(inv.getStatus())) {
                totalReceivables = totalReceivables.add(inv.getGrossAmount());
                overdueAmount = overdueAmount.add(inv.getGrossAmount());
                openCount++;
            } else if ("PAID".equalsIgnoreCase(inv.getStatus())) {
                if (inv.getUpdatedAt() != null && inv.getUpdatedAt().isAfter(firstOfMonth.atStartOfDay().toInstant(java.time.ZoneOffset.UTC))) {
                    paidThisMonth = paidThisMonth.add(inv.getGrossAmount());
                }
            }
        }

        return BillingStatsResponse.builder()
                .totalReceivables(totalReceivables)
                .overdueAmount(overdueAmount)
                .paidThisMonth(paidThisMonth)
                .openInvoicesCount(openCount)
                .build();
    }

    private InvoiceDetailResponse mapToDetailResponse(InvoiceEn entity) {
        List<InvoiceLineResponse> lines = entity.getLines() != null
                ? entity.getLines().stream().map(l -> InvoiceLineResponse.builder()
                .id(l.getId())
                .lineNumber(l.getLineNumber())
                .sku(l.getSku())
                .description(l.getDescription())
                .quantity(l.getQuantity())
                .unitOfMeasure(l.getUnitOfMeasure())
                .unitPriceNet(l.getUnitPriceNet())
                .discountPercent(l.getDiscountPercent())
                .vatRate(l.getVatRate())
                .netAmount(l.getNetAmount())
                .vatAmount(l.getVatAmount())
                .grossAmount(l.getGrossAmount())
                .build()).toList()
                : List.of();

        return InvoiceDetailResponse.builder()
                .id(entity.getId())
                .invoiceNumber(entity.getInvoiceNumber())
                .invoiceType(entity.getInvoiceType())
                .orderId(entity.getOrderId())
                .sellerCompanyId(entity.getSellerCompanyId())
                .buyerCompanyId(entity.getBuyerCompanyId())
                .sellerNip(entity.getSellerNip())
                .buyerNip(entity.getBuyerNip())
                .sellerName(entity.getSellerName())
                .buyerName(entity.getBuyerName())
                .sellerAddress(entity.getSellerAddress())
                .buyerAddress(entity.getBuyerAddress())
                .issueDate(entity.getIssueDate())
                .saleDate(entity.getSaleDate())
                .dueDate(entity.getDueDate())
                .paymentTerms(entity.getPaymentTerms())
                .currency(entity.getCurrency())
                .netAmount(entity.getNetAmount())
                .vatAmount(entity.getVatAmount())
                .grossAmount(entity.getGrossAmount())
                .status(entity.getStatus())
                .paymentMethod(entity.getPaymentMethod())
                .stripePaymentIntentId(entity.getStripePaymentIntentId())
                .stripePaymentStatus(entity.getStripePaymentStatus())
                .pdfUrl(entity.getPdfUrl())
                .lines(lines)
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private CreditNoteResponse mapToCreditResponse(CreditNoteEn cn) {
        return CreditNoteResponse.builder()
                .id(cn.getId())
                .creditNoteNumber(cn.getCreditNoteNumber())
                .originalInvoiceId(cn.getOriginalInvoice().getId())
                .orderId(cn.getOrderId())
                .reason(cn.getReason())
                .netAdjustment(cn.getNetAdjustment())
                .vatAdjustment(cn.getVatAdjustment())
                .grossAdjustment(cn.getGrossAdjustment())
                .issueDate(cn.getIssueDate())
                .status(cn.getStatus())
                .pdfUrl(cn.getPdfUrl())
                .createdAt(cn.getCreatedAt())
                .build();
    }
}
