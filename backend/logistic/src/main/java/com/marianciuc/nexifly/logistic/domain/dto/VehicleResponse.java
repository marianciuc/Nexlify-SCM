package com.marianciuc.nexifly.logistic.domain.dto;

import lombok.Builder;

import java.math.BigDecimal;
import java.util.UUID;

@Builder
public record VehicleResponse(
        UUID id,
        UUID carrierId,
        String plateNumber,
        String vehicleType,
        BigDecimal maxWeightKg,
        BigDecimal maxVolumeM3,
        Boolean hasRefrigeration,
        Boolean hasAdrCert,
        String fuelType,
        BigDecimal fuelConsumptionLPer100km,
        BigDecimal currentLocationLat,
        BigDecimal currentLocationLon,
        String status
) {}
