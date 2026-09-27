package com.marianciuc.nexifly.orders.kafka.events;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record OrderPaidEvent(
        String eventType,
        UUID orderId,
        String orderNumber,
        BigDecimal amount,
        Instant paidAt
) {}
