package com.marianciuc.nexifly.billing.domain.dto;

import lombok.Builder;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Builder
public record InvoiceCreateRequest(
        UUID orderId,
        UUID sellerCompanyId,
        UUID buyerCompanyId,
        String sellerNip,
        String buyerNip,
        String sellerName,
        String buyerName,
        String sellerAddress,
        String buyerAddress,
        LocalDate saleDate,
        String paymentTerms,
        String paymentMethod,
        String currency,
        List<InvoiceLineRequest> lines
) {}
