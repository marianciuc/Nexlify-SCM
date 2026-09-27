package com.marianciuc.nexifly.logistic.controller;

import com.marianciuc.nexifly.logistic.domain.dto.CreateRouteRequest;
import com.marianciuc.nexifly.logistic.domain.dto.FuelReportResponse;
import com.marianciuc.nexifly.logistic.domain.dto.RouteSheetResponse;
import com.marianciuc.nexifly.logistic.service.LogisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/logistics")
@RequiredArgsConstructor
public class RouteController {

    private final LogisticsService logisticsService;

    @GetMapping("/routes")
    public ResponseEntity<Page<RouteSheetResponse>> getRoutes(
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(logisticsService.getAllRoutes(status, pageable));
    }

    @GetMapping("/routes/{id}")
    public ResponseEntity<RouteSheetResponse> getRouteById(@PathVariable UUID id) {
        return ResponseEntity.ok(logisticsService.getRouteById(id));
    }

    @PostMapping("/routes")
    public ResponseEntity<RouteSheetResponse> createRoute(@RequestBody CreateRouteRequest request) {
        return ResponseEntity.ok(logisticsService.createRoute(request));
    }

    @PatchMapping("/routes/{id}/dispatch")
    public ResponseEntity<RouteSheetResponse> dispatchRoute(@PathVariable UUID id) {
        return ResponseEntity.ok(logisticsService.dispatchRoute(id));
    }

    @PatchMapping("/routes/{id}/stops/{stopId}/deliver")
    public ResponseEntity<RouteSheetResponse> confirmDelivery(
            @PathVariable UUID id,
            @PathVariable UUID stopId,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String signature = body != null ? body.get("signatureName") : "Consignee Signature";
        String proofUrl = body != null ? body.get("proofOfDeliveryUrl") : null;
        return ResponseEntity.ok(logisticsService.confirmDelivery(id, stopId, signature, proofUrl));
    }

    @GetMapping("/reports/fuel")
    public ResponseEntity<FuelReportResponse> getFuelReport(@RequestParam(required = false) String period) {
        return ResponseEntity.ok(logisticsService.getFuelReport(period));
    }
}
