package com.marianciuc.nexifly.analytics.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "order_facts", schema = "analytics")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderFactEn {

    @Id
    private UUID id; // order_id

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @Column(name = "supplier_id")
    private UUID supplierId;

    @Column(name = "status", nullable = false, length = 32)
    private String status;

    @Column(name = "currency", nullable = false, length = 3)
    @Builder.Default
    private String currency = "PLN";

    @Column(name = "total_amount", precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "created_date", nullable = false)
    private LocalDate createdDate;

    @Column(name = "submitted_date")
    private LocalDate submittedDate;

    @Column(name = "paid_date")
    private LocalDate paidDate;

    @Column(name = "shipped_date")
    private LocalDate shippedDate;

    @Column(name = "delivered_date")
    private LocalDate deliveredDate;

    @Column(name = "delivery_city", length = 128)
    private String deliveryCity;

    @Column(name = "items_count")
    private Integer itemsCount;

    @Column(name = "lead_time_days")
    private Integer leadTimeDays;

    @Column(name = "is_on_time")
    private Boolean isOnTime;

    @Column(name = "is_in_full")
    private Boolean isInFull;

    @Column(name = "sla_met")
    private Boolean slaMet;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    @PreUpdate
    public void prePersist() {
        this.updatedAt = Instant.now();
        if (this.createdDate == null) this.createdDate = LocalDate.now();
        if (this.currency == null) this.currency = "PLN";
    }
}
