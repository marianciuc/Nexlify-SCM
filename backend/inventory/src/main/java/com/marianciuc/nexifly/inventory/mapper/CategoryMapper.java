package com.marianciuc.nexifly.inventory.mapper;

import com.marianciuc.nexifly.inventory.domain.dto.request.CreateCategoryRequest;
import com.marianciuc.nexifly.inventory.domain.dto.response.CategoryResponse;
import com.marianciuc.nexifly.inventory.repository.entity.CategoryEn;
import org.mapstruct.*;

@Mapper(
        componentModel = MappingConstants.ComponentModel.SPRING,
        builder = @Builder(disableBuilder = true)
)
public interface CategoryMapper {

    @Mapping(target = "productCount", expression = "java(entity.getProducts() != null ? entity.getProducts().size() : 0)")
    @Mapping(target = "parentName", source = "parent.name")
    @Mapping(target = "parentId", source = "parent.id")
    @Mapping(target = "isActive", source = "active")
    CategoryResponse toCategoryResponse(CategoryEn entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "children", ignore = true)
    @Mapping(target = "products", ignore = true)
    @Mapping(target = "active", constant = "true")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    CategoryEn toEntity(CreateCategoryRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "children", ignore = true)
    @Mapping(target = "products", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromRequest(CreateCategoryRequest request, @MappingTarget CategoryEn entity);
}
