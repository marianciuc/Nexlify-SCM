package com.marianciuc.nexifly.orders.repository;

import com.marianciuc.nexifly.orders.domain.entity.PriceAgreementEn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PriceAgreementRepository extends JpaRepository<PriceAgreementEn, UUID> {
    Optional<PriceAgreementEn> findFirstByBuyerCompanyIdAndSupplierCompanyIdAndSkuAndValidFromLessThanEqualAndValidToGreaterThanEqual(
            UUID buyerCompanyId, UUID supplierCompanyId, String sku, LocalDate date1, LocalDate date2
    );
}
