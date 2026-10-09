package com.marianciuc.nexifly.orders.service.impl;

import com.marianciuc.nexifly.orders.domain.dto.OrderCreateRequest;
import com.marianciuc.nexifly.orders.domain.dto.OrderResponse;
import com.marianciuc.nexifly.orders.domain.entity.OrderEn;
import com.marianciuc.nexifly.orders.domain.entity.OrderItemEn;
import com.marianciuc.nexifly.orders.domain.enums.Currency;
import com.marianciuc.nexifly.orders.domain.enums.OrderStatus;
import com.marianciuc.nexifly.orders.domain.fsm.OrderFsm;
import com.marianciuc.nexifly.orders.exception.OrderNotFoundException;
import com.marianciuc.nexifly.orders.kafka.OutboxEventPublisher;
import com.marianciuc.nexifly.orders.kafka.events.OrderCancelledEvent;
import com.marianciuc.nexifly.orders.mapper.OrderMapper;
import com.marianciuc.nexifly.orders.repository.OrderRepository;
import com.marianciuc.nexifly.orders.saga.OrderSagaOrchestrator;
import com.marianciuc.nexifly.orders.service.OrderService;
import com.marianciuc.nexifly.orders.service.PriceAgreementService;
import com.marianciuc.nexifly.orders.service.SlaCalculationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.Year;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderSagaOrchestrator sagaOrchestrator;
    private final PriceAgreementService priceAgreementService;
    private final SlaCalculationService slaCalculationService;
    private final OutboxEventPublisher outboxPublisher;
    private final OrderMapper orderMapper;

    @Override
    @Transactional
    public OrderResponse createOrder(OrderCreateRequest request, UUID tenantId) {
        log.info("Creating order for customer: {}, items count: {}", request.customerId(), request.items().size());

        String orderNumber = "ORD-" + Year.now().getValue() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Instant slaDeadline = slaCalculationService.calculateSlaDeadline(request.requestedDeliveryDate(), false);

        OrderEn order = OrderEn.builder()
                .orderNumber(orderNumber)
                .tenantId(tenantId)
                .customerId(request.customerId())
                .supplierId(request.supplierId())
                .status(OrderStatus.DRAFT)
                .currency(request.currency() != null ? Currency.fromString(request.currency()) : Currency.PLN)
                .deliveryAddress(request.deliveryAddress())
                .deliveryCity(request.deliveryCity())
                .deliveryPostalCode(request.deliveryPostalCode())
                .requestedDeliveryDate(request.requestedDeliveryDate() != null ? request.requestedDeliveryDate() : LocalDate.now().plusDays(7))
                .slaDeadline(slaDeadline)
                .notes(request.notes())
                .build();

        List<OrderItemEn> items = new ArrayList<>();
        for (OrderCreateRequest.OrderItemRequest itemReq : request.items()) {
            PriceAgreementService.AppliedPrice priceInfo = priceAgreementService.resolvePrice(
                    request.customerId(), request.supplierId(), itemReq.sku(), itemReq.unitPrice()
            );

            OrderItemEn item = OrderItemEn.builder()
                    .order(order)
                    .productId(itemReq.productId())
                    .sku(itemReq.sku())
                    .productName(itemReq.productName() != null ? itemReq.productName() : itemReq.sku())
                    .quantity(itemReq.quantity())
                    .unitPrice(priceInfo.unitPrice())
                    .discountPercent(priceInfo.discountPercent())
                    .vatRate(BigDecimal.valueOf(23.00))
                    .warehouseId(itemReq.warehouseId())
                    .build();
            item.calculateLineTotal();
            items.add(item);
        }

        order.setItems(items);
        order.recalculateTotals();

        OrderEn saved = orderRepository.save(order);
        log.info("Order created successfully: {} with total {}", saved.getOrderNumber(), saved.getTotalAmount());
        return orderMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID id) {
        OrderEn order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));
        return orderMapper.toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getOrders(UUID customerId, UUID supplierId, OrderStatus status, Pageable pageable) {
        Page<OrderEn> page;
        if (customerId != null) {
            page = orderRepository.findByCustomerId(customerId, pageable);
        } else if (supplierId != null) {
            page = orderRepository.findBySupplierId(supplierId, pageable);
        } else if (status != null) {
            page = orderRepository.findByStatus(status, pageable);
        } else {
            page = orderRepository.findAll(pageable);
        }
        return page.map(orderMapper::toResponse);
    }

    @Override
    @Transactional
    public OrderResponse submitOrder(UUID id, UUID userId) {
        OrderEn order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));

        if (order.getStatus() != OrderStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT orders can be submitted. Current status: " + order.getStatus());
        }

        sagaOrchestrator.startOrderSaga(order);
        return orderMapper.toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(UUID id, UUID userId, String reason) {
        OrderEn order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));

        OrderFsm.validate(order.getStatus(), OrderStatus.CANCELLED);
        order.transitionTo(OrderStatus.CANCELLED, userId, reason != null ? reason : "Cancelled by user");
        OrderEn saved = orderRepository.save(order);

        OrderCancelledEvent event = new OrderCancelledEvent(
                "ORDER_CANCELLED",
                saved.getId(),
                saved.getOrderNumber(),
                reason,
                Instant.now()
        );
        outboxPublisher.enqueue("Order", saved.getId(), "OrderCancelledEvent", event);

        return orderMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getOrderStats() {
        Map<String, Object> stats = new HashMap<>();
        for (OrderStatus status : OrderStatus.values()) {
            stats.put(status.name(), orderRepository.countByStatus(status));
        }
        stats.put("totalOrders", orderRepository.count());
        return stats;
    }
}
