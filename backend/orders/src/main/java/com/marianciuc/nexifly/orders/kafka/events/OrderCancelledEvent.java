package com.marianciuc.nexifly.orders.kafka.events;

import java.time.Instant;
import java.util.UUID;

public record OrderCancelledEvent(
        String eventType,
        UUID orderId,
        String orderNumber,
        String reason,
        Instant cancelledAt
) {}
