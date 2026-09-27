package com.marianciuc.nexifly.inventory.repository;

import com.marianciuc.nexifly.inventory.repository.entity.ProductEn;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<ProductEn, UUID> {

    Optional<ProductEn> findBySku(String sku);

    boolean existsBySku(String sku);

    List<ProductEn> findByCategoryIdAndIsActiveTrue(UUID categoryId);

    @Query("""
            SELECT p FROM ProductEn p
            WHERE p.isActive = true
            AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))
                 OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%')))
            AND (:categoryId IS NULL OR p.category.id = :categoryId)
            ORDER BY p.name
            """)
    Page<ProductEn> searchProducts(
            @Param("search") String search,
            @Param("categoryId") UUID categoryId,
            Pageable pageable
    );

    @Query("""
            SELECT p FROM ProductEn p
            WHERE p.isActive = true
            AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))
                 OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%')))
            AND (:categoryId IS NULL OR p.category.id = :categoryId)
            ORDER BY p.name
            """)
    List<ProductEn> searchProductsList(
            @Param("search") String search,
            @Param("categoryId") UUID categoryId
    );

    long countByIsActiveTrue();
}
