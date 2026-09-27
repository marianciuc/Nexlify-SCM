package com.marianciuc.nexifly.inventory.kafka.events;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentSucceededEvent(
        UUID orderId,
        UUID paymentId,
        BigDecimal amount,
        Instant paidAt
) {}
