package works.marianciuc.logistic_commerce.userservice.exceptions.security;

import works.marianciuc.logistic_commerce.userservice.exceptions.general.UnauthorizedException;

public class InvalidJwtTokenException extends UnauthorizedException {

  private static final String MESSAGE = "errors.security.invalid_jwt_token";
  private static final String DOMAIN = "JWT_TOKEN";

  public InvalidJwtTokenException(String message, String domain) {
    super(message, domain);
  }
}
