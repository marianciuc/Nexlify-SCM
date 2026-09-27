package com.marianciuc.nexifly.inventory.service.impl;

import com.marianciuc.nexifly.inventory.domain.dto.request.CreateWarehouseRequest;
import com.marianciuc.nexifly.inventory.domain.dto.response.WarehouseResponse;
import com.marianciuc.nexifly.inventory.exception.DuplicateResourceException;
import com.marianciuc.nexifly.inventory.exception.ResourceNotFoundException;
import com.marianciuc.nexifly.inventory.mapper.InventoryMapper;
import com.marianciuc.nexifly.inventory.repository.WarehouseRepository;
import com.marianciuc.nexifly.inventory.repository.entity.WarehouseEn;
import com.marianciuc.nexifly.inventory.service.WarehouseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class WarehouseServiceImpl implements WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final InventoryMapper mapper;

    @Override
    public List<WarehouseResponse> getAllWarehouses() {
        return warehouseRepository.findByIsActiveTrueOrderByName()
                .stream()
                .map(mapper::toWarehouseResponse)
                .toList();
    }

    @Override
    public WarehouseResponse getWarehouseById(UUID id) {
        return mapper.toWarehouseResponse(findWarehouseOrThrow(id));
    }

    @Override
    @Transactional
    public WarehouseResponse createWarehouse(CreateWarehouseRequest request) {
        if (warehouseRepository.existsByCode(request.code())) {
            throw new DuplicateResourceException("Warehouse with code '%s' already exists".formatted(request.code()));
        }

        WarehouseEn warehouse = WarehouseEn.builder()
                .code(request.code())
                .name(request.name())
                .city(request.city())
                .address(request.address())
                .latitude(request.latitude())
                .longitude(request.longitude())
                .totalCapacityPallets(request.totalCapacityPallets() != null ? request.totalCapacityPallets() : 0)
                .temperatureZoneMin(request.temperatureZoneMin())
                .temperatureZoneMax(request.temperatureZoneMax())
                .build();

        warehouse = warehouseRepository.save(warehouse);
        log.info("Created warehouse: {} (code: {})", warehouse.getName(), warehouse.getCode());
        return mapper.toWarehouseResponse(warehouse);
    }

    @Override
    @Transactional
    public WarehouseResponse updateWarehouse(UUID id, CreateWarehouseRequest request) {
        WarehouseEn warehouse = findWarehouseOrThrow(id);

        if (!warehouse.getCode().equals(request.code()) && warehouseRepository.existsByCode(request.code())) {
            throw new DuplicateResourceException("Warehouse with code '%s' already exists".formatted(request.code()));
        }

        warehouse.setCode(request.code());
        warehouse.setName(request.name());
        warehouse.setCity(request.city());
        if (request.address() != null) warehouse.setAddress(request.address());
        if (request.latitude() != null) warehouse.setLatitude(request.latitude());
        if (request.longitude() != null) warehouse.setLongitude(request.longitude());
        if (request.totalCapacityPallets() != null) warehouse.setTotalCapacityPallets(request.totalCapacityPallets());
        if (request.temperatureZoneMin() != null) warehouse.setTemperatureZoneMin(request.temperatureZoneMin());
        if (request.temperatureZoneMax() != null) warehouse.setTemperatureZoneMax(request.temperatureZoneMax());

        warehouse = warehouseRepository.save(warehouse);
        log.info("Updated warehouse: {} (code: {})", warehouse.getName(), warehouse.getCode());
        return mapper.toWarehouseResponse(warehouse);
    }

    private WarehouseEn findWarehouseOrThrow(UUID id) {
        return warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + id));
    }
}
