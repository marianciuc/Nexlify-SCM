package com.marianciuc.nexifly.billing.domain.dto;

import lombok.Builder;

import java.math.BigDecimal;
import java.util.UUID;

@Builder
public record CreditNoteRequest(
        UUID originalInvoiceId,
        String reason,
        BigDecimal netAdjustment,
        BigDecimal vatAdjustment
) {}
