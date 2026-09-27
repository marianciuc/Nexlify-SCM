package com.marianciuc.nexifly.billing.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceDto {
    private UUID id;
    private String invoiceNumber; // e.g. FV/2026/09/0042
    private UUID orderId;
    private String orderNumber;
    private String buyerName;
    private String buyerNip;
    private BigDecimal netAmount;
    private BigDecimal vatRate; // 0.23
    private BigDecimal vatAmount;
    private BigDecimal grossAmount;
    private String currency; // PLN
    private LocalDate issueDate;
    private LocalDate dueDate;
    private String paymentStatus; // PAID, UNPAID, OVERDUE
    private String paymentMethod; // SPLIT_PAYMENT, NET_30, STRIPE
}
