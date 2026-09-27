package com.marianciuc.nexifly.rfq.kafka.events;

import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record RfqPublishedEvent(
        String eventId,
        String eventType,
        UUID rfqId,
        String rfqNumber,
        String title,
        String category,
        Instant deadline,
        Instant timestamp
) {}
