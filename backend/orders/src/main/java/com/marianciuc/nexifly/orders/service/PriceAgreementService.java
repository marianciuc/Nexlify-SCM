package com.marianciuc.nexifly.orders.service;

import com.marianciuc.nexifly.orders.domain.entity.PriceAgreementEn;
import com.marianciuc.nexifly.orders.repository.PriceAgreementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PriceAgreementService {

    private final PriceAgreementRepository agreementRepository;

    public record AppliedPrice(
            BigDecimal unitPrice,
            BigDecimal discountPercent,
            boolean isAgreementApplied
    ) {}

    public AppliedPrice resolvePrice(UUID buyerId, UUID supplierId, String sku, BigDecimal fallbackPrice) {
        if (buyerId == null || supplierId == null || sku == null) {
            return new AppliedPrice(fallbackPrice, BigDecimal.ZERO, false);
        }

        LocalDate now = LocalDate.now();
        Optional<PriceAgreementEn> agreement = agreementRepository
                .findFirstByBuyerCompanyIdAndSupplierCompanyIdAndSkuAndValidFromLessThanEqualAndValidToGreaterThanEqual(
                        buyerId, supplierId, sku, now, now
                );

        if (agreement.isPresent()) {
            PriceAgreementEn pa = agreement.get();
            return new AppliedPrice(pa.getAgreedPrice(), pa.getDiscountPercent(), true);
        }

        return new AppliedPrice(fallbackPrice != null ? fallbackPrice : BigDecimal.ZERO, BigDecimal.ZERO, false);
    }
}
