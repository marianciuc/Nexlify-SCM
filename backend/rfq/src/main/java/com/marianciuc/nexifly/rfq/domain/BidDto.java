package com.marianciuc.nexifly.rfq.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BidDto {
    private UUID id;
    private UUID rfqId;
    private UUID supplierId;
    private String supplierName;
    private String supplierNip;
    private BigDecimal bidAmount;
    private String currency;
    private Integer leadTimeDays;
    private String warrantyTerms;
    private String status; // PENDING, ACCEPTED, REJECTED
    private String notes;
    private Instant submittedAt;
}
