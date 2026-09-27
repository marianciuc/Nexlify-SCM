package com.marianciuc.nexifly.analytics.repository;

import com.marianciuc.nexifly.analytics.domain.entity.OrderFactEn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface OrderFactRepository extends JpaRepository<OrderFactEn, UUID> {
    List<OrderFactEn> findByTenantId(UUID tenantId);
    List<OrderFactEn> findByTenantIdAndCreatedDateBetween(UUID tenantId, LocalDate from, LocalDate to);
    long countByTenantIdAndStatus(UUID tenantId, String status);
}
