package com.marianciuc.nexifly.inventory.controller;

import com.marianciuc.nexifly.inventory.domain.dto.request.CreateManufacturerRequest;
import com.marianciuc.nexifly.inventory.domain.dto.response.ManufacturerResponse;
import com.marianciuc.nexifly.inventory.exception.DuplicateResourceException;
import com.marianciuc.nexifly.inventory.exception.ResourceNotFoundException;
import com.marianciuc.nexifly.inventory.mapper.ManufacturerMapper;
import com.marianciuc.nexifly.inventory.repository.ManufacturerRepository;
import com.marianciuc.nexifly.inventory.repository.entity.ManufacturerEn;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/manufacturers")
@RequiredArgsConstructor
@Slf4j
public class ManufacturerController {

    private final ManufacturerRepository manufacturerRepository;
    private final ManufacturerMapper manufacturerMapper;

    @GetMapping
    public ResponseEntity<List<ManufacturerResponse>> getAllManufacturers() {
        List<ManufacturerResponse> manufacturers = manufacturerRepository.findByIsActiveTrueOrderByNameAsc()
                .stream()
                .map(manufacturerMapper::toManufacturerResponse)
                .toList();
        return ResponseEntity.ok(manufacturers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ManufacturerResponse> getManufacturerById(@PathVariable UUID id) {
        ManufacturerEn manufacturer = manufacturerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Manufacturer not found with ID: " + id));
        return ResponseEntity.ok(manufacturerMapper.toManufacturerResponse(manufacturer));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<ManufacturerResponse> createManufacturer(@Valid @RequestBody CreateManufacturerRequest request) {
        String code = request.code() != null && !request.code().isBlank()
                ? request.code().trim().toUpperCase()
                : generateCode(request.name());

        if (manufacturerRepository.existsByCode(code)) {
            throw new DuplicateResourceException("Manufacturer with code '%s' already exists".formatted(code));
        }

        ManufacturerEn manufacturer = ManufacturerEn.builder()
                .name(request.name().trim())
                .code(code)
                .country(request.country())
                .website(request.website())
                .contactEmail(request.contactEmail())
                .isActive(true)
                .build();

        manufacturer = manufacturerRepository.save(manufacturer);
        log.info("Created manufacturer: {} (code: {})", manufacturer.getName(), manufacturer.getCode());
        return ResponseEntity.status(HttpStatus.CREATED).body(manufacturerMapper.toManufacturerResponse(manufacturer));
    }

    private String generateCode(String name) {
        return name.trim().toUpperCase().replaceAll("[^A-Z0-9]", "-").replaceAll("-+", "-");
    }
}
