package com.marianciuc.nexifly.logistic.kafka.events;

import lombok.Builder;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Builder
public record ShipmentDispatchedEvent(
        String eventId,
        String eventType,
        UUID routeSheetId,
        String routeNumber,
        List<UUID> orderIds,
        UUID driverId,
        String plateNumber,
        Instant departureTime,
        Instant timestamp
) {}
