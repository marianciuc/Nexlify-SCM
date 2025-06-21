package works.marianciuc.logistic_commerce.userservice.aspects;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import works.marianciuc.logistic_commerce.userservice.annotations.UserAccessValidation;
import works.marianciuc.logistic_commerce.userservice.domain.dto.CredentialsRequest;
import works.marianciuc.logistic_commerce.userservice.domain.enums.Resource;
import works.marianciuc.logistic_commerce.userservice.validation.AccessPermissionChecker;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class UserResourceAccessAspect {

  private final AccessPermissionChecker userAccessService;

  @Before("@annotation(userAccessValidation) && args(credentials, resource, ..)")
  public void checkUserAccess(
      UserAccessValidation userAccessValidation,
      @RequestBody CredentialsRequest credentials,
      @RequestParam Resource resource) {
    log.debug("UserResourceAccessAspect::checkUserAccess called");

    if (!userAccessService.isUserAllowedToAccess(credentials.email(), resource)) {
      throw new AccessDeniedException("Access denied for user with email: " + credentials.email());
    }
  }
}
