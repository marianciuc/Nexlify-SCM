package com.marianciuc.nexifly.inventory.service;

import com.marianciuc.nexifly.inventory.domain.dto.request.CreateWarehouseRequest;
import com.marianciuc.nexifly.inventory.domain.dto.response.WarehouseResponse;

import java.util.List;
import java.util.UUID;

public interface WarehouseService {
    List<WarehouseResponse> getAllWarehouses();
    WarehouseResponse getWarehouseById(UUID id);
    WarehouseResponse createWarehouse(CreateWarehouseRequest request);
    WarehouseResponse updateWarehouse(UUID id, CreateWarehouseRequest request);
}
