package com.marianciuc.nexifly.inventory.repository;

import com.marianciuc.nexifly.inventory.domain.enums.StockStatus;
import com.marianciuc.nexifly.inventory.repository.entity.StockItemEn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StockItemRepository extends JpaRepository<StockItemEn, UUID> {

    List<StockItemEn> findByProductId(UUID productId);

    List<StockItemEn> findByWarehouseId(UUID warehouseId);

    Optional<StockItemEn> findByProductIdAndWarehouseId(UUID productId, UUID warehouseId);

    @Query("SELECT s FROM StockItemEn s WHERE s.product.sku = :sku")
    List<StockItemEn> findByProductSku(@Param("sku") String sku);

    List<StockItemEn> findByStatus(StockStatus status);

    @Query("""
            SELECT s FROM StockItemEn s
            JOIN FETCH s.product p
            JOIN FETCH s.warehouse w
            WHERE (:search IS NULL OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')))
            AND (:warehouseId IS NULL OR w.id = :warehouseId)
            ORDER BY p.name
            """)
    List<StockItemEn> searchStockItems(
            @Param("search") String search,
            @Param("warehouseId") UUID warehouseId
    );

    @Query("SELECT COUNT(s) FROM StockItemEn s WHERE s.status = :status")
    long countByStatus(@Param("status") StockStatus status);
}
