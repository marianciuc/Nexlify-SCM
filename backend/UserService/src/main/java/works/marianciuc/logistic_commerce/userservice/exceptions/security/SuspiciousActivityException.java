package works.marianciuc.logistic_commerce.userservice.exceptions.security;

import works.marianciuc.logistic_commerce.userservice.exceptions.general.ForbiddenException;

/** Exception thrown when suspicious activity is detected. */
public class SuspiciousActivityException extends ForbiddenException {

  private static final String MESSAGE = "errors.security.suspicious_activity.detected";
  private static final String DOMAIN = "SUSPICIOUS_ACTIVITY";

  public SuspiciousActivityException() {
    super(MESSAGE, DOMAIN);
  }

  public SuspiciousActivityException(String activityType) {
    super("errors.security.suspicious_activity.type", DOMAIN, activityType);
  }
}
