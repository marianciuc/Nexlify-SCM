package com.marianciuc.nexifly.orders.domain.entity;

import com.marianciuc.nexifly.orders.domain.enums.OrderStatus;
import com.marianciuc.nexifly.orders.domain.fsm.OrderFsm;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders", schema = "orders")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderEn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "order_number", nullable = false, unique = true)
    private String orderNumber;

    @Column(name = "tenant_id")
    private UUID tenantId;

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @Column(name = "supplier_id")
    private UUID supplierId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private OrderStatus status = OrderStatus.DRAFT;

    @Column(name = "currency", nullable = false)
    @Builder.Default
    private String currency = "PLN";

    @Column(name = "subtotal", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "vat_amount", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal vatAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "delivery_address")
    private String deliveryAddress;

    @Column(name = "delivery_city")
    private String deliveryCity;

    @Column(name = "delivery_postal_code")
    private String deliveryPostalCode;

    @Column(name = "requested_delivery_date")
    private LocalDate requestedDeliveryDate;

    @Column(name = "sla_deadline")
    private Instant slaDeadline;

    @Column(name = "sla_penalty_per_day", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal slaPenaltyPerDay = BigDecimal.ZERO;

    @Column(name = "notes")
    private String notes;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItemEn> items = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderStatusHistoryEn> statusHistory = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        if (this.status == null) this.status = OrderStatus.DRAFT;
        if (this.currency == null) this.currency = "PLN";
        if (this.subtotal == null) this.subtotal = BigDecimal.ZERO;
        if (this.vatAmount == null) this.vatAmount = BigDecimal.ZERO;
        if (this.totalAmount == null) this.totalAmount = BigDecimal.ZERO;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public void transitionTo(OrderStatus newStatus, UUID changedBy, String reason) {
        OrderFsm.validate(this.status, newStatus);
        OrderStatus oldStatus = this.status;
        this.status = newStatus;

        OrderStatusHistoryEn history = OrderStatusHistoryEn.builder()
                .order(this)
                .oldStatus(oldStatus != null ? oldStatus.name() : null)
                .newStatus(newStatus.name())
                .changedBy(changedBy)
                .reason(reason)
                .createdAt(Instant.now())
                .build();
        this.statusHistory.add(history);
    }

    public void recalculateTotals() {
        BigDecimal sumSubtotal = BigDecimal.ZERO;
        BigDecimal sumVat = BigDecimal.ZERO;
        for (OrderItemEn item : items) {
            if (item.getLineTotal() != null) {
                sumSubtotal = sumSubtotal.add(item.getLineTotal());
                BigDecimal vatRate = item.getVatRate() != null ? item.getVatRate() : BigDecimal.valueOf(23);
                BigDecimal lineVat = item.getLineTotal().multiply(vatRate).divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
                sumVat = sumVat.add(lineVat);
            }
        }
        this.subtotal = sumSubtotal;
        this.vatAmount = sumVat;
        this.totalAmount = sumSubtotal.add(sumVat);
    }
}
