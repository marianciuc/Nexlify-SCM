package works.marianciuc.logistic_commerce.userservice.exceptions.security;

import works.marianciuc.logistic_commerce.userservice.exceptions.general.UnauthorizedException;

/** Exception thrown when authentication credentials are missing. */
public class MissingAuthenticationException extends UnauthorizedException {

  private static final String MESSAGE = "errors.security.authentication.missing";
  private static final String DOMAIN = "AUTHENTICATION_MISSING";

  public MissingAuthenticationException() {
    super(MESSAGE, DOMAIN);
  }

  public MissingAuthenticationException(String message) {
    super(message, DOMAIN);
  }
}
