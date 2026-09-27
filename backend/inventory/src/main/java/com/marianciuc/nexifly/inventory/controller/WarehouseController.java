package com.marianciuc.nexifly.inventory.controller;

import com.marianciuc.nexifly.inventory.domain.dto.request.CreateWarehouseRequest;
import com.marianciuc.nexifly.inventory.domain.dto.response.WarehouseResponse;
import com.marianciuc.nexifly.inventory.service.WarehouseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Warehouse management controller.
 */
@RestController
@RequestMapping("/api/v1/inventory/warehouses")
@RequiredArgsConstructor
@Slf4j
public class WarehouseController {

    private final WarehouseService warehouseService;

    @GetMapping
    public ResponseEntity<java.util.List<WarehouseResponse>> getAllWarehouses() {
        return ResponseEntity.ok(warehouseService.getAllWarehouses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WarehouseResponse> getWarehouseById(@PathVariable UUID id) {
        return ResponseEntity.ok(warehouseService.getWarehouseById(id));
    }

    @GetMapping("/coordinates")
    public ResponseEntity<java.util.List<java.util.Map<String, Object>>> getWarehouseCoordinates() {
        java.util.List<java.util.Map<String, Object>> coords = warehouseService.getAllWarehouses().stream()
                .filter(WarehouseResponse::isActive)
                .map(w -> java.util.Map.<String, Object>of(
                        "id", w.id(),
                        "code", w.code(),
                        "name", w.name(),
                        "city", w.city(),
                        "latitude", w.latitude() != null ? w.latitude() : java.math.BigDecimal.valueOf(52.2297),
                        "longitude", w.longitude() != null ? w.longitude() : java.math.BigDecimal.valueOf(21.0122)
                ))
                .toList();
        return ResponseEntity.ok(coords);
    }

    @PostMapping
    public ResponseEntity<WarehouseResponse> createWarehouse(@Valid @RequestBody CreateWarehouseRequest request) {
        WarehouseResponse created = warehouseService.createWarehouse(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WarehouseResponse> updateWarehouse(
            @PathVariable UUID id,
            @Valid @RequestBody CreateWarehouseRequest request
    ) {
        return ResponseEntity.ok(warehouseService.updateWarehouse(id, request));
    }
}
