package com.marianciuc.nexifly.users.controller;

import com.marianciuc.nexifly.users.domain.dto.request.UpdateCompanyRequest;
import com.marianciuc.nexifly.users.domain.dto.request.VerifyCompanyRequest;
import com.marianciuc.nexifly.users.domain.dto.response.CompanyResponse;
import com.marianciuc.nexifly.users.domain.enums.VerificationStatus;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RequestMapping("/api/v1/companies")
public interface CompaniesController {

    @GetMapping("/{id}")
    ResponseEntity<CompanyResponse> getCompany(@PathVariable UUID id);

    @GetMapping
    ResponseEntity<List<CompanyResponse>> getCompanies(@RequestParam(required = false) VerificationStatus status);

    @PatchMapping("/{id}/verify")
    ResponseEntity<CompanyResponse> verifyCompany(@PathVariable UUID id, @Valid @RequestBody VerifyCompanyRequest request);

    @PutMapping("/{id}")
    ResponseEntity<CompanyResponse> updateCompany(@PathVariable UUID id, @RequestBody UpdateCompanyRequest request);

    @PatchMapping("/{id}/block")
    ResponseEntity<CompanyResponse> blockCompany(@PathVariable UUID id);
}
