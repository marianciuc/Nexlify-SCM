package com.marianciuc.nexifly.rfq.domain.dto;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Builder
public record CreateRfqRequest(
        String title,
        String description,
        String category,
        Instant deadline,
        LocalDate deliveryDate,
        String deliveryAddress,
        String deliveryCity,
        BigDecimal budgetAmount,
        Boolean budgetHidden,
        String currency,
        String paymentTerms,
        List<RfqItemRequest> items
) {}
