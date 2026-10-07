package com.marianciuc.nexifly.inventory.repository;

import com.marianciuc.nexifly.inventory.repository.entity.BrandEn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BrandRepository extends JpaRepository<BrandEn, UUID> {

    Optional<BrandEn> findByCode(String code);

    Optional<BrandEn> findByNameIgnoreCase(String name);

    boolean existsByCode(String code);

    boolean existsByNameIgnoreCase(String name);

    List<BrandEn> findByIsActiveTrueOrderByNameAsc();
}
