package com.marianciuc.nexifly.users.service;

import com.marianciuc.nexifly.users.domain.dto.request.VerifyCompanyRequest;
import com.marianciuc.nexifly.users.domain.dto.response.CompanyResponse;

import java.util.UUID;

public interface CompanyVerificationService {

    CompanyResponse verifyCompany(UUID companyId, VerifyCompanyRequest request);

    CompanyResponse blockCompany(UUID companyId);

    CompanyResponse unblockCompany(UUID companyId);
}
