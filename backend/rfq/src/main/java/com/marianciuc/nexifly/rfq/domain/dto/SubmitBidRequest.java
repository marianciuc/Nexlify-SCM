package com.marianciuc.nexifly.rfq.domain.dto;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Builder
public record SubmitBidRequest(
        UUID supplierCompanyId,
        BigDecimal totalPrice,
        String currency,
        LocalDate deliveryDate,
        String paymentTerms,
        Integer validityDays,
        String notes,
        List<BidItemRequest> items
) {}
