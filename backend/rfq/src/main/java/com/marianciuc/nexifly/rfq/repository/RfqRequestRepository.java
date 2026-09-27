package com.marianciuc.nexifly.rfq.repository;

import com.marianciuc.nexifly.rfq.domain.entity.RfqRequestEn;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RfqRequestRepository extends JpaRepository<RfqRequestEn, UUID> {
    Optional<RfqRequestEn> findByRfqNumber(String rfqNumber);
    Page<RfqRequestEn> findByTenantId(UUID tenantId, Pageable pageable);
    Page<RfqRequestEn> findByStatus(String status, Pageable pageable);
    Page<RfqRequestEn> findByStatusAndCategory(String status, String category, Pageable pageable);
    List<RfqRequestEn> findByStatusAndDeadlineBefore(String status, Instant deadline);
}
