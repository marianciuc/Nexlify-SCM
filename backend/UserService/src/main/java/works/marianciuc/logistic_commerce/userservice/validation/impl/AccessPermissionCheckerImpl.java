package works.marianciuc.logistic_commerce.userservice.validation.impl;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import works.marianciuc.logistic_commerce.userservice.domain.dto.UserDto;
import works.marianciuc.logistic_commerce.userservice.domain.enums.Resource;
import works.marianciuc.logistic_commerce.userservice.exceptions.user.UserNotFoundException;
import works.marianciuc.logistic_commerce.userservice.services.UserManagementService;
import works.marianciuc.logistic_commerce.userservice.validation.AccessPermissionChecker;

@Service
@Slf4j
@RequiredArgsConstructor
public class AccessPermissionCheckerImpl implements AccessPermissionChecker {

  private final UserManagementService userManagementService;

  @Override
  public boolean isUserAllowedToAccess(
      @Email(message = "errors.validation.email.invalid") String email, @NotNull Resource resource)
      throws UserNotFoundException {
    UserDto user = userManagementService.getUserByEmail(email);
    boolean hasAccess = resource.isIncluded(user.companyRole());

    log.debug(
        "Access check for email: {} to resource: {} - Result: {}", email, resource, hasAccess);

    return hasAccess;
  }
}
