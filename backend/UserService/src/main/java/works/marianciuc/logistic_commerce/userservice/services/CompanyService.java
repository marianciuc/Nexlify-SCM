package works.marianciuc.logistic_commerce.userservice.services;

import java.util.List;
import java.util.UUID;
import works.marianciuc.logistic_commerce.userservice.domain.dto.requests.CreateCompanyRequest;
import works.marianciuc.logistic_commerce.userservice.domain.model.Company;
import works.marianciuc.logistic_commerce.userservice.domain.qfilters.CompanySearchFilter;
import works.marianciuc.logistic_commerce.userservice.exceptions.company.CompanyAlreadyExistsException;

public interface CompanyService {
  Company createCompany(CreateCompanyRequest request) throws CompanyAlreadyExistsException;

  void verifyCompany(UUID id);

  void rejectCompany(UUID id);

  void blockCompany(UUID id);

  void unblockCompany(UUID id);

  Company getCompanyById(UUID id);

  Company getCompanyByTaxId(String taxId);

  List<Company> findAllCompanies(CompanySearchFilter filter);
}
