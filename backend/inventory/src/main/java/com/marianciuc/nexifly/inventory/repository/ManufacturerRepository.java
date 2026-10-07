package com.marianciuc.nexifly.inventory.repository;

import com.marianciuc.nexifly.inventory.repository.entity.ManufacturerEn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ManufacturerRepository extends JpaRepository<ManufacturerEn, UUID> {

    Optional<ManufacturerEn> findByCode(String code);

    Optional<ManufacturerEn> findByNameIgnoreCase(String name);

    boolean existsByCode(String code);

    boolean existsByNameIgnoreCase(String name);

    List<ManufacturerEn> findByIsActiveTrueOrderByNameAsc();
}
