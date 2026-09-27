package com.marianciuc.nexifly.rfq.domain.dto;

import lombok.Builder;

import java.math.BigDecimal;
import java.util.UUID;

@Builder
public record BidItemRequest(
        UUID rfqItemId,
        String offeredSku,
        String productName,
        BigDecimal quantity,
        BigDecimal unitPrice,
        BigDecimal totalPrice,
        Boolean isAlternative,
        String alternativeReason,
        Integer leadTimeDays,
        BigDecimal vatRate
) {}
