package works.marianciuc.logistic_commerce.userservice.services;

import java.util.List;
import java.util.UUID;
import works.marianciuc.logistic_commerce.userservice.domain.dto.CompanyDto;
import works.marianciuc.logistic_commerce.userservice.domain.dto.CreateCompanyRequest;
import works.marianciuc.logistic_commerce.userservice.domain.qfilters.CompanySearchFilter;
import works.marianciuc.logistic_commerce.userservice.exceptions.company.CompanyAlreadyExistsException;

public interface CompanyService {
  CompanyDto createCompany(CreateCompanyRequest request) throws CompanyAlreadyExistsException;

  void verifyCompany(UUID id);

  void rejectCompany(UUID id);

  void blockCompany(UUID id);

  void unblockCompany(UUID id);

  CompanyDto getCompanyById(UUID id);

  CompanyDto getCompanyByTaxId(String taxId);

  List<CompanyDto> findAllCompanies(CompanySearchFilter filter);
}
