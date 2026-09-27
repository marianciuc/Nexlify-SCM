package com.marianciuc.nexifly.rfq.repository;

import com.marianciuc.nexifly.rfq.domain.entity.BidEn;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BidRepository extends JpaRepository<BidEn, UUID> {
    List<BidEn> findByRfqId(UUID rfqId);
    Page<BidEn> findBySupplierCompanyId(UUID supplierCompanyId, Pageable pageable);
}
