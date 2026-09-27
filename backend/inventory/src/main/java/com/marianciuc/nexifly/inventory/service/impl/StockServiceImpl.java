package com.marianciuc.nexifly.inventory.service.impl;

import com.marianciuc.nexifly.inventory.domain.dto.request.ReserveStockRequest;
import com.marianciuc.nexifly.inventory.domain.dto.response.StockItemResponse;
import com.marianciuc.nexifly.inventory.exception.InsufficientStockException;
import com.marianciuc.nexifly.inventory.exception.ResourceNotFoundException;
import com.marianciuc.nexifly.inventory.mapper.InventoryMapper;
import com.marianciuc.nexifly.inventory.repository.StockItemRepository;
import com.marianciuc.nexifly.inventory.repository.entity.StockItemEn;
import com.marianciuc.nexifly.inventory.service.StockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class StockServiceImpl implements StockService {

    private final StockItemRepository stockItemRepository;
    private final InventoryMapper mapper;
    private final com.marianciuc.nexifly.inventory.service.StockReservationService stockReservationService;

    @Override
    public List<StockItemResponse> searchStockItems(String search, UUID warehouseId) {
        return stockItemRepository.searchStockItems(search, warehouseId)
                .stream()
                .map(mapper::toStockItemResponse)
                .toList();
    }

    @Override
    public StockItemResponse getStockItemById(UUID id) {
        StockItemEn item = stockItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Stock item not found with ID: " + id));
        return mapper.toStockItemResponse(item);
    }

    @Override
    @Transactional
    public Map<String, Object> reserveStock(ReserveStockRequest request) {
        log.info("Soft reserving stock via Redisson for SKU: {}, quantity: {}", request.sku(), request.quantity());
        UUID tempOrderId = UUID.randomUUID();
        com.marianciuc.nexifly.inventory.service.StockReservationService.ReservationResult result =
                stockReservationService.softReserve(tempOrderId, null, request.sku(), request.quantity(), request.warehouseId());

        return Map.of(
                "success", true,
                "reservationId", result.getReservationId().toString(),
                "sku", request.sku(),
                "reservedQuantity", request.quantity()
        );
    }

    @Override
    @Transactional
    public Map<String, Object> releaseStock(ReserveStockRequest request) {
        log.info("Releasing stock for SKU: {}, quantity: {}", request.sku(), request.quantity());

        List<StockItemEn> items = stockItemRepository.findByProductSku(request.sku());
        if (items.isEmpty()) {
            throw new ResourceNotFoundException("No stock found for SKU: " + request.sku());
        }

        StockItemEn item = items.getFirst();
        item.release(request.quantity());
        stockItemRepository.save(item);

        log.info("Released {} units of {}", request.quantity(), request.sku());

        return Map.of(
                "success", true,
                "message", "Stock released successfully",
                "sku", request.sku(),
                "releasedQuantity", request.quantity()
        );
    }
}
