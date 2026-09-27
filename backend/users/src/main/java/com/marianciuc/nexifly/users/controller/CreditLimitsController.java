package com.marianciuc.nexifly.users.controller;

import com.marianciuc.nexifly.users.domain.enums.Currency;
import com.marianciuc.nexifly.users.exception.CompanyNotFoundException;
import com.marianciuc.nexifly.users.repository.CompanyCreditLimitRepository;
import com.marianciuc.nexifly.users.repository.CompanyRepository;
import com.marianciuc.nexifly.users.repository.entity.CompanyCreditLimitEn;
import com.marianciuc.nexifly.users.repository.entity.CompanyEn;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/companies/{companyId}/credit-limit")
@RequiredArgsConstructor
@Slf4j
public class CreditLimitsController {

    private final CompanyRepository companyRepository;
    private final CompanyCreditLimitRepository creditLimitRepository;

    @Data
    @Builder
    public static class CreditLimitResponse {
        private UUID companyId;
        private BigDecimal limit;
        private BigDecimal used;
        private BigDecimal remainingLimit;
        private String currency;
        private int paymentTermsDays;
    }

    @Data
    public static class SetCreditLimitRequest {
        private BigDecimal limit;
        private String currency;
        private Integer paymentTermsDays;
        private String notes;
    }

    @GetMapping
    public ResponseEntity<CreditLimitResponse> getCreditLimit(@PathVariable UUID companyId) {
        CompanyEn company = companyRepository.findById(companyId)
                .orElseThrow(() -> new CompanyNotFoundException("Company not found: " + companyId));

        BigDecimal limit = company.getCreditLimit() != null ? company.getCreditLimit() : BigDecimal.ZERO;
        BigDecimal used = company.getCreditUsed() != null ? company.getCreditUsed() : BigDecimal.ZERO;
        BigDecimal remaining = limit.subtract(used).max(BigDecimal.ZERO);

        return ResponseEntity.ok(CreditLimitResponse.builder()
                .companyId(companyId)
                .limit(limit)
                .used(used)
                .remainingLimit(remaining)
                .currency("PLN")
                .paymentTermsDays(company.getPaymentsTermsDays())
                .build());
    }

    @PostMapping
    public ResponseEntity<CreditLimitResponse> setCreditLimit(
            @PathVariable UUID companyId,
            @RequestBody SetCreditLimitRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userId
    ) {
        CompanyEn company = companyRepository.findById(companyId)
                .orElseThrow(() -> new CompanyNotFoundException("Company not found: " + companyId));

        if (request.getLimit() != null) {
            company.setCreditLimit(request.getLimit());
        }
        if (request.getPaymentTermsDays() != null) {
            company.setPaymentsTermsDays(request.getPaymentTermsDays());
        }

        companyRepository.save(company);

        CompanyCreditLimitEn history = CompanyCreditLimitEn.builder()
                .company(company)
                .creditLimit(company.getCreditLimit())
                .creditUsed(company.getCreditUsed())
                .currency(Currency.PLN)
                .approvedBy(userId != null ? userId : "SYSTEM")
                .approvedAt(Instant.now())
                .notes(request.getNotes())
                .build();
        creditLimitRepository.save(history);

        BigDecimal remaining = company.getCreditLimit().subtract(company.getCreditUsed()).max(BigDecimal.ZERO);

        return ResponseEntity.ok(CreditLimitResponse.builder()
                .companyId(companyId)
                .limit(company.getCreditLimit())
                .used(company.getCreditUsed())
                .remainingLimit(remaining)
                .currency("PLN")
                .paymentTermsDays(company.getPaymentsTermsDays())
                .build());
    }

    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> checkCredit(
            @PathVariable UUID companyId,
            @RequestParam BigDecimal amount
    ) {
        CompanyEn company = companyRepository.findById(companyId)
                .orElseThrow(() -> new CompanyNotFoundException("Company not found: " + companyId));

        BigDecimal limit = company.getCreditLimit() != null ? company.getCreditLimit() : BigDecimal.ZERO;
        BigDecimal used = company.getCreditUsed() != null ? company.getCreditUsed() : BigDecimal.ZERO;
        BigDecimal remaining = limit.subtract(used);

        boolean approved = remaining.compareTo(amount) >= 0;

        return ResponseEntity.ok(Map.of(
                "companyId", companyId,
                "requestedAmount", amount,
                "approved", approved,
                "remainingLimit", remaining.max(BigDecimal.ZERO),
                "currency", "PLN"
        ));
    }
}
