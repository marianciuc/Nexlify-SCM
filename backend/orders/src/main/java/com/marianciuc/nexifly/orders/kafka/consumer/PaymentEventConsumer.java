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
public class PaymentEventConsumer {

    private final OrderSagaOrchestrator sagaOrchestrator;
    private final ConsumedEventRepository consumedEventRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(topics = KafkaTopicConfig.PAYMENT_EVENTS_TOPIC, groupId = "order-service-payment")
    @Transactional
    public void consumePaymentEvent(String message) {
        log.info("Order service received payment event: {}", message);
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
                String eventType = (String) eventMap.get("eventType");

                if ("PAYMENT_SUCCEEDED".equalsIgnoreCase(eventType) || (!"PAYMENT_FAILED".equalsIgnoreCase(eventType) && eventMap.containsKey("paymentId"))) {
                    String paymentIdStr = (String) eventMap.get("paymentId");
                    UUID paymentId = paymentIdStr != null ? UUID.fromString(paymentIdStr) : UUID.randomUUID();
                    sagaOrchestrator.handlePaymentSucceeded(orderId, paymentId);
                } else if ("PAYMENT_FAILED".equalsIgnoreCase(eventType)) {
                    String reason = (String) eventMap.getOrDefault("reason", "Payment declined");
                    sagaOrchestrator.handlePaymentFailed(orderId, reason);
                }
            }

            consumedEventRepository.save(new ConsumedEventEn(eventId));
        } catch (Exception e) {
            log.error("Error processing payment event in order service: {}", e.getMessage(), e);
        }
    }
}
