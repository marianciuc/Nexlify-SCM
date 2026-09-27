package com.marianciuc.nexifly.logistic.repository;

import com.marianciuc.nexifly.logistic.domain.entity.VehicleEn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehicleRepository extends JpaRepository<VehicleEn, UUID> {
    Optional<VehicleEn> findByPlateNumber(String plateNumber);
    List<VehicleEn> findByStatus(String status);
}
