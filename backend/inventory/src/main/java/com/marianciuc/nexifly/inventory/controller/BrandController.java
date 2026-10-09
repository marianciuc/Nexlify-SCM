package com.marianciuc.nexifly.inventory.controller;

import com.marianciuc.nexifly.inventory.domain.dto.request.CreateBrandRequest;
import com.marianciuc.nexifly.inventory.domain.dto.response.BrandResponse;
import com.marianciuc.nexifly.inventory.exception.DuplicateResourceException;
import com.marianciuc.nexifly.inventory.exception.ResourceNotFoundException;
import com.marianciuc.nexifly.inventory.mapper.BrandMapper;
import com.marianciuc.nexifly.inventory.repository.BrandRepository;
import com.marianciuc.nexifly.inventory.repository.entity.BrandEn;
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
@RequestMapping("/api/v1/inventory/brands")
@RequiredArgsConstructor
@Slf4j
public class BrandController {

    private final BrandRepository brandRepository;
    private final BrandMapper brandMapper;

    @GetMapping
    public ResponseEntity<List<BrandResponse>> getAllBrands() {
        List<BrandResponse> brands = brandRepository.findByIsActiveTrueOrderByNameAsc()
                .stream()
                .map(brandMapper::toBrandResponse)
                .toList();
        return ResponseEntity.ok(brands);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BrandResponse> getBrandById(@PathVariable UUID id) {
        BrandEn brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with ID: " + id));
        return ResponseEntity.ok(brandMapper.toBrandResponse(brand));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<BrandResponse> createBrand(@Valid @RequestBody CreateBrandRequest request) {
        String code = request.code() != null && !request.code().isBlank()
                ? request.code().trim().toUpperCase()
                : generateCode(request.name());

        if (brandRepository.existsByCode(code)) {
            throw new DuplicateResourceException("Brand with code '%s' already exists".formatted(code));
        }

        BrandEn brand = BrandEn.builder()
                .name(request.name().trim())
                .code(code)
                .description(request.description())
                .website(request.website())
                .isActive(true)
                .build();

        brand = brandRepository.save(brand);
        log.info("Created brand: {} (code: {})", brand.getName(), brand.getCode());
        return ResponseEntity.status(HttpStatus.CREATED).body(brandMapper.toBrandResponse(brand));
    }

    private String generateCode(String name) {
        return name.trim().toUpperCase().replaceAll("[^A-Z0-9]", "-").replaceAll("-+", "-");
    }
}
