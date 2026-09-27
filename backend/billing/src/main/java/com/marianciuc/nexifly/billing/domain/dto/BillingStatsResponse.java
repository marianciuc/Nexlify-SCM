package com.marianciuc.nexifly.billing.domain.dto;

import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record BillingStatsResponse(
        BigDecimal totalReceivables,
        BigDecimal overdueAmount,
        BigDecimal paidThisMonth,
        long openInvoicesCount
) {}
