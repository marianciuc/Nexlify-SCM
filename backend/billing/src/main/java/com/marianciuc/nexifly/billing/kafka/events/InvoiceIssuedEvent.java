package com.marianciuc.nexifly.billing.kafka.events;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Builder
public record InvoiceIssuedEvent(
        String eventId,
        String eventType,
        UUID invoiceId,
        String invoiceNumber,
        UUID orderId,
        UUID buyerCompanyId,
        BigDecimal grossAmount,
        LocalDate dueDate,
        Instant timestamp
) {}
