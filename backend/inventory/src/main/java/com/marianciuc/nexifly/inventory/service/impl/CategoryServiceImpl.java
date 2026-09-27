package com.marianciuc.nexifly.inventory.service.impl;

import com.marianciuc.nexifly.inventory.domain.dto.request.CreateCategoryRequest;
import com.marianciuc.nexifly.inventory.domain.dto.response.CategoryResponse;
import com.marianciuc.nexifly.inventory.exception.DuplicateResourceException;
import com.marianciuc.nexifly.inventory.exception.ResourceNotFoundException;
import com.marianciuc.nexifly.inventory.mapper.InventoryMapper;
import com.marianciuc.nexifly.inventory.repository.CategoryRepository;
import com.marianciuc.nexifly.inventory.repository.entity.CategoryEn;
import com.marianciuc.nexifly.inventory.service.CategoryService;
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
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final InventoryMapper mapper;

    @Override
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findByIsActiveTrueOrderBySortOrder()
                .stream()
                .map(mapper::toCategoryResponse)
                .toList();
    }

    @Override
    public List<CategoryResponse> getRootCategories() {
        return categoryRepository.findRootCategories()
                .stream()
                .map(mapper::toCategoryResponse)
                .toList();
    }

    @Override
    public CategoryResponse getCategoryById(UUID id) {
        return mapper.toCategoryResponse(findCategoryOrThrow(id));
    }

    @Override
    public CategoryResponse getCategoryBySlug(String slug) {
        CategoryEn category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with slug: " + slug));
        return mapper.toCategoryResponse(category);
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        String slug = request.slug() != null ? request.slug() : generateSlug(request.name());

        if (categoryRepository.existsBySlug(slug)) {
            throw new DuplicateResourceException("Category with slug '%s' already exists".formatted(slug));
        }

        CategoryEn category = CategoryEn.builder()
                .name(request.name())
                .slug(slug)
                .description(request.description())
                .sortOrder(request.sortOrder() != null ? request.sortOrder() : 0)
                .build();

        if (request.parentId() != null) {
            CategoryEn parent = findCategoryOrThrow(request.parentId());
            category.setParent(parent);
        }

        category = categoryRepository.save(category);
        log.info("Created category: {} (slug: {})", category.getName(), category.getSlug());
        return mapper.toCategoryResponse(category);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(UUID id, CreateCategoryRequest request) {
        CategoryEn category = findCategoryOrThrow(id);

        category.setName(request.name());
        if (request.description() != null) category.setDescription(request.description());
        if (request.sortOrder() != null) category.setSortOrder(request.sortOrder());

        if (request.slug() != null && !request.slug().equals(category.getSlug())) {
            if (categoryRepository.existsBySlug(request.slug())) {
                throw new DuplicateResourceException("Category with slug '%s' already exists".formatted(request.slug()));
            }
            category.setSlug(request.slug());
        }

        if (request.parentId() != null) {
            CategoryEn parent = findCategoryOrThrow(request.parentId());
            category.setParent(parent);
        } else {
            category.setParent(null);
        }

        category = categoryRepository.save(category);
        log.info("Updated category: {} (ID: {})", category.getName(), category.getId());
        return mapper.toCategoryResponse(category);
    }

    @Override
    @Transactional
    public void deleteCategory(UUID id) {
        CategoryEn category = findCategoryOrThrow(id);
        category.setActive(false);
        categoryRepository.save(category);
        log.info("Soft-deleted category: {} (ID: {})", category.getName(), id);
    }

    private CategoryEn findCategoryOrThrow(UUID id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
    }

    private String generateSlug(String name) {
        return name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }
}
