package com.marianciuc.nexifly.analytics.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "kpi_snapshots", schema = "analytics")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KpiSnapshotEn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "period_type", nullable = false, length = 8)
    private String periodType; // DAILY, WEEKLY, MONTHLY

    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    @Column(name = "total_orders")
    @Builder.Default
    private Integer totalOrders = 0;

    @Column(name = "orders_completed")
    @Builder.Default
    private Integer ordersCompleted = 0;

    @Column(name = "orders_cancelled")
    @Builder.Default
    private Integer ordersCancelled = 0;

    @Column(name = "total_revenue", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalRevenue = BigDecimal.ZERO;

    @Column(name = "otif_rate", precision = 5, scale = 2)
    private BigDecimal otifRate;

    @Column(name = "avg_lead_time_days", precision = 6, scale = 2)
    private BigDecimal avgLeadTimeDays;

    @Column(name = "inventory_turnover_ratio", precision = 8, scale = 4)
    private BigDecimal inventoryTurnoverRatio;

    @Column(name = "avg_stock_level", precision = 12, scale = 2)
    private BigDecimal avgStockLevel;

    @Column(name = "stockout_events")
    @Builder.Default
    private Integer stockoutEvents = 0;

    @Column(name = "total_invoiced", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalInvoiced = BigDecimal.ZERO;

    @Column(name = "total_collected", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalCollected = BigDecimal.ZERO;

    @Column(name = "accounts_receivable", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal accountsReceivable = BigDecimal.ZERO;

    @Column(name = "dso_days", precision = 6, scale = 2)
    private BigDecimal dsoDays;

    @Column(name = "overdue_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal overdueAmount = BigDecimal.ZERO;

    @Column(name = "avg_supplier_fill_rate", precision = 5, scale = 2)
    private BigDecimal avgSupplierFillRate;

    @Column(name = "computed_at", nullable = false)
    private Instant computedAt;

    @PrePersist
    public void prePersist() {
        this.computedAt = Instant.now();
    }
}
