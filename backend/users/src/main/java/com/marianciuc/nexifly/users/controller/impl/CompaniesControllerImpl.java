package com.marianciuc.nexifly.users.controller.impl;

import com.marianciuc.nexifly.users.controller.CompaniesController;
import com.marianciuc.nexifly.users.domain.dto.request.UpdateCompanyRequest;
import com.marianciuc.nexifly.users.domain.dto.request.VerifyCompanyRequest;
import com.marianciuc.nexifly.users.domain.dto.response.CompanyResponse;
import com.marianciuc.nexifly.users.domain.enums.VerificationStatus;
import com.marianciuc.nexifly.users.service.CompanyUpdatingService;
import com.marianciuc.nexifly.users.service.CompanyVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class CompaniesControllerImpl implements CompaniesController {

    private final CompanyUpdatingService companyUpdatingService;
    private final CompanyVerificationService companyVerificationService;

    @Override
    public ResponseEntity<CompanyResponse> getCompany(UUID id) {
        return ResponseEntity.ok(companyUpdatingService.getCompanyById(id));
    }

    @Override
    public ResponseEntity<List<CompanyResponse>> getCompanies(VerificationStatus status) {
        return ResponseEntity.ok(companyUpdatingService.getAllCompanies(status));
    }

    @Override
    public ResponseEntity<CompanyResponse> verifyCompany(UUID id, VerifyCompanyRequest request) {
        return ResponseEntity.ok(companyVerificationService.verifyCompany(id, request));
    }

    @Override
    public ResponseEntity<CompanyResponse> updateCompany(UUID id, UpdateCompanyRequest request) {
        return ResponseEntity.ok(companyUpdatingService.updateCompany(id, request));
    }

    @Override
    public ResponseEntity<CompanyResponse> blockCompany(UUID id) {
        return ResponseEntity.ok(companyVerificationService.blockCompany(id));
    }
}
