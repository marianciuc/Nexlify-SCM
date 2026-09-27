package com.marianciuc.nexifly.logistic.domain.dto;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Builder
public record RouteSheetResponse(
        UUID id,
        String routeNumber,
        UUID vehicleId,
        String vehiclePlate,
        UUID driverId,
        String driverLicense,
        String status,
        Instant plannedDeparture,
        Instant actualDeparture,
        Instant plannedArrival,
        Instant actualArrival,
        BigDecimal totalDistanceKm,
        BigDecimal totalWeightKg,
        BigDecimal fuelConsumedL,
        String ecmrNumber,
        String notes,
        List<DeliveryStopResponse> stops,
        Instant createdAt
) {}
