package com.marianciuc.nexifly.users.service.impl;

import com.marianciuc.nexifly.users.domain.dto.request.VerifyCompanyRequest;
import com.marianciuc.nexifly.users.domain.dto.response.CompanyResponse;
import com.marianciuc.nexifly.users.domain.enums.VerificationStatus;
import com.marianciuc.nexifly.users.exception.CompanyNotFoundException;
import com.marianciuc.nexifly.users.exception.InvalidStatusTransitionException;
import com.marianciuc.nexifly.users.mapper.EntityDtoMapper;
import com.marianciuc.nexifly.users.repository.CompanyRepository;
import com.marianciuc.nexifly.users.repository.entity.CompanyEn;
import com.marianciuc.nexifly.users.service.CompanyVerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyVerificationServiceImpl implements CompanyVerificationService {

    private final CompanyRepository companyRepository;
    private final EntityDtoMapper mapper;
    private final com.marianciuc.nexifly.users.kafka.UserEventProducer userEventProducer;

    @Override
    @Transactional
    public CompanyResponse verifyCompany(UUID companyId, VerifyCompanyRequest request) {
        log.info("Processing verification for companyId={}, targetStatus={}", companyId, request.getStatus());

        CompanyEn company = companyRepository.findById(companyId)
                .orElseThrow(() -> new CompanyNotFoundException(companyId));

        if (company.isDeleted()) {
            throw new InvalidStatusTransitionException("Cannot change verification status for a deleted/blocked company");
        }

        if (request.getStatus() == VerificationStatus.VERIFIED) {
            BigDecimal approvedLimit = request.getCreditLimit() != null ? request.getCreditLimit() : BigDecimal.ZERO;
            int termsDays = request.getPaymentsTermsDays() != null ? request.getPaymentsTermsDays() : 0;
            company.verify(approvedLimit, termsDays);
            log.info("Company {} successfully verified with creditLimit={}, termsDays={}", companyId, approvedLimit, termsDays);
        } else if (request.getStatus() == VerificationStatus.REJECTED) {
            company.reject();
            log.info("Company {} rejected by admin compliance", companyId);
        } else {
            company.setVerificationStatus(request.getStatus());
        }

        CompanyEn saved = companyRepository.save(company);
        if (saved.getVerificationStatus() == VerificationStatus.VERIFIED) {
            try {
                userEventProducer.sendCompanyVerified(new com.marianciuc.nexifly.users.kafka.events.CompanyVerifiedEvent(
                        saved.getId(),
                        saved.getLegalName(),
                        saved.getTaxId(),
                        saved.getOrganizationType() != null ? saved.getOrganizationType().name() : "BUYER",
                        saved.getCreditLimit(),
                        saved.getPaymentsTermsDays(),
                        java.time.Instant.now()
                ));
            } catch (Exception e) {
                log.warn("Failed to publish CompanyVerifiedEvent: {}", e.getMessage());
            }
        }
        return mapper.toCompanyResponse(saved);
    }

    @Override
    @Transactional
    public CompanyResponse blockCompany(UUID companyId) {
        log.info("Blocking companyId={}", companyId);
        CompanyEn company = companyRepository.findById(companyId)
                .orElseThrow(() -> new CompanyNotFoundException(companyId));

        company.block();
        CompanyEn saved = companyRepository.save(company);
        try {
            userEventProducer.sendCompanyBlocked(new com.marianciuc.nexifly.users.kafka.events.CompanyBlockedEvent(
                    saved.getId(),
                    "Admin blocked company",
                    java.time.Instant.now()
            ));
        } catch (Exception e) {
            log.warn("Failed to publish CompanyBlockedEvent: {}", e.getMessage());
        }
        return mapper.toCompanyResponse(saved);
    }

    @Override
    @Transactional
    public CompanyResponse unblockCompany(UUID companyId) {
        log.info("Unblocking companyId={}", companyId);
        CompanyEn company = companyRepository.findById(companyId)
                .orElseThrow(() -> new CompanyNotFoundException(companyId));

        company.setDeleted(false);
        company.setDeletedAt(null);
        CompanyEn saved = companyRepository.save(company);
        return mapper.toCompanyResponse(saved);
    }
}
