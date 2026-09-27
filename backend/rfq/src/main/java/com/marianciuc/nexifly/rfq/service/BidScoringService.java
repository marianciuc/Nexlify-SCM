package com.marianciuc.nexifly.rfq.service;

import com.marianciuc.nexifly.rfq.domain.entity.BidEn;
import com.marianciuc.nexifly.rfq.domain.entity.RfqRequestEn;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class BidScoringService {

    public void scoreBids(RfqRequestEn rfq) {
        List<BidEn> bids = rfq.getBids();
        if (bids == null || bids.isEmpty()) return;

        BigDecimal minPrice = bids.stream()
                .map(BidEn::getTotalPrice)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ONE);

        for (BidEn bid : bids) {
            BigDecimal priceScore = minPrice.divide(bid.getTotalPrice(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));

            // Weight: 70% price, 30% speed/quality
            BigDecimal finalScore = priceScore.multiply(BigDecimal.valueOf(0.70))
                    .add(BigDecimal.valueOf(30.00))
                    .setScale(2, RoundingMode.HALF_UP);

            bid.setScore(finalScore);
        }
    }
}
