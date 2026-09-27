package com.marianciuc.nexifly.users.repository;

import com.marianciuc.nexifly.users.repository.entity.CompanyLocationEn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyLocationRepository extends JpaRepository<CompanyLocationEn, UUID> {

    List<CompanyLocationEn> findAllByCompanyId(UUID companyId);

    Optional<CompanyLocationEn> findByCompanyIdAndIsDefaultTrue(UUID companyId);
}
