package com.marianciuc.nexifly.logistic.controller;

import com.marianciuc.nexifly.logistic.domain.dto.RouteSheetResponse;
import com.marianciuc.nexifly.logistic.domain.dto.UpdateLocationRequest;
import com.marianciuc.nexifly.logistic.service.LogisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/logistics")
@RequiredArgsConstructor
public class TrackingController {

    private final LogisticsService logisticsService;

    @PostMapping("/vehicles/{id}/location")
    public ResponseEntity<Map<String, String>> updateVehicleLocation(
            @PathVariable UUID id,
            @RequestBody UpdateLocationRequest request
    ) {
        logisticsService.updateVehicleLocation(id, request);
        return ResponseEntity.ok(Map.of("message", "Location updated successfully"));
    }

    @GetMapping("/shipments/{orderId}/tracking")
    public ResponseEntity<RouteSheetResponse> getTracking(@PathVariable UUID orderId) {
        return ResponseEntity.ok(logisticsService.getTrackingByOrderId(orderId));
    }
}
