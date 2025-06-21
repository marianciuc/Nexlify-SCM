package works.marianciuc.logistic_commerce.userservice.aspects;

import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import works.marianciuc.logistic_commerce.userservice.annotations.RegistrationAspect;
import works.marianciuc.logistic_commerce.userservice.domain.dto.CredentialsRequest;
import works.marianciuc.logistic_commerce.userservice.domain.enums.Resource;

@Aspect
@Component
public class RegistrationProxyAspect {

  @Before("@annotation(registrationAspect) && args(credentials, resource, ..)")
  public void checkUserAccess(
      RegistrationAspect registrationAspect,
      @RequestBody CredentialsRequest credentials,
      @RequestParam Resource resource) {
    log.debug("UserResourceAccessAspect::checkUserAccess called");

    if (!userAccessService.isUserAllowedToAccess(credentials.email(), resource)) {
      throw new AccessDeniedException("Access denied for user with email: " + credentials.email());
    }
  }
}
