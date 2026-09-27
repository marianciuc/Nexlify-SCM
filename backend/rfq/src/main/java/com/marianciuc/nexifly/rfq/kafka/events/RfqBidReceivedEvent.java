package com.marianciuc.nexifly.rfq.kafka.events;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Builder
public record RfqBidReceivedEvent(
        String eventId,
        String eventType,
        UUID rfqId,
        UUID bidId,
        UUID supplierCompanyId,
        BigDecimal totalPrice,
        Instant timestamp
) {}
