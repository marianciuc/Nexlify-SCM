package com.marianciuc.nexifly.inventory.kafka.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marianciuc.nexifly.inventory.config.KafkaTopicConfig;
import com.marianciuc.nexifly.inventory.kafka.events.PaymentSucceededEvent;
import com.marianciuc.nexifly.inventory.service.StockReservationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

@Component
@Slf4j
@RequiredArgsConstructor
public class PaymentEventConsumer {

    private final StockReservationService reservationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(topics = KafkaTopicConfig.PAYMENT_EVENTS_TOPIC, groupId = "inventory-service-payment")
    public void consumePaymentEvent(String message) {
        log.info("Inventory received payment event: {}", message);
        try {
            Map<String, Object> eventMap = objectMapper.readValue(message, Map.class);
            String eventType = (String) eventMap.get("eventType");
            String orderIdStr = (String) eventMap.get("orderId");

            if (orderIdStr != null) {
                UUID orderId = UUID.fromString(orderIdStr);

                if ("PAYMENT_SUCCEEDED".equalsIgnoreCase(eventType) || (!"PAYMENT_FAILED".equalsIgnoreCase(eventType) && eventMap.containsKey("paymentId"))) {
                    reservationService.hardReserve(orderId);
                    log.info("Hard reserved stock for order {} after successful payment", orderId);
                } else if ("PAYMENT_FAILED".equalsIgnoreCase(eventType)) {
                    reservationService.releaseReservation(orderId);
                    log.info("Released stock for order {} after failed payment", orderId);
                }
            }
        } catch (Exception e) {
            log.error("Error processing payment event in inventory: {}", e.getMessage(), e);
        }
    }
}
