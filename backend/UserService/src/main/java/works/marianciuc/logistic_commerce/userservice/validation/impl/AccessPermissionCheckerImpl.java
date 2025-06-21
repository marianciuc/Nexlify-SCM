package works.marianciuc.logistic_commerce.userservice.validation.impl;

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
  public boolean isUserAllowedToAccess(String email, Resource resource)
      throws UserNotFoundException {
    if (email == null || email.isEmpty()) {
      throw new IllegalArgumentException("email is null or empty");
    }
    UserDto user = userManagementService.getUserByEmail(email);
    return resource.isIncluded(user.companyRole());
  }
}
