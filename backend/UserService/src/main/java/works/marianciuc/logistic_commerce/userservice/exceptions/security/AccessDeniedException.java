package works.marianciuc.logistic_commerce.userservice.exceptions.security;

import works.marianciuc.logistic_commerce.userservice.exceptions.general.ForbiddenException;

public class AccessDeniedException extends ForbiddenException {

  private static final String MESSAGE = "errors.business.access_denied";
  private static final String DOMAIN = "PROTECTED_RESOURCE";

  public AccessDeniedException() {
    super(MESSAGE, DOMAIN);
  }

  public AccessDeniedException(String message, String domain) {
    super(message, domain);
  }
}
