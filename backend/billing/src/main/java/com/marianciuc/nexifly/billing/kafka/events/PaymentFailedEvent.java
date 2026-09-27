package com.marianciuc.nexifly.billing.kafka.events;

import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record PaymentFailedEvent(
        String eventId,
        String eventType,
        UUID orderId,
        UUID invoiceId,
        String reason,
        Instant timestamp
) {}
