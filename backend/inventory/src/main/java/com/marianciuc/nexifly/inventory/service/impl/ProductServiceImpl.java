package com.marianciuc.nexifly.inventory.service.impl;

import com.marianciuc.nexifly.inventory.domain.dto.request.CreateProductRequest;
import com.marianciuc.nexifly.inventory.domain.dto.response.ProductResponse;
import com.marianciuc.nexifly.inventory.domain.enums.Units;
import com.marianciuc.nexifly.inventory.exception.DuplicateResourceException;
import com.marianciuc.nexifly.inventory.exception.ResourceNotFoundException;
import com.marianciuc.nexifly.inventory.mapper.InventoryMapper;
import com.marianciuc.nexifly.inventory.repository.BrandRepository;
import com.marianciuc.nexifly.inventory.repository.CategoryRepository;
import com.marianciuc.nexifly.inventory.repository.ManufacturerRepository;
import com.marianciuc.nexifly.inventory.repository.ProductRepository;
import com.marianciuc.nexifly.inventory.repository.entity.CategoryEn;
import com.marianciuc.nexifly.inventory.repository.entity.ProductEn;
import com.marianciuc.nexifly.inventory.service.ProductService;
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
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ManufacturerRepository manufacturerRepository;
    private final InventoryMapper mapper;

    @Override
    public List<ProductResponse> searchProducts(String search, UUID categoryId, UUID brandId, UUID manufacturerId) {
        return productRepository.searchProductsList(search, categoryId, brandId, manufacturerId)
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

        ProductEn product = mapper.toProductEntity(request);
        if (product.getUnit() == null) {
            product.setUnit(Units.PCS);
        }

        assignRelations(product, request);

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

        mapper.updateProductEntityFromRequest(request, product);
        assignRelations(product, request);

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

    private void assignRelations(ProductEn product, CreateProductRequest request) {
        if (request.categoryId() != null) {
            CategoryEn category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.categoryId()));
            product.setCategory(category);
        }

        if (request.brandId() != null) {
            brandRepository.findById(request.brandId()).ifPresent(product::setBrand);
        } else if (request.brand() != null && !request.brand().isBlank()) {
            brandRepository.findByNameIgnoreCase(request.brand().trim()).ifPresent(product::setBrand);
        }

        if (request.manufacturerId() != null) {
            manufacturerRepository.findById(request.manufacturerId()).ifPresent(product::setManufacturer);
        } else if (request.manufacturer() != null && !request.manufacturer().isBlank()) {
            manufacturerRepository.findByNameIgnoreCase(request.manufacturer().trim()).ifPresent(product::setManufacturer);
        }
    }

    private ProductEn findProductOrThrow(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
    }
}
