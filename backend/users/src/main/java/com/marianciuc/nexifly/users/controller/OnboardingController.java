package com.marianciuc.nexifly.users.controller;

import com.marianciuc.nexifly.users.domain.dto.request.OnboardCompanyRequest;
import com.marianciuc.nexifly.users.domain.dto.response.OnboardCompanyResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RequestMapping("/api/v1/onboarding")
public interface OnboardingController {

    @PostMapping("/company")
    ResponseEntity<OnboardCompanyResponse> onboardCompany(@Valid @RequestBody OnboardCompanyRequest request);

    @GetMapping("/validate-tax-id")
    ResponseEntity<Map<String, Object>> validateTaxId(@RequestParam String taxId);
}
