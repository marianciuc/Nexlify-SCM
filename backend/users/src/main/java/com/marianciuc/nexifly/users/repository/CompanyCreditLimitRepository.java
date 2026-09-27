package com.marianciuc.nexifly.users.repository;

import com.marianciuc.nexifly.users.repository.entity.CompanyCreditLimitEn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyCreditLimitRepository extends JpaRepository<CompanyCreditLimitEn, UUID> {
    Optional<CompanyCreditLimitEn> findFirstByCompanyIdOrderByCreatedAtDesc(UUID companyId);
}
