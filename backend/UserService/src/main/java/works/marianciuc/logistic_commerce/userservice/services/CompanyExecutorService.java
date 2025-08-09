package works.marianciuc.logistic_commerce.userservice.services;

import works.marianciuc.logistic_commerce.userservice.repositories.entity.CompanyEn;

public interface CompanyExecutorService {
  CompanyEn execute(String taxId);

  boolean supports(String countryCode);
}
