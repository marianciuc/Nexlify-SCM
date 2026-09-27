package com.marianciuc.nexifly.inventory.kafka.events;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record OrderCreatedEvent(
        UUID orderId,
        UUID customerCompanyId,
        UUID supplierCompanyId,
        List<OrderItemDto> items,
        BigDecimal totalAmount
) {
    public record OrderItemDto(
            UUID productId,
            String sku,
            int quantity,
            BigDecimal unitPrice
    ) {}
}
