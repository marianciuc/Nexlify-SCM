package works.marianciuc.logistic_commerce.userservice.services;

import java.util.List;
import java.util.UUID;
import works.marianciuc.logistic_commerce.userservice.domain.dto.CreateCompanyEmployeeAccountDto;
import works.marianciuc.logistic_commerce.userservice.domain.dto.UserDto;

public interface CompanyWorkersManagementService {
  void createCompanyEmployeeAccount(UUID companyId, CreateCompanyEmployeeAccountDto dto);

  void unassignCompanyEmployeeAccount(UUID companyId, UUID employeeId);

  List<UserDto> getCompanyEmployeeAccounts(UUID companyId);
}
