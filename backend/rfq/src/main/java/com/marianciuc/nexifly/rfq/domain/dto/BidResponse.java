package com.marianciuc.nexifly.rfq.domain.dto;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Builder
public record BidResponse(
        UUID id,
        UUID rfqId,
        UUID supplierCompanyId,
        String status,
        BigDecimal totalPrice,
        String currency,
        LocalDate deliveryDate,
        String paymentTerms,
        Integer validityDays,
        LocalDate validUntil,
        String notes,
        BigDecimal score,
        List<BidItemResponse> items,
        Instant submittedAt
) {}
