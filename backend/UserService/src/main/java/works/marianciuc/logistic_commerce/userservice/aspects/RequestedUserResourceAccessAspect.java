package works.marianciuc.logistic_commerce.userservice.aspects;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import works.marianciuc.logistic_commerce.userservice.annotations.RequestedUserAccessValidation;
import works.marianciuc.logistic_commerce.userservice.domain.dto.CredentialsRequest;
import works.marianciuc.logistic_commerce.userservice.domain.enums.Resource;
import works.marianciuc.logistic_commerce.userservice.exceptions.security.AccessDeniedException;
import works.marianciuc.logistic_commerce.userservice.validation.AccessPermissionChecker;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class RequestedUserResourceAccessAspect {

  private final AccessPermissionChecker userAccessService;

  @Before(
      value = "@annotation(requestedUserAccessValidation) && args(credentials, resource, ..)",
      argNames = "requestedUserAccessValidation,credentials,resource")
  public void checkUserAccess(
      RequestedUserAccessValidation requestedUserAccessValidation,
      @RequestBody CredentialsRequest credentials,
      @RequestParam Resource resource) {
    log.debug("UserResourceAccessAspect::checkUserAccess called");

    if (!userAccessService.isUserAllowedToAccess(credentials.email(), resource)) {
      throw new AccessDeniedException();
    }
  }
}
