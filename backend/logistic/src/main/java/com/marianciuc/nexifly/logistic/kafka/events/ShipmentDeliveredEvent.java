package com.marianciuc.nexifly.logistic.kafka.events;

import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record ShipmentDeliveredEvent(
        String eventId,
        String eventType,
        UUID routeSheetId,
        UUID orderId,
        String signatureName,
        Instant deliveryTime,
        Instant timestamp
) {}
