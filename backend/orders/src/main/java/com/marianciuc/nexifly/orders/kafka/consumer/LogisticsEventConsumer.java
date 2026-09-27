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
public class LogisticsEventConsumer {

    private final OrderSagaOrchestrator sagaOrchestrator;
    private final ConsumedEventRepository consumedEventRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(topics = KafkaTopicConfig.LOGISTICS_EVENTS_TOPIC, groupId = "order-service-logistics")
    @Transactional
    public void consumeLogisticsEvent(String message) {
        log.info("Order service received logistics event: {}", message);
        try {
            Map<String, Object> eventMap = objectMapper.readValue(message, Map.class);
            String eventId = (String) eventMap.getOrDefault("eventId", UUID.randomUUID().toString());

            if (consumedEventRepository.existsById(eventId)) {
                return;
            }

            String orderIdStr = (String) eventMap.get("orderId");
            if (orderIdStr != null) {
                UUID orderId = UUID.fromString(orderIdStr);
                String eventType = (String) eventMap.get("eventType");

                if ("SHIPMENT_DISPATCHED".equalsIgnoreCase(eventType)) {
                    String tracking = (String) eventMap.getOrDefault("trackingNumber", "TRK-" + UUID.randomUUID().toString().substring(0, 8));
                    sagaOrchestrator.handleShipmentDispatched(orderId, tracking);
                } else if ("SHIPMENT_DELIVERED".equalsIgnoreCase(eventType)) {
                    sagaOrchestrator.handleDeliveryConfirmed(orderId);
                }
            }

            consumedEventRepository.save(new ConsumedEventEn(eventId));
        } catch (Exception e) {
            log.error("Error processing logistics event in order service: {}", e.getMessage(), e);
        }
    }
}
