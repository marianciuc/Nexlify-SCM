package com.marianciuc.nexifly.inventory.service;

import com.marianciuc.nexifly.inventory.domain.dto.request.CreateCategoryRequest;
import com.marianciuc.nexifly.inventory.domain.dto.response.CategoryResponse;

import java.util.List;
import java.util.UUID;

public interface CategoryService {
    List<CategoryResponse> getAllCategories();
    List<CategoryResponse> getRootCategories();
    CategoryResponse getCategoryById(UUID id);
    CategoryResponse getCategoryBySlug(String slug);
    CategoryResponse createCategory(CreateCategoryRequest request);
    CategoryResponse updateCategory(UUID id, CreateCategoryRequest request);
    void deleteCategory(UUID id);
}
