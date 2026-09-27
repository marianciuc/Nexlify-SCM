package com.marianciuc.nexifly.notification.kafka.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marianciuc.nexifly.notification.domain.dto.NotificationRequest;
import com.marianciuc.nexifly.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventConsumer {

    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "order-events", groupId = "notification-order-group")
    public void consumeOrderEvents(String message) {
        log.info("NotificationService received order-event: {}", message);
        try {
            JsonNode root = objectMapper.readTree(message);
            String eventType = root.has("eventType") ? root.get("eventType").asText() : "ORDER_EVENT";
            String orderId = root.has("orderId") ? root.get("orderId").asText() : "";
            String orderNumber = root.has("orderNumber") ? root.get("orderNumber").asText() : orderId;
            String tenantId = root.has("tenantId") ? root.get("tenantId").asText() : null;
            String customerIdStr = root.has("customerId") ? root.get("customerId").asText() : null;

            UUID recipientUserId = null;
            if (customerIdStr != null && !customerIdStr.isBlank()) {
                try {
                    recipientUserId = UUID.fromString(customerIdStr);
                } catch (IllegalArgumentException ignored) {}
            }

            String title = "Order Update: " + orderNumber;
            String body = "Status changed to " + eventType;
            if ("ORDER_CREATED".equalsIgnoreCase(eventType)) {
                title = "New Order Placed: " + orderNumber;
                body = "Your order " + orderNumber + " has been registered and is pending stock confirmation.";
            } else if ("ORDER_PAID".equalsIgnoreCase(eventType)) {
                title = "Order Paid: " + orderNumber;
                body = "Payment for order " + orderNumber + " was confirmed.";
            } else if ("ORDER_CANCELLED".equalsIgnoreCase(eventType)) {
                title = "Order Cancelled: " + orderNumber;
                body = "Order " + orderNumber + " was cancelled.";
            }

            if (recipientUserId != null) {
                NotificationRequest req = NotificationRequest.builder()
                        .recipientUserId(recipientUserId)
                        .recipientCompanyId(tenantId != null ? UUID.fromString(tenantId) : null)
                        .notificationType("ORDER_" + eventType)
                        .title(title)
                        .body(body)
                        .data(message)
                        .channel("WEB")
                        .build();
                notificationService.send(req);
            }

            if (tenantId != null) {
                notificationService.broadcast("orders." + tenantId, message);
            }
        } catch (Exception e) {
            log.error("Failed to process order-event in NotificationService: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "inventory-events", groupId = "notification-inventory-group")
    public void consumeInventoryEvents(String message) {
        log.info("NotificationService received inventory-event: {}", message);
        try {
            JsonNode root = objectMapper.readTree(message);
            String eventType = root.has("eventType") ? root.get("eventType").asText() : "INVENTORY_EVENT";
            String tenantId = root.has("tenantId") ? root.get("tenantId").asText() : null;

            if (tenantId != null) {
                notificationService.broadcast("inventory." + tenantId, message);
            }
        } catch (Exception e) {
            log.error("Failed to process inventory-event: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "payment-events", groupId = "notification-payment-group")
    public void consumePaymentEvents(String message) {
        log.info("NotificationService received payment-event: {}", message);
        try {
            JsonNode root = objectMapper.readTree(message);
            String tenantId = root.has("tenantId") ? root.get("tenantId").asText() : null;
            if (tenantId != null) {
                notificationService.broadcast("billing." + tenantId, message);
            }
        } catch (Exception e) {
            log.error("Failed to process payment-event: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "logistics-events", groupId = "notification-logistics-group")
    public void consumeLogisticsEvents(String message) {
        log.info("NotificationService received logistics-event: {}", message);
        try {
            JsonNode root = objectMapper.readTree(message);
            String tenantId = root.has("tenantId") ? root.get("tenantId").asText() : null;
            if (tenantId != null) {
                notificationService.broadcast("logistics." + tenantId, message);
            }
        } catch (Exception e) {
            log.error("Failed to process logistics-event: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "rfq-events", groupId = "notification-rfq-group")
    public void consumeRfqEvents(String message) {
        log.info("NotificationService received rfq-event: {}", message);
        try {
            JsonNode root = objectMapper.readTree(message);
            String tenantId = root.has("tenantId") ? root.get("tenantId").asText() : null;
            if (tenantId != null) {
                notificationService.broadcast("rfq." + tenantId, message);
            }
        } catch (Exception e) {
            log.error("Failed to process rfq-event: {}", e.getMessage(), e);
        }
    }
}
