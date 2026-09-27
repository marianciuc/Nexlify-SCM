package com.marianciuc.nexifly.integration.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

/**
 * Publishes integration events to Kafka topics:
 * - order-events: when ORDERS EDI is received → trigger order creation
 * - inventory-events: when catalog import completes → update inventory
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class IntegrationEventProducer {

    private static final String ORDER_EVENTS_TOPIC = "order-events";
    private static final String INVENTORY_EVENTS_TOPIC = "inventory-events";

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void publishEdiOrderReceived(UUID ediMessageId, String relatedOrderNumber,
                                        String senderGln, String parsedPayload) {
        try {
            Map<String, Object> event = Map.of(
                    "eventType", "EDI_ORDER_RECEIVED",
                    "ediMessageId", ediMessageId.toString(),
                    "relatedOrderNumber", relatedOrderNumber != null ? relatedOrderNumber : "",
                    "senderGln", senderGln,
                    "parsedPayload", parsedPayload != null ? parsedPayload : "{}",
                    "timestamp", System.currentTimeMillis()
            );
            String payload = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(ORDER_EVENTS_TOPIC, ediMessageId.toString(), payload);
            log.info("Published EDI_ORDER_RECEIVED event for message {}", ediMessageId);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize EDI_ORDER_RECEIVED event: {}", e.getMessage(), e);
        }
    }

    public void publishEdiShipmentAdviceReceived(UUID ediMessageId, String relatedOrderNumber) {
        try {
            Map<String, Object> event = Map.of(
                    "eventType", "EDI_DESADV_RECEIVED",
                    "ediMessageId", ediMessageId.toString(),
                    "relatedOrderNumber", relatedOrderNumber != null ? relatedOrderNumber : "",
                    "timestamp", System.currentTimeMillis()
            );
            String payload = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(ORDER_EVENTS_TOPIC, ediMessageId.toString(), payload);
            log.info("Published EDI_DESADV_RECEIVED event for message {}", ediMessageId);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize EDI_DESADV_RECEIVED event: {}", e.getMessage(), e);
        }
    }

    public void publishCatalogImportCompleted(UUID importJobId, UUID companyId,
                                              int successfulRows, int failedRows) {
        try {
            Map<String, Object> event = Map.of(
                    "eventType", "CATALOG_IMPORT_COMPLETED",
                    "importJobId", importJobId.toString(),
                    "companyId", companyId.toString(),
                    "successfulRows", successfulRows,
                    "failedRows", failedRows,
                    "timestamp", System.currentTimeMillis()
            );
            String payload = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(INVENTORY_EVENTS_TOPIC, importJobId.toString(), payload);
            log.info("Published CATALOG_IMPORT_COMPLETED event for job {} ({} ok, {} failed)",
                    importJobId, successfulRows, failedRows);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize CATALOG_IMPORT_COMPLETED event: {}", e.getMessage(), e);
        }
    }
}
