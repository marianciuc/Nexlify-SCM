package com.marianciuc.nexifly.inventory.service.impl;

import com.marianciuc.nexifly.inventory.domain.dto.request.CreateProductRequest;
import com.marianciuc.nexifly.inventory.domain.dto.response.ProductResponse;
import com.marianciuc.nexifly.inventory.exception.DuplicateResourceException;
import com.marianciuc.nexifly.inventory.exception.ResourceNotFoundException;
import com.marianciuc.nexifly.inventory.mapper.InventoryMapper;
import com.marianciuc.nexifly.inventory.repository.CategoryRepository;
import com.marianciuc.nexifly.inventory.repository.ProductRepository;
import com.marianciuc.nexifly.inventory.repository.entity.CategoryEn;
import com.marianciuc.nexifly.inventory.repository.entity.ProductEn;
import com.marianciuc.nexifly.inventory.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryMapper mapper;

    @Override
    public List<ProductResponse> searchProducts(String search, UUID categoryId) {
        return productRepository.searchProductsList(search, categoryId)
                .stream()
                .map(mapper::toProductResponse)
                .toList();
    }

    @Override
    public ProductResponse getProductById(UUID id) {
        return mapper.toProductResponse(findProductOrThrow(id));
    }

    @Override
    public ProductResponse getProductBySku(String sku) {
        ProductEn product = productRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with SKU: " + sku));
        return mapper.toProductResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        if (productRepository.existsBySku(request.sku())) {
            throw new DuplicateResourceException("Product with SKU '%s' already exists".formatted(request.sku()));
        }

        ProductEn product = ProductEn.builder()
                .sku(request.sku())
                .name(request.name())
                .description(request.description())
                .unit(request.unit() != null ? request.unit() : "pcs")
                .unitPrice(request.unitPrice())
                .currency(request.currency() != null ? request.currency() : "PLN")
                .weightKg(request.weightKg())
                .dimensions(request.dimensions())
                .manufacturer(request.manufacturer())
                .brand(request.brand())
                .minOrderQuantity(request.minOrderQuantity() != null ? request.minOrderQuantity() : 1)
                .reorderPoint(request.reorderPoint() != null ? request.reorderPoint() : 0)
                .build();

        if (request.categoryId() != null) {
            CategoryEn category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.categoryId()));
            product.setCategory(category);
        }

        product = productRepository.save(product);
        log.info("Created product: {} (SKU: {})", product.getName(), product.getSku());
        return mapper.toProductResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(UUID id, CreateProductRequest request) {
        ProductEn product = findProductOrThrow(id);

        // Check SKU uniqueness if changed
        if (!product.getSku().equals(request.sku()) && productRepository.existsBySku(request.sku())) {
            throw new DuplicateResourceException("Product with SKU '%s' already exists".formatted(request.sku()));
        }

        product.setSku(request.sku());
        product.setName(request.name());
        if (request.description() != null) product.setDescription(request.description());
        if (request.unit() != null) product.setUnit(request.unit());
        product.setUnitPrice(request.unitPrice());
        if (request.currency() != null) product.setCurrency(request.currency());
        if (request.weightKg() != null) product.setWeightKg(request.weightKg());
        if (request.dimensions() != null) product.setDimensions(request.dimensions());
        if (request.manufacturer() != null) product.setManufacturer(request.manufacturer());
        if (request.brand() != null) product.setBrand(request.brand());
        if (request.minOrderQuantity() != null) product.setMinOrderQuantity(request.minOrderQuantity());
        if (request.reorderPoint() != null) product.setReorderPoint(request.reorderPoint());

        if (request.categoryId() != null) {
            CategoryEn category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.categoryId()));
            product.setCategory(category);
        }

        product = productRepository.save(product);
        log.info("Updated product: {} (SKU: {})", product.getName(), product.getSku());
        return mapper.toProductResponse(product);
    }

    @Override
    @Transactional
    public void deleteProduct(UUID id) {
        ProductEn product = findProductOrThrow(id);
        product.setActive(false);
        productRepository.save(product);
        log.info("Soft-deleted product: {} (SKU: {})", product.getName(), product.getSku());
    }

    private ProductEn findProductOrThrow(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
    }
}
