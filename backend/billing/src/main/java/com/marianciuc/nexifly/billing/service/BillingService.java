package com.marianciuc.nexifly.billing.service;

import com.marianciuc.nexifly.billing.domain.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface BillingService {
    InvoiceDetailResponse createInvoice(InvoiceCreateRequest request);
    InvoiceDetailResponse getInvoiceById(UUID id);
    InvoiceDetailResponse getInvoiceByOrderId(UUID orderId);
    Page<InvoiceDetailResponse> getInvoices(UUID tenantId, String status, Pageable pageable);
    InvoiceDetailResponse markInvoiceAsPaid(UUID id, String transactionId, String paymentMethod);
    String createPaymentIntent(UUID invoiceId);
    CreditNoteResponse createCreditNote(CreditNoteRequest request);
    List<CreditNoteResponse> getCreditNotes(UUID orderId);
    BillingStatsResponse getBillingStats(UUID tenantId);
}
