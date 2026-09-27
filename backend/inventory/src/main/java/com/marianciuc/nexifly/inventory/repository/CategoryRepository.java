package com.marianciuc.nexifly.inventory.repository;

import com.marianciuc.nexifly.inventory.repository.entity.CategoryEn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<CategoryEn, UUID> {

    Optional<CategoryEn> findBySlug(String slug);

    boolean existsBySlug(String slug);

    @Query("SELECT c FROM CategoryEn c WHERE c.parent IS NULL AND c.isActive = true ORDER BY c.sortOrder")
    List<CategoryEn> findRootCategories();

    List<CategoryEn> findByParentIdAndIsActiveTrue(UUID parentId);

    List<CategoryEn> findByIsActiveTrueOrderBySortOrder();

    @Query("SELECT c FROM CategoryEn c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<CategoryEn> searchByName(String query);
}
