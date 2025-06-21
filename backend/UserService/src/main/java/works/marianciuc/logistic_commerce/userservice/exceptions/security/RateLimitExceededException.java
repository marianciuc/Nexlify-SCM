package works.marianciuc.logistic_commerce.userservice.exceptions.security;

import works.marianciuc.logistic_commerce.userservice.exceptions.general.UnauthorizedException;

/** Exception thrown when rate limiting is exceeded. */
public class RateLimitExceededException extends UnauthorizedException {

  private static final String MESSAGE = "errors.security.rate_limit.exceeded";
  private static final String DOMAIN = "RATE_LIMIT_EXCEEDED";

  public RateLimitExceededException() {
    super(MESSAGE, DOMAIN);
  }

  public RateLimitExceededException(int maxAttempts, String timeWindow) {
    super(
        "errors.security.rate_limit.exceeded_details",
        DOMAIN,
        String.valueOf(maxAttempts),
        timeWindow);
  }
}
