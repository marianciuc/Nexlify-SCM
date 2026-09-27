package com.marianciuc.nexifly.users.service;

import com.marianciuc.nexifly.users.domain.dto.request.UpdateCompanyRequest;
import com.marianciuc.nexifly.users.domain.dto.response.CompanyResponse;
import com.marianciuc.nexifly.users.domain.enums.VerificationStatus;

import java.util.List;
import java.util.UUID;

public interface CompanyUpdatingService {

    CompanyResponse updateCompany(UUID companyId, UpdateCompanyRequest request);

    CompanyResponse getCompanyById(UUID companyId);

    List<CompanyResponse> getAllCompanies(VerificationStatus status);
}
