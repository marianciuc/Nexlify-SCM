package com.marianciuc.nexifly.users.repository;

import com.marianciuc.nexifly.users.domain.enums.VerificationStatus;
import com.marianciuc.nexifly.users.repository.entity.CompanyEn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyRepository extends JpaRepository<CompanyEn, UUID> {

    Optional<CompanyEn> findByTaxId(String taxId);

    Optional<CompanyEn> findByEmail(String email);

    boolean existsByTaxId(String taxId);

    boolean existsByEmail(String email);

    List<CompanyEn> findAllByVerificationStatus(VerificationStatus verificationStatus);

    List<CompanyEn> findAllByIsDeletedFalse();
}
