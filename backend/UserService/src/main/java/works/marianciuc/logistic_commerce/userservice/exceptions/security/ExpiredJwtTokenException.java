package works.marianciuc.logistic_commerce.userservice.exceptions.security;

import works.marianciuc.logistic_commerce.userservice.exceptions.general.UnauthorizedException;

public class ExpiredJwtTokenException extends UnauthorizedException {

  private static final String MESSAGE = "errors.security.token.expired";
  private static final String DOMAIN = "JWT_TOKEN_EXPIRED";

  public ExpiredJwtTokenException(String message, String domain) {
    super(message, domain);
  }
}
