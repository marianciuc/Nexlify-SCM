package com.marianciuc.nexifly.rfq.domain.dto;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Builder
public record RfqResponse(
        UUID id,
        String rfqNumber,
        UUID buyerCompanyId,
        UUID tenantId,
        String title,
        String description,
        String category,
        String status,
        Instant deadline,
        LocalDate deliveryDate,
        String deliveryAddress,
        String deliveryCity,
        BigDecimal budgetAmount,
        Boolean budgetHidden,
        String currency,
        String paymentTerms,
        UUID awardedBidId,
        int bidsCount,
        List<RfqItemResponse> items,
        List<BidResponse> bids,
        Instant createdAt
) {}
