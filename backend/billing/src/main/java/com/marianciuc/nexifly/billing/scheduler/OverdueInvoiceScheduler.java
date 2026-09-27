package com.marianciuc.nexifly.billing.scheduler;

import com.marianciuc.nexifly.billing.domain.entity.InvoiceEn;
import com.marianciuc.nexifly.billing.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@EnableScheduling
@RequiredArgsConstructor
public class OverdueInvoiceScheduler {

    private final InvoiceRepository invoiceRepository;

    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void processOverdueInvoices() {
        log.info("Running daily overdue invoices check");
        List<InvoiceEn> overdueInvoices = invoiceRepository.findByStatusAndDueDateBefore("ISSUED", LocalDate.now());
        for (InvoiceEn inv : overdueInvoices) {
            inv.setStatus("OVERDUE");
            invoiceRepository.save(inv);
            log.warn("Invoice {} is now OVERDUE (due date: {}, amount: {} {})",
                    inv.getInvoiceNumber(), inv.getDueDate(), inv.getGrossAmount(), inv.getCurrency());
        }
    }
}
