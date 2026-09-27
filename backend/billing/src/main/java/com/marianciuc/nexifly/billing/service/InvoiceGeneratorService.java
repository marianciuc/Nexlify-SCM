package com.marianciuc.nexifly.billing.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RAtomicLong;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvoiceGeneratorService {

    private final RedissonClient redissonClient;

    public String generateInvoiceNumber() {
        LocalDate now = LocalDate.now();
        int year = now.getYear();
        int month = now.getMonthValue();
        String counterKey = String.format("billing:invoice:counter:%d:%02d", year, month);
        RAtomicLong counter = redissonClient.getAtomicLong(counterKey);
        long sequence = counter.incrementAndGet();
        return String.format("FV/%d/%02d/%05d", year, month, sequence);
    }

    public String generateCreditNoteNumber() {
        LocalDate now = LocalDate.now();
        int year = now.getYear();
        int month = now.getMonthValue();
        String counterKey = String.format("billing:credit-note:counter:%d:%02d", year, month);
        RAtomicLong counter = redissonClient.getAtomicLong(counterKey);
        long sequence = counter.incrementAndGet();
        return String.format("FV-KOR/%d/%02d/%05d", year, month, sequence);
    }
}
