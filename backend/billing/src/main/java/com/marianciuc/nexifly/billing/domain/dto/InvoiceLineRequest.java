package com.marianciuc.nexifly.billing.domain.dto;

import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record InvoiceLineRequest(
        Integer lineNumber,
        String sku,
        String description,
        BigDecimal quantity,
        String unitOfMeasure,
        BigDecimal unitPriceNet,
        BigDecimal discountPercent,
        BigDecimal vatRate
) {}
