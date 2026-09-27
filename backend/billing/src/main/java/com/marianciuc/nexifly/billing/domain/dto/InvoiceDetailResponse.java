package com.marianciuc.nexifly.billing.domain.dto;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Builder
public record InvoiceDetailResponse(
        UUID id,
        String invoiceNumber,
        String invoiceType,
        UUID orderId,
        UUID sellerCompanyId,
        UUID buyerCompanyId,
        String sellerNip,
        String buyerNip,
        String sellerName,
        String buyerName,
        String sellerAddress,
        String buyerAddress,
        LocalDate issueDate,
        LocalDate saleDate,
        LocalDate dueDate,
        String paymentTerms,
        String currency,
        BigDecimal netAmount,
        BigDecimal vatAmount,
        BigDecimal grossAmount,
        String status,
        String paymentMethod,
        String stripePaymentIntentId,
        String stripePaymentStatus,
        String pdfUrl,
        List<InvoiceLineResponse> lines,
        Instant createdAt
) {}
