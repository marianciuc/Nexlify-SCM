package com.marianciuc.nexifly.analytics.controller;

import com.marianciuc.nexifly.analytics.service.KpiCalculationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final KpiCalculationService kpiCalculationService;

    @GetMapping("/kpi")
    public ResponseEntity<Map<String, Object>> getKpis(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantIdHeader
    ) {
        UUID tenantId = tenantIdHeader != null && !tenantIdHeader.isBlank() ? UUID.fromString(tenantIdHeader) : null;
        log.info("Fetching supply chain analytics KPIs for tenant: {}", tenantId);
        return ResponseEntity.ok(kpiCalculationService.calculateKpis(tenantId));
    }

    @GetMapping("/otif")
    public ResponseEntity<List<Map<String, Object>>> getOtifTimeSeries(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantIdHeader
    ) {
        UUID tenantId = tenantIdHeader != null && !tenantIdHeader.isBlank() ? UUID.fromString(tenantIdHeader) : null;
        return ResponseEntity.ok(kpiCalculationService.getOtifTrends(tenantId));
    }

    @GetMapping("/lead-time")
    public ResponseEntity<List<Map<String, Object>>> getLeadTimeDistribution(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantIdHeader
    ) {
        UUID tenantId = tenantIdHeader != null && !tenantIdHeader.isBlank() ? UUID.fromString(tenantIdHeader) : null;
        return ResponseEntity.ok(kpiCalculationService.getLeadTimeDistribution(tenantId));
    }

    @GetMapping("/abc-analysis")
    public ResponseEntity<Map<String, Object>> getAbcAnalysis(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantIdHeader
    ) {
        UUID tenantId = tenantIdHeader != null && !tenantIdHeader.isBlank() ? UUID.fromString(tenantIdHeader) : null;
        return ResponseEntity.ok(kpiCalculationService.getAbcAnalysis(tenantId));
    }

    @GetMapping("/turnover")
    public ResponseEntity<List<Map<String, Object>>> getInventoryTurnover(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantIdHeader
    ) {
        UUID tenantId = tenantIdHeader != null && !tenantIdHeader.isBlank() ? UUID.fromString(tenantIdHeader) : null;
        return ResponseEntity.ok(kpiCalculationService.getInventoryTurnover(tenantId));
    }

    @GetMapping("/trends")
    public ResponseEntity<List<Map<String, Object>>> getOtifTrends(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantIdHeader
    ) {
        UUID tenantId = tenantIdHeader != null && !tenantIdHeader.isBlank() ? UUID.fromString(tenantIdHeader) : null;
        return ResponseEntity.ok(kpiCalculationService.getOtifTrends(tenantId));
    }
}
