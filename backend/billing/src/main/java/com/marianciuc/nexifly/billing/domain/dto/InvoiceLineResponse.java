package com.marianciuc.nexifly.billing.domain.dto;

import lombok.Builder;

import java.math.BigDecimal;
import java.util.UUID;

@Builder
public record InvoiceLineResponse(
        UUID id,
        Integer lineNumber,
        String sku,
        String description,
        BigDecimal quantity,
        String unitOfMeasure,
        BigDecimal unitPriceNet,
        BigDecimal discountPercent,
        BigDecimal vatRate,
        BigDecimal netAmount,
        BigDecimal vatAmount,
        BigDecimal grossAmount
) {}
