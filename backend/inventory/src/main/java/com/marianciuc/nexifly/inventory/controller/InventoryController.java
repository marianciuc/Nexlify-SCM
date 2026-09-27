package com.marianciuc.nexifly.inventory.controller;

import com.marianciuc.nexifly.inventory.domain.dto.request.ReserveStockRequest;
import com.marianciuc.nexifly.inventory.domain.dto.response.StockItemResponse;
import com.marianciuc.nexifly.inventory.domain.dto.response.WarehouseResponse;
import com.marianciuc.nexifly.inventory.service.StockService;
import com.marianciuc.nexifly.inventory.service.WarehouseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Inventory stock controller — backward-compatible with original API contract.
 * Frontend expects:
 *   GET  /api/v1/inventory/items
 *   GET  /api/v1/inventory/warehouses
 *   POST /api/v1/inventory/reserve
 *   POST /api/v1/inventory/release
 */
@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
@Slf4j
public class InventoryController {

    private final StockService stockService;
    private final WarehouseService warehouseService;

    @GetMapping("/items")
    public ResponseEntity<List<StockItemResponse>> getStockItems(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID warehouseId
    ) {
        log.info("Fetching stock items, search: {}, warehouseId: {}", search, warehouseId);
        return ResponseEntity.ok(stockService.searchStockItems(search, warehouseId));
    }

    @GetMapping("/items/{id}")
    public ResponseEntity<StockItemResponse> getStockItemById(@PathVariable UUID id) {
        return ResponseEntity.ok(stockService.getStockItemById(id));
    }

    @GetMapping("/warehouses")
    public ResponseEntity<List<WarehouseResponse>> getWarehouses() {
        return ResponseEntity.ok(warehouseService.getAllWarehouses());
    }

    @GetMapping("/warehouses/{id}")
    public ResponseEntity<WarehouseResponse> getWarehouseById(@PathVariable UUID id) {
        return ResponseEntity.ok(warehouseService.getWarehouseById(id));
    }

    @PostMapping("/reserve")
    public ResponseEntity<Map<String, Object>> reserveStock(@Valid @RequestBody ReserveStockRequest request) {
        return ResponseEntity.ok(stockService.reserveStock(request));
    }

    @PostMapping("/release")
    public ResponseEntity<Map<String, Object>> releaseStock(@Valid @RequestBody ReserveStockRequest request) {
        return ResponseEntity.ok(stockService.releaseStock(request));
    }
}
