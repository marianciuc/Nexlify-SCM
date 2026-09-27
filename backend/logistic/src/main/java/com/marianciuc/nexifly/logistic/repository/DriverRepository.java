package com.marianciuc.nexifly.logistic.repository;

import com.marianciuc.nexifly.logistic.domain.entity.DriverEn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DriverRepository extends JpaRepository<DriverEn, UUID> {
    Optional<DriverEn> findByUserId(UUID userId);
    List<DriverEn> findByIsAvailableTrue();
}
