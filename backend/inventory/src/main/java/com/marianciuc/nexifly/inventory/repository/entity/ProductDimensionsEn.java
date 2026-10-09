package com.marianciuc.nexifly.inventory.repository.entity;

import com.marianciuc.nexifly.inventory.domain.enums.DimensionUnit;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "product_dimensions", schema = "inventory")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDimensionsEn extends BaseAuditableEntityEn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private ProductEn product;

    @Column(name = "height", precision = 10, scale = 2)
    private BigDecimal height;

    @Column(name = "width", precision = 10, scale = 2)
    private BigDecimal width;

    @Column(name = "depth", precision = 10, scale = 2)
    private BigDecimal depth;

    @Enumerated(EnumType.STRING)
    @Column(name = "dimension_unit", length = 20)
    @Builder.Default
    private DimensionUnit dimensionUnit = DimensionUnit.CM;

    /**
     * Helper to compute volume in cubic meters (assuming dimensionUnit).
     */
    public BigDecimal calculateVolumeM3() {
        if (height == null || width == null || depth == null) {
            return null;
        }
        double factorToMeters = switch (dimensionUnit != null ? dimensionUnit : DimensionUnit.CM) {
            case MM -> 0.001;
            case CM -> 0.01;
            case M -> 1.0;
            case INCH -> 0.0254;
        };
        double hMeters = height.doubleValue() * factorToMeters;
        double wMeters = width.doubleValue() * factorToMeters;
        double dMeters = depth.doubleValue() * factorToMeters;
        return BigDecimal.valueOf(hMeters * wMeters * dMeters);
    }
}
