package com.marianciuc.nexifly.users.controller.impl;

import com.marianciuc.nexifly.users.controller.OnboardingController;
import com.marianciuc.nexifly.users.domain.dto.request.OnboardCompanyRequest;
import com.marianciuc.nexifly.users.domain.dto.response.OnboardCompanyResponse;
import com.marianciuc.nexifly.users.service.CompanyCreatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class OnboardingControllerImpl implements OnboardingController {

    private final CompanyCreatingService companyCreatingService;

    @Override
    public ResponseEntity<OnboardCompanyResponse> onboardCompany(OnboardCompanyRequest request) {
        OnboardCompanyResponse response = companyCreatingService.onboardCompany(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Override
    public ResponseEntity<Map<String, Object>> validateTaxId(String taxId) {
        boolean isValid = companyCreatingService.validateTaxId(taxId);
        return ResponseEntity.ok(Map.of(
                "taxId", taxId,
                "valid", isValid
        ));
    }
}
