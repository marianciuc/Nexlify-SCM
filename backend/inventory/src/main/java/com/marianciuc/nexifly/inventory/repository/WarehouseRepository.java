package com.marianciuc.nexifly.inventory.repository;

import com.marianciuc.nexifly.inventory.repository.entity.WarehouseEn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WarehouseRepository extends JpaRepository<WarehouseEn, UUID> {

    Optional<WarehouseEn> findByCode(String code);

    boolean existsByCode(String code);

    List<WarehouseEn> findByIsActiveTrueOrderByName();

    List<WarehouseEn> findByCityIgnoreCase(String city);
}
