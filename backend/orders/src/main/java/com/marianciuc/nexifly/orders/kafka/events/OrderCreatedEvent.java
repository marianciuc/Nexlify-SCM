package com.marianciuc.nexifly.orders.kafka.events;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderCreatedEvent(
        String eventType,
        UUID orderId,
        String orderNumber,
        UUID customerId,
        UUID supplierId,
        List<OrderItemDto> items,
        BigDecimal totalAmount,
        String currency,
        Instant createdAt
) {
    public record OrderItemDto(
            UUID productId,
            String sku,
            int quantity,
            BigDecimal unitPrice
    ) {}
}
