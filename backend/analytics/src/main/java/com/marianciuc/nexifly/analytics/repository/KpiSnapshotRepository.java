package com.marianciuc.nexifly.analytics.repository;

import com.marianciuc.nexifly.analytics.domain.entity.KpiSnapshotEn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface KpiSnapshotRepository extends JpaRepository<KpiSnapshotEn, UUID> {
    Optional<KpiSnapshotEn> findTopByTenantIdOrderByPeriodEndDesc(UUID tenantId);
    List<KpiSnapshotEn> findByTenantIdOrderByPeriodStartDesc(UUID tenantId);
}
