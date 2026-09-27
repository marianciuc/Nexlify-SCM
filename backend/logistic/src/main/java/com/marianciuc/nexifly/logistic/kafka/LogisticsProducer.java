package com.marianciuc.nexifly.logistic.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marianciuc.nexifly.logistic.kafka.events.RouteOptimizedEvent;
import com.marianciuc.nexifly.logistic.kafka.events.ShipmentDeliveredEvent;
import com.marianciuc.nexifly.logistic.kafka.events.ShipmentDispatchedEvent;
import com.marianciuc.nexifly.logistic.kafka.events.VehicleLocationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class LogisticsProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void publishShipmentDispatched(ShipmentDispatchedEvent event) {
        log.info("Publishing ShipmentDispatchedEvent: route={}, orders={}", event.routeNumber(), event.orderIds());
        send("logistics-events", event.routeSheetId().toString(), event);
    }

    public void publishShipmentDelivered(ShipmentDeliveredEvent event) {
        log.info("Publishing ShipmentDeliveredEvent: route={}, orderId={}", event.routeSheetId(), event.orderId());
        send("logistics-events", event.orderId().toString(), event);
    }

    public void publishVehicleLocation(VehicleLocationEvent event) {
        send("logistics-events", event.vehicleId().toString(), event);
    }

    public void publishRouteOptimized(RouteOptimizedEvent event) {
        log.info("Publishing RouteOptimizedEvent: route={}, orders={}", event.routeNumber(), event.orderIds());
        send("logistics-events", event.routeSheetId().toString(), event);
    }

    private void send(String topic, String key, Object payload) {
        try {
            String json = objectMapper.writeValueAsString(payload);
            kafkaTemplate.send(topic, key, json);
        } catch (Exception e) {
            log.error("Failed to serialize or send event to topic {}: {}", topic, e.getMessage(), e);
        }
    }
}
