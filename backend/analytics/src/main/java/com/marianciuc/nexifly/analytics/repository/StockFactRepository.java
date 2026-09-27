package com.marianciuc.nexifly.analytics.repository;

import com.marianciuc.nexifly.analytics.domain.entity.StockFactEn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StockFactRepository extends JpaRepository<StockFactEn, UUID> {
    List<StockFactEn> findByTenantId(UUID tenantId);
}
