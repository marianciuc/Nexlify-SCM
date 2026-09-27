package com.marianciuc.nexifly.billing.repository;

import com.marianciuc.nexifly.billing.domain.entity.CreditNoteEn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CreditNoteRepository extends JpaRepository<CreditNoteEn, UUID> {
    Optional<CreditNoteEn> findByCreditNoteNumber(String creditNoteNumber);
    List<CreditNoteEn> findByOrderId(UUID orderId);
}
