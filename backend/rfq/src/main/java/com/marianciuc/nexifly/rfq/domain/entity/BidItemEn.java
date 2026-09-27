package com.marianciuc.nexifly.rfq.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "bid_items", schema = "rfq")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BidItemEn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bid_id", nullable = false)
    @JsonIgnore
    private BidEn bid;

    @Column(name = "rfq_item_id", nullable = false)
    private UUID rfqItemId;

    @Column(name = "offered_sku", length = 128)
    private String offeredSku;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "quantity", nullable = false, precision = 12, scale = 3)
    private BigDecimal quantity;

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "is_alternative")
    @Builder.Default
    private Boolean isAlternative = false;

    @Column(name = "alternative_reason", columnDefinition = "TEXT")
    private String alternativeReason;

    @Column(name = "lead_time_days")
    private Integer leadTimeDays;

    @Column(name = "vat_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal vatRate = new BigDecimal("23.00");
}
