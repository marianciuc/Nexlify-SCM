package works.marianciuc.logistic_commerce.userservice.services.impl;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import works.marianciuc.logistic_commerce.userservice.domain.dto.CreateCompanyEmployeeAccountDto;
import works.marianciuc.logistic_commerce.userservice.domain.model.User;
import works.marianciuc.logistic_commerce.userservice.exceptions.company.CompanyNotFoundException;
import works.marianciuc.logistic_commerce.userservice.mappers.UserMapper;
import works.marianciuc.logistic_commerce.userservice.repositories.CompanyRepository;
import works.marianciuc.logistic_commerce.userservice.repositories.UserRepository;
import works.marianciuc.logistic_commerce.userservice.repositories.entity.CompanyEn;
import works.marianciuc.logistic_commerce.userservice.repositories.entity.UserEn;
import works.marianciuc.logistic_commerce.userservice.services.CompanyWorkersManagementService;
import works.marianciuc.logistic_commerce.userservice.services.RegistrationService;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyWorkersManagementServiceImpl implements CompanyWorkersManagementService {

  private final CompanyRepository companyRepository;
  private final UserRepository userRepository;
  private final UserMapper userMapper;
  private final RegistrationService registrationService;

  @Override
  @Transactional
  public void createCompanyEmployeeAccount(UUID companyId, CreateCompanyEmployeeAccountDto dto) {
    //    log.debug("Creating company employee account for company ID: {}", companyId);
    //
    //    // Find company
    //    CompanyEn company = companyRepository.findById(companyId)
    //        .orElseThrow(() -> {
    //          log.error("Company with ID {} not found", companyId);
    //          return new CompanyNotFoundException("Company with ID " + companyId + " not found");
    //        });
    //
    //    // Register user with Keycloak
    //    registrationService.register(dto.email(), dto.password());
    //
    //    // Create user entity
    //    UserEn user = UserEn.builder()
    //        .email(dto.getEmail())
    //        .firstName(dto.getFirstName())
    //        .lastName(dto.getLastName())
    //        .contactNumber(dto.getContactNumber())
    //        .timezone("UTC") // Default timezone
    //        .country(dto.getCountry() != null ? Regions.valueOf(dto.getCountry()) :
    // Regions.UNKNOWN)
    //        .company(company)
    //        .build();
    //
    //    // Save user
    //    UserEn savedUser = userRepository.save(user);
    //    log.info("Company employee account created with ID: {} for company ID: {}",
    // savedUser.getId(), companyId);
  }

  @Override
  @Transactional
  public void unassignCompanyEmployeeAccount(UUID companyId, UUID employeeId) {
    //    log.debug("Unassigning company employee account with ID: {} from company ID: {}",
    // employeeId, companyId);
    //
    //    // Find company
    //    CompanyEn company = companyRepository.findById(companyId)
    //        .orElseThrow(() -> {
    //          log.error("Company with ID {} not found", companyId);
    //          return new CompanyNotFoundException("Company with ID " + companyId + " not found");
    //        });
    //
    //    // Find user
    //    UserEn user = userRepository.findById(employeeId)
    //        .orElseThrow(() -> {
    //          log.error("User with ID {} not found", employeeId);
    //          return new UserNotFoundException("User with ID " + employeeId + " not found");
    //        });
    //
    //    // Check if user belongs to the company
    //    if (user.getCompany() == null || !user.getCompany().getId().equals(companyId)) {
    //      log.error("User with ID {} does not belong to company with ID {}", employeeId,
    // companyId);
    //      throw new IllegalArgumentException("User does not belong to the specified company");
    //    }
    //
    //    // Create a new user entity with the same data but without company association
    //    UserEn updatedUser = UserEn.builder()
    //        .id(user.getId())
    //        .email(user.getEmail())
    //        .isEmailVerified(user.isEmailVerified())
    //        .firstName(user.getFirstName())
    //        .lastName(user.getLastName())
    //        .contactNumber(user.getContactNumber())
    //        .timezone(user.getTimezone())
    //        .country(user.getCountry())
    //        .accountStatus(user.getAccountStatus())
    //        .dataProcessingConsent(user.hasDataProcessingConsent())
    //        .build();
    //
    //    // Save updated user
    //    userRepository.save(updatedUser);
    //    log.info("Company employee account with ID: {} unassigned from company ID: {}",
    // employeeId, companyId);
  }

  @Override
  @Transactional(readOnly = true)
  public List<User> getCompanyEmployeeAccounts(UUID companyId) {
    log.debug("Getting company employee accounts for company ID: {}", companyId);

    // Find company
    CompanyEn company =
        companyRepository
            .findById(companyId)
            .orElseThrow(
                () -> {
                  log.error("Company with ID {} not found", companyId);
                  return new CompanyNotFoundException(
                      "Company with ID " + companyId + " not found");
                });

    // Find all users associated with the company
    List<UserEn> users =
        userRepository.findAll().stream()
            .filter(
                user -> user.getCompany() != null && user.getCompany().getId().equals(companyId))
            .collect(Collectors.toList());

    // Convert to DTOs
    return users.stream().map(userMapper::toDto).collect(Collectors.toList());
  }
}
