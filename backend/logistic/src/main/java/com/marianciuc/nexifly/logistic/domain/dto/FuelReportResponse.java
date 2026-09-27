package com.marianciuc.nexifly.logistic.domain.dto;

import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record FuelReportResponse(
        String period,
        BigDecimal totalDistanceKm,
        BigDecimal totalFuelConsumedL,
        BigDecimal totalCO2EmittedKg,
        BigDecimal avgFuelPer100km,
        BigDecimal estimatedCostPln
) {}
