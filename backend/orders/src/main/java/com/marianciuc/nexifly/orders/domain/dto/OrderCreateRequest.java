package com.marianciuc.nexifly.orders.domain.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record OrderCreateRequest(
        UUID customerId,
        UUID supplierId,
        String currency,
        String deliveryAddress,
        String deliveryCity,
        String deliveryPostalCode,
        LocalDate requestedDeliveryDate,
        String notes,
        List<OrderItemRequest> items
) {
    public record OrderItemRequest(
            UUID productId,
            String sku,
            String productName,
            int quantity,
            java.math.BigDecimal unitPrice,
            UUID warehouseId
    ) {}
}
