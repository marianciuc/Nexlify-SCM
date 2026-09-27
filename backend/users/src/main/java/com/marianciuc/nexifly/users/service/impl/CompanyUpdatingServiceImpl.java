package com.marianciuc.nexifly.users.service.impl;

import com.marianciuc.nexifly.users.domain.dto.request.UpdateCompanyRequest;
import com.marianciuc.nexifly.users.domain.dto.response.CompanyResponse;
import com.marianciuc.nexifly.users.domain.enums.VerificationStatus;
import com.marianciuc.nexifly.users.exception.CompanyNotFoundException;
import com.marianciuc.nexifly.users.mapper.EntityDtoMapper;
import com.marianciuc.nexifly.users.repository.CompanyRepository;
import com.marianciuc.nexifly.users.repository.entity.CompanyEn;
import com.marianciuc.nexifly.users.service.CompanyUpdatingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyUpdatingServiceImpl implements CompanyUpdatingService {

    private final CompanyRepository companyRepository;
    private final EntityDtoMapper mapper;

    @Override
    @Transactional
    public CompanyResponse updateCompany(UUID companyId, UpdateCompanyRequest request) {
        CompanyEn company = companyRepository.findById(companyId)
                .orElseThrow(() -> new CompanyNotFoundException(companyId));

        if (request.getTradeName() != null && !request.getTradeName().isBlank()) {
            company.setTradeName(request.getTradeName());
        }
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            company.setPhone(request.getPhone());
        }
        if (request.getWebsite() != null && !request.getWebsite().isBlank()) {
            company.setWebsite(request.getWebsite());
        }

        CompanyEn saved = companyRepository.save(company);
        return mapper.toCompanyResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyResponse getCompanyById(UUID companyId) {
        CompanyEn company = companyRepository.findById(companyId)
                .orElseThrow(() -> new CompanyNotFoundException(companyId));
        return mapper.toCompanyResponse(company);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyResponse> getAllCompanies(VerificationStatus status) {
        List<CompanyEn> companies;
        if (status != null) {
            companies = companyRepository.findAllByVerificationStatus(status);
        } else {
            companies = companyRepository.findAllByIsDeletedFalse();
        }
        return companies.stream().map(mapper::toCompanyResponse).collect(Collectors.toList());
    }
}
