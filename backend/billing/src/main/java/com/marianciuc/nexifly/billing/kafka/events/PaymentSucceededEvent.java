package com.marianciuc.nexifly.billing.kafka.events;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Builder
public record PaymentSucceededEvent(
        String eventId,
        String eventType,
        UUID orderId,
        UUID invoiceId,
        String invoiceNumber,
        BigDecimal amount,
        String currency,
        String transactionId,
        Instant timestamp
) {}
