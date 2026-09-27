package com.marianciuc.nexifly.orders.controller;

import com.marianciuc.nexifly.orders.domain.dto.OrderCreateRequest;
import com.marianciuc.nexifly.orders.domain.dto.OrderResponse;
import com.marianciuc.nexifly.orders.domain.enums.OrderStatus;
import com.marianciuc.nexifly.orders.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<Page<OrderResponse>> getOrders(
            @RequestParam(required = false) UUID customerId,
            @RequestParam(required = false) UUID supplierId,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<OrderResponse> orders = orderService.getOrders(
                customerId, supplierId, status, PageRequest.of(page, size, Sort.by("createdAt").descending())
        );
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable UUID id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @RequestBody OrderCreateRequest request,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantIdStr
    ) {
        UUID tenantId = tenantIdStr != null && !tenantIdStr.isBlank() ? UUID.fromString(tenantIdStr) : null;
        OrderResponse created = orderService.createOrder(request, tenantId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<OrderResponse> submitOrder(
            @PathVariable UUID id,
            @RequestHeader(value = "X-User-Id", required = false) String userIdStr
    ) {
        UUID userId = userIdStr != null && !userIdStr.isBlank() ? UUID.fromString(userIdStr) : null;
        return ResponseEntity.ok(orderService.submitOrder(id, userId));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body,
            @RequestHeader(value = "X-User-Id", required = false) String userIdStr
    ) {
        UUID userId = userIdStr != null && !userIdStr.isBlank() ? UUID.fromString(userIdStr) : null;
        String reason = body != null ? body.get("reason") : "User cancellation";
        return ResponseEntity.ok(orderService.cancelOrder(id, userId, reason));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(orderService.getOrderStats());
    }
}
