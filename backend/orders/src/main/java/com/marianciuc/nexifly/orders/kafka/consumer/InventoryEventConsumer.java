package com.marianciuc.nexifly.orders.kafka.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marianciuc.nexifly.orders.config.KafkaTopicConfig;
import com.marianciuc.nexifly.orders.domain.entity.ConsumedEventEn;
import com.marianciuc.nexifly.orders.repository.ConsumedEventRepository;
import com.marianciuc.nexifly.orders.saga.OrderSagaOrchestrator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Component
@Slf4j
@RequiredArgsConstructor
public class InventoryEventConsumer {

    private final OrderSagaOrchestrator sagaOrchestrator;
    private final ConsumedEventRepository consumedEventRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(topics = KafkaTopicConfig.INVENTORY_EVENTS_TOPIC, groupId = "order-service-inventory")
    @Transactional
    public void consumeInventoryEvent(String message) {
        log.info("Order service received inventory event: {}", message);
        try {
            Map<String, Object> eventMap = objectMapper.readValue(message, Map.class);
            String eventId = (String) eventMap.getOrDefault("eventId", UUID.randomUUID().toString());

            if (consumedEventRepository.existsById(eventId)) {
                log.debug("Event {} already processed, skipping (idempotency)", eventId);
                return;
            }

            String orderIdStr = (String) eventMap.get("orderId");
            if (orderIdStr != null) {
                UUID orderId = UUID.fromString(orderIdStr);

                if (eventMap.containsKey("reservationId")) {
                    String resIdStr = (String) eventMap.get("reservationId");
                    UUID resId = resIdStr != null ? UUID.fromString(resIdStr) : UUID.randomUUID();
                    sagaOrchestrator.handleStockReserved(orderId, resId);
                } else if (eventMap.containsKey("reason") || eventMap.containsKey("requestedQuantity")) {
                    String reason = (String) eventMap.getOrDefault("reason", "Out of stock");
                    sagaOrchestrator.handleStockReservationFailed(orderId, reason);
                }
            }

            consumedEventRepository.save(new ConsumedEventEn(eventId));
        } catch (Exception e) {
            log.error("Error processing inventory event in order service: {}", e.getMessage(), e);
        }
    }
}
