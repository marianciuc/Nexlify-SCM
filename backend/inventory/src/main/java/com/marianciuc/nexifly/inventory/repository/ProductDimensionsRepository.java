package com.marianciuc.nexifly.inventory.repository;

import com.marianciuc.nexifly.inventory.repository.entity.ProductDimensionsEn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductDimensionsRepository extends JpaRepository<ProductDimensionsEn, UUID> {

    Optional<ProductDimensionsEn> findByProductId(UUID productId);
}
