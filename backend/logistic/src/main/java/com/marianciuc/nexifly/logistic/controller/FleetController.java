package com.marianciuc.nexifly.logistic.controller;

import com.marianciuc.nexifly.logistic.domain.dto.DriverResponse;
import com.marianciuc.nexifly.logistic.domain.dto.VehicleResponse;
import com.marianciuc.nexifly.logistic.service.LogisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/logistics")
@RequiredArgsConstructor
public class FleetController {

    private final LogisticsService logisticsService;

    @GetMapping("/fleet")
    public ResponseEntity<List<VehicleResponse>> getFleet() {
        return ResponseEntity.ok(logisticsService.getFleet());
    }

    @GetMapping("/drivers")
    public ResponseEntity<List<DriverResponse>> getDrivers() {
        return ResponseEntity.ok(logisticsService.getDrivers());
    }
}
