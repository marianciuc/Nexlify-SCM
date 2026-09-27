package com.marianciuc.nexifly.logistic.kafka.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marianciuc.nexifly.logistic.domain.dto.CreateRouteRequest;
import com.marianciuc.nexifly.logistic.domain.dto.DeliveryStopRequest;
import com.marianciuc.nexifly.logistic.domain.entity.DriverEn;
import com.marianciuc.nexifly.logistic.domain.entity.VehicleEn;
import com.marianciuc.nexifly.logistic.repository.DriverRepository;
import com.marianciuc.nexifly.logistic.repository.VehicleRepository;
import com.marianciuc.nexifly.logistic.service.LogisticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentEventConsumer {

    private final LogisticsService logisticsService;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "payment-events", groupId = "logistics-payment-group")
    public void consumePaymentEvent(String message) {
        log.info("LogisticsService received payment event: {}", message);
        try {
            JsonNode root = objectMapper.readTree(message);
            String eventType = root.has("eventType") ? root.get("eventType").asText() : "";
            String orderIdStr = root.has("orderId") ? root.get("orderId").asText() : null;

            if (!"PAYMENT_SUCCEEDED".equalsIgnoreCase(eventType) || orderIdStr == null || orderIdStr.isBlank()) {
                return;
            }

            UUID orderId = UUID.fromString(orderIdStr);

            // Check if route already exists
            try {
                logisticsService.getTrackingByOrderId(orderId);
                log.info("Route already exists for order: {}", orderId);
                return;
            } catch (IllegalArgumentException ignored) {}

            List<VehicleEn> vehicles = vehicleRepository.findByStatus("AVAILABLE");
            List<DriverEn> drivers = driverRepository.findByIsAvailableTrue();

            if (vehicles.isEmpty() || drivers.isEmpty()) {
                log.warn("No available vehicle or driver to dispatch order: {}", orderId);
                return;
            }

            VehicleEn vehicle = vehicles.getFirst();
            DriverEn driver = drivers.getFirst();

            CreateRouteRequest routeReq = CreateRouteRequest.builder()
                    .vehicleId(vehicle.getId())
                    .driverId(driver.getId())
                    .notes("Automated dispatch upon payment confirmation for order " + orderId)
                    .stops(List.of(
                            DeliveryStopRequest.builder()
                                    .orderId(orderId)
                                    .stopSequence(1)
                                    .address("Main Warehouse Dispatch Point")
                                    .city("Warszawa")
                                    .latitude(BigDecimal.valueOf(52.2297))
                                    .longitude(BigDecimal.valueOf(21.0122))
                                    .build()
                    ))
                    .build();

            logisticsService.createRoute(routeReq);
            log.info("Automatically scheduled route for paid order: {}", orderId);

        } catch (Exception e) {
            log.error("Failed to process payment event in LogisticsService: {}", e.getMessage(), e);
        }
    }
}
