package com.marianciuc.nexifly.billing.repository;

import com.marianciuc.nexifly.billing.domain.entity.InvoiceEn;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<InvoiceEn, UUID> {
    Optional<InvoiceEn> findByInvoiceNumber(String invoiceNumber);
    Optional<InvoiceEn> findByOrderId(UUID orderId);
    Page<InvoiceEn> findBySellerCompanyIdOrBuyerCompanyId(UUID sellerCompanyId, UUID buyerCompanyId, Pageable pageable);
    Page<InvoiceEn> findByBuyerCompanyId(UUID buyerCompanyId, Pageable pageable);
    Page<InvoiceEn> findBySellerCompanyId(UUID sellerCompanyId, Pageable pageable);
    List<InvoiceEn> findByStatusAndDueDateBefore(String status, LocalDate dueDate);
    Optional<InvoiceEn> findByStripePaymentIntentId(String stripePaymentIntentId);
}
