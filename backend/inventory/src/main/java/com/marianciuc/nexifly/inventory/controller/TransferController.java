package com.marianciuc.nexifly.inventory.controller;

import com.marianciuc.nexifly.inventory.exception.ResourceNotFoundException;
import com.marianciuc.nexifly.inventory.repository.ProductRepository;
import com.marianciuc.nexifly.inventory.repository.StockItemRepository;
import com.marianciuc.nexifly.inventory.repository.StockTransferRepository;
import com.marianciuc.nexifly.inventory.repository.WarehouseRepository;
import com.marianciuc.nexifly.inventory.repository.entity.ProductEn;
import com.marianciuc.nexifly.inventory.repository.entity.StockItemEn;
import com.marianciuc.nexifly.inventory.repository.entity.StockTransferEn;
import com.marianciuc.nexifly.inventory.repository.entity.WarehouseEn;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/transfers")
@RequiredArgsConstructor
@Slf4j
public class TransferController {

    private final StockTransferRepository transferRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final StockItemRepository stockItemRepository;

    @Data
    public static class CreateTransferRequest {
        private UUID fromWarehouseId;
        private UUID toWarehouseId;
        private UUID productId;
        private Integer quantity;
        private LocalDate requestedDate;
    }

    @Data
    @Builder
    public static class TransferResponse {
        private UUID id;
        private UUID fromWarehouseId;
        private String fromWarehouseName;
        private UUID toWarehouseId;
        private String toWarehouseName;
        private UUID productId;
        private String productSku;
        private Integer quantity;
        private String status;
        private LocalDate requestedDate;
        private Instant dispatchedAt;
        private Instant receivedAt;
        private Instant createdAt;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<TransferResponse> createTransfer(@RequestBody CreateTransferRequest request) {
        WarehouseEn fromWh = warehouseRepository.findById(request.getFromWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Origin warehouse not found: " + request.getFromWarehouseId()));
        WarehouseEn toWh = warehouseRepository.findById(request.getToWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Destination warehouse not found: " + request.getToWarehouseId()));
        ProductEn product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + request.getProductId()));

        StockTransferEn transfer = StockTransferEn.builder()
                .fromWarehouse(fromWh)
                .toWarehouse(toWh)
                .product(product)
                .quantity(request.getQuantity())
                .status("PENDING")
                .requestedDate(request.getRequestedDate() != null ? request.getRequestedDate() : LocalDate.now())
                .build();

        StockTransferEn saved = transferRepository.save(transfer);
        return ResponseEntity.ok(toResponse(saved));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransferResponse> getTransferById(@PathVariable UUID id) {
        StockTransferEn transfer = transferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transfer not found: " + id));
        return ResponseEntity.ok(toResponse(transfer));
    }

    @GetMapping
    public ResponseEntity<List<TransferResponse>> listTransfers(@RequestParam(required = false) String status) {
        List<StockTransferEn> list = status != null
                ? transferRepository.findByStatus(status)
                : transferRepository.findAll();
        return ResponseEntity.ok(list.stream().map(this::toResponse).toList());
    }

    @PatchMapping("/{id}/confirm")
    @Transactional
    public ResponseEntity<TransferResponse> confirmTransfer(@PathVariable UUID id) {
        StockTransferEn transfer = transferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transfer not found: " + id));

        transfer.setStatus("IN_TRANSIT");
        transfer.setDispatchedAt(Instant.now());
        StockTransferEn saved = transferRepository.save(transfer);
        return ResponseEntity.ok(toResponse(saved));
    }

    @PatchMapping("/{id}/complete")
    @Transactional
    public ResponseEntity<TransferResponse> completeTransfer(@PathVariable UUID id) {
        StockTransferEn transfer = transferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transfer not found: " + id));

        // Deduct from origin, add to destination
        List<StockItemEn> fromStock = stockItemRepository.findByProductSku(transfer.getProduct().getSku()).stream()
                .filter(s -> s.getWarehouse().getId().equals(transfer.getFromWarehouse().getId()))
                .toList();

        if (!fromStock.isEmpty()) {
            StockItemEn item = fromStock.getFirst();
            item.setQuantityAvailable(Math.max(0, item.getQuantityAvailable() - transfer.getQuantity()));
            item.recalculateStatus();
            stockItemRepository.save(item);
        }

        List<StockItemEn> toStock = stockItemRepository.findByProductSku(transfer.getProduct().getSku()).stream()
                .filter(s -> s.getWarehouse().getId().equals(transfer.getToWarehouse().getId()))
                .toList();

        if (!toStock.isEmpty()) {
            StockItemEn item = toStock.getFirst();
            item.setQuantityAvailable(item.getQuantityAvailable() + transfer.getQuantity());
            item.recalculateStatus();
            stockItemRepository.save(item);
        } else {
            StockItemEn newItem = StockItemEn.builder()
                    .product(transfer.getProduct())
                    .warehouse(transfer.getToWarehouse())
                    .quantityAvailable(transfer.getQuantity())
                    .quantityReserved(0)
                    .status(com.marianciuc.nexifly.inventory.domain.enums.StockStatus.IN_STOCK)
                    .build();
            stockItemRepository.save(newItem);
        }

        transfer.setStatus("COMPLETED");
        transfer.setReceivedAt(Instant.now());
        StockTransferEn saved = transferRepository.save(transfer);
        return ResponseEntity.ok(toResponse(saved));
    }

    private TransferResponse toResponse(StockTransferEn t) {
        return TransferResponse.builder()
                .id(t.getId())
                .fromWarehouseId(t.getFromWarehouse().getId())
                .fromWarehouseName(t.getFromWarehouse().getName())
                .toWarehouseId(t.getToWarehouse().getId())
                .toWarehouseName(t.getToWarehouse().getName())
                .productId(t.getProduct().getId())
                .productSku(t.getProduct().getSku())
                .quantity(t.getQuantity())
                .status(t.getStatus())
                .requestedDate(t.getRequestedDate())
                .dispatchedAt(t.getDispatchedAt())
                .receivedAt(t.getReceivedAt())
                .createdAt(t.getCreatedAt())
                .build();
    }
}
