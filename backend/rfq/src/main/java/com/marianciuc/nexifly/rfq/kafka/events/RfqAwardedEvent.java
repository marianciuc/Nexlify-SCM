package com.marianciuc.nexifly.rfq.kafka.events;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Builder
public record RfqAwardedEvent(
        String eventId,
        String eventType,
        UUID rfqId,
        String rfqNumber,
        UUID winningBidId,
        UUID supplierCompanyId,
        UUID buyerCompanyId,
        BigDecimal totalPrice,
        String currency,
        Instant timestamp
) {}
