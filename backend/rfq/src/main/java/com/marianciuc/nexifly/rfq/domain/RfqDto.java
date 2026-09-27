package com.marianciuc.nexifly.rfq.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RfqDto {
    private UUID id;
    private String rfqNumber;
    private String title;
    private String category;
    private String description;
    private UUID issuerId;
    private String issuerName;
    private String deliveryLocation;
    private LocalDate deadline;
    private BigDecimal targetBudget;
    private String currency;
    private String status; // OPEN, EVALUATION, AWARDED, CLOSED
    private Integer requiredQuantity;
    private String unitOfMeasure;
    private Instant createdAt;
    
    @Builder.Default
    private List<BidDto> bids = new ArrayList<>();
    
    private UUID awardedBidId;
    private String awardedSupplierName;
    private BigDecimal awardedAmount;
}
