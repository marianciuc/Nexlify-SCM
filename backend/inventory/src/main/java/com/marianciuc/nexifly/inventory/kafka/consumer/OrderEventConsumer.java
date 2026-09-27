package com.marianciuc.nexifly.inventory.kafka.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marianciuc.nexifly.inventory.config.KafkaTopicConfig;
import com.marianciuc.nexifly.inventory.exception.InsufficientStockException;
import com.marianciuc.nexifly.inventory.kafka.events.OrderCreatedEvent;
import com.marianciuc.nexifly.inventory.kafka.events.StockReservationFailedEvent;
import com.marianciuc.nexifly.inventory.kafka.events.StockReservedEvent;
import com.marianciuc.nexifly.inventory.service.StockReservationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Component
@Slf4j
@RequiredArgsConstructor
public class OrderEventConsumer {

    private final StockReservationService reservationService;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(topics = KafkaTopicConfig.ORDER_EVENTS_TOPIC, groupId = "inventory-service")
    public void consumeOrderEvent(String message) {
        log.info("Inventory received order event: {}", message);
        try {
            Map<String, Object> eventMap = objectMapper.readValue(message, Map.class);
            String eventType = (String) eventMap.get("eventType");

            if ("ORDER_CREATED".equalsIgnoreCase(eventType) || eventMap.containsKey("items")) {
                OrderCreatedEvent event = objectMapper.convertValue(eventMap, OrderCreatedEvent.class);
                handleOrderCreated(event);
            } else if ("ORDER_CANCELLED".equalsIgnoreCase(eventType)) {
                String orderIdStr = (String) eventMap.get("orderId");
                if (orderIdStr != null) {
                    reservationService.releaseReservation(UUID.fromString(orderIdStr));
                    log.info("Released stock reservations for cancelled order: {}", orderIdStr);
                }
            }
        } catch (Exception e) {
            log.error("Error processing order event in inventory: {}", e.getMessage(), e);
        }
    }

    private void handleOrderCreated(OrderCreatedEvent event) {
        if (event == null || event.items() == null || event.items().isEmpty()) {
            return;
        }

        log.info("Processing inventory reservation for order: {}", event.orderId());

        for (OrderCreatedEvent.OrderItemDto item : event.items()) {
            try {
                StockReservationService.ReservationResult result = reservationService.softReserve(
                        event.orderId(),
                        item.productId(),
                        item.sku(),
                        item.quantity(),
                        null
                );

                StockReservedEvent reservedEvent = new StockReservedEvent(
                        event.orderId(),
                        result.getReservationId(),
                        result.getProductId(),
                        result.getSku(),
                        result.getQuantity(),
                        Instant.now()
                );

                kafkaTemplate.send(KafkaTopicConfig.INVENTORY_EVENTS_TOPIC, event.orderId().toString(), reservedEvent);
                log.info("Published StockReservedEvent for order {} and sku {}", event.orderId(), item.sku());

            } catch (InsufficientStockException e) {
                log.warn("Insufficient stock for order {}: {}", event.orderId(), e.getMessage());

                StockReservationFailedEvent failedEvent = new StockReservationFailedEvent(
                        event.orderId(),
                        item.sku(),
                        item.quantity(),
                        e.getMessage(),
                        Instant.now()
                );

                kafkaTemplate.send(KafkaTopicConfig.INVENTORY_EVENTS_TOPIC, event.orderId().toString(), failedEvent);
                // Rollback any earlier items for this order
                reservationService.releaseReservation(event.orderId());
                break;
            } catch (Exception e) {
                log.error("Unexpected error reserving stock for order {}: {}", event.orderId(), e.getMessage());
                reservationService.releaseReservation(event.orderId());
                break;
            }
        }
    }
}
