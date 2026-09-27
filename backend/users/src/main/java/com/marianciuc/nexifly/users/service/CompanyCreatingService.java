package com.marianciuc.nexifly.users.service;

import com.marianciuc.nexifly.users.domain.dto.request.OnboardCompanyRequest;
import com.marianciuc.nexifly.users.domain.dto.response.OnboardCompanyResponse;

public interface CompanyCreatingService {

    OnboardCompanyResponse onboardCompany(OnboardCompanyRequest request);

    boolean validateTaxId(String taxId);
}
