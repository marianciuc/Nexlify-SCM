package com.marianciuc.nexifly.rfq.domain.dto;

import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record RfqStatsResponse(
        long totalRfqs,
        long activeRfqs,
        long awardedRfqs,
        long totalBids,
        BigDecimal avgBidsPerRfq,
        BigDecimal avgSavingsPercent
) {}
