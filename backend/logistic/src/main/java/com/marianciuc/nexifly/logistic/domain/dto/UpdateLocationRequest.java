package com.marianciuc.nexifly.logistic.domain.dto;

import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record UpdateLocationRequest(
        BigDecimal latitude,
        BigDecimal longitude,
        Double speedKmh,
        Double fuelLevelPercent
) {}
