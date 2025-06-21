package works.marianciuc.logistic_commerce.userservice.exceptions.security;

import works.marianciuc.logistic_commerce.userservice.exceptions.general.UnauthorizedException;

/** Exception thrown when session has expired or is invalid. */
public class SessionExpiredException extends UnauthorizedException {

  private static final String MESSAGE = "errors.security.session.expired";
  private static final String DOMAIN = "SESSION_EXPIRED";

  public SessionExpiredException() {
    super(MESSAGE, DOMAIN);
  }

  public SessionExpiredException(String sessionId) {
    super("errors.security.session.expired_id", DOMAIN, sessionId);
  }
}
