package com.marianciuc.nexifly.orders.service;

import com.marianciuc.nexifly.orders.domain.dto.OrderCreateRequest;
import com.marianciuc.nexifly.orders.domain.dto.OrderResponse;
import com.marianciuc.nexifly.orders.domain.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Map;
import java.util.UUID;

public interface OrderService {
    OrderResponse createOrder(OrderCreateRequest request, UUID tenantId);
    OrderResponse getOrderById(UUID id);
    Page<OrderResponse> getOrders(UUID customerId, UUID supplierId, OrderStatus status, Pageable pageable);
    OrderResponse submitOrder(UUID id, UUID userId);
    OrderResponse cancelOrder(UUID id, UUID userId, String reason);
    Map<String, Object> getOrderStats();
}
