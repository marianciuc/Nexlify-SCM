package com.marianciuc.nexifly.gateway.controllers;

import lombok.Builder;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/actuator/health/services")
public class HealthAggregationController {

    private final WebClient webClient;
    private final Map<String, String> serviceUrls = new HashMap<>();

    public HealthAggregationController(
            WebClient.Builder webClientBuilder,
            @Value("${USER_SERVICE_URL:http://localhost:8081}") String userServiceUrl,
            @Value("${ORDER_SERVICE_URL:http://localhost:8082}") String orderServiceUrl,
            @Value("${INVENTORY_SERVICE_URL:http://localhost:8083}") String inventoryServiceUrl,
            @Value("${LOGISTICS_SERVICE_URL:http://localhost:8084}") String logisticsServiceUrl,
            @Value("${BILLING_SERVICE_URL:http://localhost:8085}") String billingServiceUrl,
            @Value("${NOTIFICATION_SERVICE_URL:http://localhost:8086}") String notificationServiceUrl,
            @Value("${ANALYTICS_SERVICE_URL:http://localhost:8087}") String analyticsServiceUrl,
            @Value("${RFQ_SERVICE_URL:http://localhost:8088}") String rfqServiceUrl
    ) {
        this.webClient = webClientBuilder.build();
        serviceUrls.put("users", userServiceUrl);
        serviceUrls.put("orders", orderServiceUrl);
        serviceUrls.put("inventory", inventoryServiceUrl);
        serviceUrls.put("logistics", logisticsServiceUrl);
        serviceUrls.put("billing", billingServiceUrl);
        serviceUrls.put("notification", notificationServiceUrl);
        serviceUrls.put("analytics", analyticsServiceUrl);
        serviceUrls.put("rfq", rfqServiceUrl);
    }

    @Data
    @Builder
    public static class ServiceHealthStatus {
        private String service;
        private String status;
        private String url;
        private String details;
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<Map<String, Object>> aggregateHealth() {
        return Flux.fromIterable(serviceUrls.entrySet())
                .flatMap(entry -> checkHealth(entry.getKey(), entry.getValue()))
                .collectList()
                .map(statuses -> {
                    Map<String, Object> result = new HashMap<>();
                    boolean allUp = statuses.stream().allMatch(s -> "UP".equalsIgnoreCase(s.getStatus()));
                    result.put("status", allUp ? "UP" : "DEGRADED");
                    Map<String, ServiceHealthStatus> serviceDetails = new HashMap<>();
                    for (ServiceHealthStatus s : statuses) {
                        serviceDetails.put(s.getService(), s);
                    }
                    result.put("services", serviceDetails);
                    return result;
                });
    }

    private Mono<ServiceHealthStatus> checkHealth(String serviceName, String baseUrl) {
        return webClient.get()
                .uri(baseUrl + "/actuator/health")
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(2))
                .map(body -> ServiceHealthStatus.builder()
                        .service(serviceName)
                        .url(baseUrl)
                        .status("UP")
                        .details("Healthy")
                        .build())
                .onErrorResume(ex -> Mono.just(ServiceHealthStatus.builder()
                        .service(serviceName)
                        .url(baseUrl)
                        .status("DOWN")
                        .details(ex.getMessage())
                        .build()));
    }
}
