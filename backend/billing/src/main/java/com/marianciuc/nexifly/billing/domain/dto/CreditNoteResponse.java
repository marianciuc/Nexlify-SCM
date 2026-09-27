package com.marianciuc.nexifly.billing.domain.dto;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Builder
public record CreditNoteResponse(
        UUID id,
        String creditNoteNumber,
        UUID originalInvoiceId,
        UUID orderId,
        String reason,
        BigDecimal netAdjustment,
        BigDecimal vatAdjustment,
        BigDecimal grossAdjustment,
        LocalDate issueDate,
        String status,
        String pdfUrl,
        Instant createdAt
) {}
