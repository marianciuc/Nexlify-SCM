package com.marianciuc.nexifly.rfq.scheduler;

import com.marianciuc.nexifly.rfq.domain.entity.RfqRequestEn;
import com.marianciuc.nexifly.rfq.repository.RfqRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Slf4j
@Component
@EnableScheduling
@RequiredArgsConstructor
public class RfqDeadlineScheduler {

    private final RfqRequestRepository rfqRepository;

    @Scheduled(cron = "0 */5 * * * *")
    @Transactional
    public void processDeadlines() {
        log.info("Checking for expired or evaluating RFQ deadlines");
        List<RfqRequestEn> pastDeadline = rfqRepository.findByStatusAndDeadlineBefore("PUBLISHED", Instant.now());

        for (RfqRequestEn rfq : pastDeadline) {
            if (rfq.getBids() != null && !rfq.getBids().isEmpty()) {
                rfq.setStatus("EVALUATING");
                log.info("RFQ {} moved to EVALUATING (bids count: {})", rfq.getRfqNumber(), rfq.getBids().size());
            } else {
                rfq.setStatus("EXPIRED");
                log.info("RFQ {} expired with 0 bids", rfq.getRfqNumber());
            }
            rfqRepository.save(rfq);
        }
    }
}
