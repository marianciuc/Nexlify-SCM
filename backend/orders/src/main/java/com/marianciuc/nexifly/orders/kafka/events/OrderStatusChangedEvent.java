package com.marianciuc.nexifly.orders.kafka.events;

import com.marianciuc.nexifly.orders.domain.enums.OrderStatus;

import java.time.Instant;
import java.util.UUID;

public record OrderStatusChangedEvent(
        String eventType,
        UUID orderId,
        String orderNumber,
        OrderStatus oldStatus,
        OrderStatus newStatus,
        UUID changedBy,
        String reason,
        Instant timestamp
) {}
