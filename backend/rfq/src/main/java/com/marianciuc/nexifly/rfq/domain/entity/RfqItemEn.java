package com.marianciuc.nexifly.rfq.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "rfq_items", schema = "rfq")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RfqItemEn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rfq_id", nullable = false)
    @JsonIgnore
    private RfqRequestEn rfq;

    @Column(name = "sku", length = 128)
    private String sku;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(name = "quantity", nullable = false, precision = 12, scale = 3)
    private BigDecimal quantity;

    @Column(name = "unit_of_measure", nullable = false, length = 16)
    @Builder.Default
    private String unitOfMeasure = "PCE";

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "allow_alternatives")
    @Builder.Default
    private Boolean allowAlternatives = false;
}
