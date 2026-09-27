package com.marianciuc.nexifly.analytics.repository;

import com.marianciuc.nexifly.analytics.domain.entity.PaymentFactEn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentFactRepository extends JpaRepository<PaymentFactEn, UUID> {
    List<PaymentFactEn> findByBuyerCompanyIdOrSupplierCompanyId(UUID buyerCompanyId, UUID supplierCompanyId);
}
