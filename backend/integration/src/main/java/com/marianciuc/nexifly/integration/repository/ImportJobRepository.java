package com.marianciuc.nexifly.integration.repository;

import com.marianciuc.nexifly.integration.domain.entity.ImportJob;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ImportJobRepository extends JpaRepository<ImportJob, UUID> {

    Page<ImportJob> findByCompanyId(UUID companyId, Pageable pageable);

    Page<ImportJob> findByCompanyIdAndStatus(UUID companyId, String status, Pageable pageable);
}
