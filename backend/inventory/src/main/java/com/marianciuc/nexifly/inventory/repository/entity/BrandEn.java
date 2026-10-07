package com.marianciuc.nexifly.inventory.repository.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "product_dimensions", schema = "inventory")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrandEn {

    @OneToOne
    ProductEn product;

    BigDecimal height;
    BigDecimal width;
    BigDecimal depth;
}
