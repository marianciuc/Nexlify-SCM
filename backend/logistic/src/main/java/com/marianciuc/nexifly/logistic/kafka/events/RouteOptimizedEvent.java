package com.marianciuc.nexifly.logistic.kafka.events;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Builder
public record RouteOptimizedEvent(
        String eventId,
        String eventType,
        UUID routeSheetId,
        String routeNumber,
        UUID vehicleId,
        UUID driverId,
        BigDecimal totalDistanceKm,
        List<UUID> orderIds,
        Instant timestamp
) {}
