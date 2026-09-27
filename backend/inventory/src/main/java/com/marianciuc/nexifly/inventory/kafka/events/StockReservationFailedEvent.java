package com.marianciuc.nexifly.inventory.kafka.events;

import java.time.Instant;
import java.util.UUID;

public record StockReservationFailedEvent(
        UUID orderId,
        String sku,
        int requestedQuantity,
        String reason,
        Instant failedAt
) {}
