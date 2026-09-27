package com.marianciuc.nexifly.logistic.controller;

import com.marianciuc.nexifly.logistic.domain.dto.RouteSheetResponse;
import com.marianciuc.nexifly.logistic.service.GraphHopperRoutingService;
import com.marianciuc.nexifly.logistic.service.LogisticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/logistics")
@RequiredArgsConstructor
public class LogisticsController {

    private final LogisticsService logisticsService;
    private final GraphHopperRoutingService routingService;

    @GetMapping("/shipments")
    public ResponseEntity<Page<RouteSheetResponse>> getShipments(
            @RequestParam(required = false) String status,
            Pageable pageable
    ) {
        log.info("Fetching shipments, status filter: {}", status);
        return ResponseEntity.ok(logisticsService.getAllRoutes(status, pageable));
    }

    @GetMapping("/shipments/{id}")
    public ResponseEntity<RouteSheetResponse> getShipmentById(@PathVariable UUID id) {
        return ResponseEntity.ok(logisticsService.getRouteById(id));
    }

    @PatchMapping("/shipments/{id}/dispatch")
    public ResponseEntity<RouteSheetResponse> dispatchShipment(@PathVariable UUID id) {
        return ResponseEntity.ok(logisticsService.dispatchRoute(id));
    }

    @PostMapping("/routes/calculate")
    public ResponseEntity<GraphHopperRoutingService.RouteCalculationResult> calculateRoute(@RequestBody Map<String, String> request) {
        String origin = request.getOrDefault("origin", "Warszawa");
        String destination = request.getOrDefault("destination", "Wrocław");
        String profile = request.getOrDefault("optimalProfile", "truck_heavy_40t");

        // Coordinates for common Polish logistics hubs
        double fromLat = 52.2297;
        double fromLon = 21.0122;
        double toLat = 51.1079;
        double toLon = 17.0385;

        if (origin.toLowerCase().contains("gdansk") || origin.toLowerCase().contains("gdańsk")) {
            fromLat = 54.3520; fromLon = 18.6466;
        } else if (origin.toLowerCase().contains("szczecin")) {
            fromLat = 53.4285; fromLon = 14.5528;
        }

        if (destination.toLowerCase().contains("katowice")) {
            toLat = 50.2649; toLon = 19.0238;
        } else if (destination.toLowerCase().contains("poznan") || destination.toLowerCase().contains("poznań")) {
            toLat = 52.4064; toLon = 16.9252;
        }

        GraphHopperRoutingService.RouteCalculationResult result =
                routingService.calculateRoute(fromLat, fromLon, toLat, toLon, profile);

        return ResponseEntity.ok(result);
    }

    @PostMapping("/optimize-routes")
    public ResponseEntity<GraphHopperRoutingService.RouteCalculationResult> optimizeRoutes(@RequestBody Map<String, String> request) {
        return calculateRoute(request);
    }
}
