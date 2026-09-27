package com.marianciuc.nexifly.orders.saga;

import com.marianciuc.nexifly.orders.domain.entity.OrderEn;
import com.marianciuc.nexifly.orders.domain.enums.OrderStatus;
import com.marianciuc.nexifly.orders.kafka.OutboxEventPublisher;
import com.marianciuc.nexifly.orders.kafka.events.*;
import com.marianciuc.nexifly.orders.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Component
@Slf4j
@RequiredArgsConstructor
public class OrderSagaOrchestrator {

    private final OrderRepository orderRepository;
    private final OutboxEventPublisher outboxPublisher;

    @Transactional
    public void startOrderSaga(OrderEn order) {
        log.info("Starting Order Saga for order: {}", order.getOrderNumber());
        order.transitionTo(OrderStatus.SUBMITTED, order.getCustomerId(), "Order submitted by customer");
        orderRepository.save(order);

        List<OrderCreatedEvent.OrderItemDto> items = order.getItems().stream()
                .map(i -> new OrderCreatedEvent.OrderItemDto(
                        i.getProductId(),
                        i.getSku(),
                        i.getQuantity(),
                        i.getUnitPrice()
                ))
                .toList();

        OrderCreatedEvent event = new OrderCreatedEvent(
                "ORDER_CREATED",
                order.getId(),
                order.getOrderNumber(),
                order.getCustomerId(),
                order.getSupplierId(),
                items,
                order.getTotalAmount(),
                order.getCurrency(),
                Instant.now()
        );

        outboxPublisher.enqueue("Order", order.getId(), "OrderCreatedEvent", event);
        log.info("Order Saga started: OrderCreatedEvent enqueued for order {}", order.getId());
    }

    @Transactional
    public void handleStockReserved(UUID orderId, UUID reservationId) {
        orderRepository.findById(orderId).ifPresent(order -> {
            log.info("Saga step: stock reserved for order: {}", order.getOrderNumber());
            order.transitionTo(OrderStatus.RESERVED, null, "Inventory soft-reserved stock");
            orderRepository.save(order);

            OrderStatusChangedEvent event = new OrderStatusChangedEvent(
                    "ORDER_STATUS_CHANGED",
                    order.getId(),
                    order.getOrderNumber(),
                    OrderStatus.SUBMITTED,
                    OrderStatus.RESERVED,
                    null,
                    "Stock reserved",
                    Instant.now()
            );
            outboxPublisher.enqueue("Order", order.getId(), "OrderStatusChangedEvent", event);
        });
    }

    @Transactional
    public void handleStockReservationFailed(UUID orderId, String reason) {
        orderRepository.findById(orderId).ifPresent(order -> {
            log.warn("Saga step: stock reservation failed for order: {}, reason: {}", order.getOrderNumber(), reason);
            order.transitionTo(OrderStatus.CANCELLED_OUT_OF_STOCK, null, "Stock reservation failed: " + reason);
            orderRepository.save(order);

            OrderCancelledEvent event = new OrderCancelledEvent(
                    "ORDER_CANCELLED",
                    order.getId(),
                    order.getOrderNumber(),
                    "Cancelled due to out of stock: " + reason,
                    Instant.now()
            );
            outboxPublisher.enqueue("Order", order.getId(), "OrderCancelledEvent", event);
        });
    }

    @Transactional
    public void handlePaymentSucceeded(UUID orderId, UUID paymentId) {
        orderRepository.findById(orderId).ifPresent(order -> {
            log.info("Saga step: payment succeeded for order: {}", order.getOrderNumber());
            OrderStatus oldStatus = order.getStatus();
            order.transitionTo(OrderStatus.PAID, null, "Payment confirmed: " + paymentId);
            orderRepository.save(order);

            OrderPaidEvent event = new OrderPaidEvent(
                    "ORDER_PAID",
                    order.getId(),
                    order.getOrderNumber(),
                    order.getTotalAmount(),
                    Instant.now()
            );
            outboxPublisher.enqueue("Order", order.getId(), "OrderPaidEvent", event);
        });
    }

    @Transactional
    public void handlePaymentFailed(UUID orderId, String reason) {
        orderRepository.findById(orderId).ifPresent(order -> {
            log.warn("Saga step: payment failed for order: {}, reason: {}", order.getOrderNumber(), reason);
            OrderStatus oldStatus = order.getStatus();
            order.transitionTo(OrderStatus.PAYMENT_FAILED, null, "Payment failure: " + reason);
            orderRepository.save(order);

            OrderStatusChangedEvent event = new OrderStatusChangedEvent(
                    "ORDER_STATUS_CHANGED",
                    order.getId(),
                    order.getOrderNumber(),
                    oldStatus,
                    OrderStatus.PAYMENT_FAILED,
                    null,
                    reason,
                    Instant.now()
            );
            outboxPublisher.enqueue("Order", order.getId(), "OrderStatusChangedEvent", event);
        });
    }

    @Transactional
    public void handleShipmentDispatched(UUID orderId, String trackingNumber) {
        orderRepository.findById(orderId).ifPresent(order -> {
            log.info("Saga step: shipment dispatched for order: {}, tracking: {}", order.getOrderNumber(), trackingNumber);
            order.transitionTo(OrderStatus.SHIPPED, null, "Shipment dispatched: " + trackingNumber);
            orderRepository.save(order);
        });
    }

    @Transactional
    public void handleDeliveryConfirmed(UUID orderId) {
        orderRepository.findById(orderId).ifPresent(order -> {
            log.info("Saga step: delivery confirmed for order: {}", order.getOrderNumber());
            order.transitionTo(OrderStatus.DELIVERED, null, "Delivery confirmed by recipient");
            orderRepository.save(order);
        });
    }
}
