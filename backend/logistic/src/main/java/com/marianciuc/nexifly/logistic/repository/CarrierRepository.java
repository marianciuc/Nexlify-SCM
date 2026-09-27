package com.marianciuc.nexifly.logistic.repository;

import com.marianciuc.nexifly.logistic.domain.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CarrierRepository extends JpaRepository<CarrierEn, UUID> {
    Optional<CarrierEn> findByCompanyId(UUID companyId);
}
