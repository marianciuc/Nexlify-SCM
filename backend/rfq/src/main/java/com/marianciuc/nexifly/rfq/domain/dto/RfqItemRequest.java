package com.marianciuc.nexifly.rfq.domain.dto;

import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record RfqItemRequest(
        String sku,
        String productName,
        BigDecimal quantity,
        String unitOfMeasure,
        String description,
        Boolean allowAlternatives
) {}
