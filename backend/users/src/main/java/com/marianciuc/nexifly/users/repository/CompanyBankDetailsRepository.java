package com.marianciuc.nexifly.users.repository;

import com.marianciuc.nexifly.users.repository.entity.CompanyBankDetailsEn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CompanyBankDetailsRepository extends JpaRepository<CompanyBankDetailsEn, UUID> {

    List<CompanyBankDetailsEn> findAllByCompanyId(UUID companyId);
}
