package com.marianciuc.nexifly.orders.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {
    private UUID id;
    private String orderNumber;
    private UUID customerId;
    private String customerName;
    private String status; // DRAFT, SUBMITTED, RESERVED, PAID, SHIPPED, COMPLETED, CANCELLED
    private BigDecimal totalAmount;
    private String currency;
    private int itemsCount;
    private String deliveryCity;
    private String deliveryAddress;
    private Instant createdAt;
    private List<OrderItemDto> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDto {
        private String sku;
        private String name;
        private int quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }
}
