package works.marianciuc.logistic_commerce.userservice.services;

import works.marianciuc.logistic_commerce.userservice.domain.entity.Company;

public interface CompanyExecutorService {
  Company execute(String taxId);

  boolean supports(String countryCode);
}
