package com.marianciuc.nexifly.inventory.kafka.events;

import java.time.Instant;
import java.util.UUID;

public record StockReservedEvent(
        UUID orderId,
        UUID reservationId,
        UUID productId,
        String sku,
        int quantity,
        Instant reservedAt
) {}
