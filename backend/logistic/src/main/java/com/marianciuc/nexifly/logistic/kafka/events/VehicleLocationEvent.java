package com.marianciuc.nexifly.logistic.kafka.events;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Builder
public record VehicleLocationEvent(
        UUID vehicleId,
        String plateNumber,
        BigDecimal latitude,
        BigDecimal longitude,
        Instant timestamp
) {}
