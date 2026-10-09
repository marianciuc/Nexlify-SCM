package com.marianciuc.nexifly.inventory.service;

import com.marianciuc.nexifly.inventory.domain.dto.request.CreateProductRequest;
import com.marianciuc.nexifly.inventory.domain.dto.response.ProductResponse;

import java.util.List;
import java.util.UUID;

public interface ProductService {
    List<ProductResponse> searchProducts(String search, UUID categoryId, UUID brandId, UUID manufacturerId);
    default List<ProductResponse> searchProducts(String search, UUID categoryId) {
        return searchProducts(search, categoryId, null, null);
    }
    ProductResponse getProductById(UUID id);
    ProductResponse getProductBySku(String sku);
    ProductResponse createProduct(CreateProductRequest request);
    ProductResponse updateProduct(UUID id, CreateProductRequest request);
    void deleteProduct(UUID id);
}
