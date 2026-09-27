package com.marianciuc.nexifly.inventory.service;

import com.marianciuc.nexifly.inventory.domain.dto.request.ReserveStockRequest;
import com.marianciuc.nexifly.inventory.domain.dto.response.StockItemResponse;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface StockService {
    List<StockItemResponse> searchStockItems(String search, UUID warehouseId);
    StockItemResponse getStockItemById(UUID id);
    Map<String, Object> reserveStock(ReserveStockRequest request);
    Map<String, Object> releaseStock(ReserveStockRequest request);
}
