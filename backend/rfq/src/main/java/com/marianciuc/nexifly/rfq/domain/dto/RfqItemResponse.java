package com.marianciuc.nexifly.rfq.domain.dto;

import lombok.Builder;

import java.math.BigDecimal;
import java.util.UUID;

@Builder
public record RfqItemResponse(
        UUID id,
        String sku,
        String productName,
        BigDecimal quantity,
        String unitOfMeasure,
        String description,
        Boolean allowAlternatives
) {}
