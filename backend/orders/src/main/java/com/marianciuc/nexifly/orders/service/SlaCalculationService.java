package com.marianciuc.nexifly.orders.service;

import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;

@Service
public class SlaCalculationService {

    public Instant calculateSlaDeadline(LocalDate startDate, boolean isExpress) {
        LocalDate current = startDate != null ? startDate : LocalDate.now();
        int businessDaysToAdd = isExpress ? 2 : 5;

        int added = 0;
        while (added < businessDaysToAdd) {
            current = current.plusDays(1);
            if (current.getDayOfWeek() != DayOfWeek.SATURDAY && current.getDayOfWeek() != DayOfWeek.SUNDAY) {
                added++;
            }
        }

        return current.atTime(18, 0).atZone(ZoneId.of("Europe/Warsaw")).toInstant();
    }
}
