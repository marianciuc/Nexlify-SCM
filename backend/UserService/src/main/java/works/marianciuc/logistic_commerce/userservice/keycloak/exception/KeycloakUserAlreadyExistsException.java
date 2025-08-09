package works.marianciuc.logistic_commerce.userservice.keycloak.exception;

import lombok.Getter;

@Getter
public class KeycloakUserAlreadyExistsException extends KeycloakException {

  private static final String ERROR_CODE = "KEYCLOAK_USER_ALREADY_EXISTS_ERROR";

  public KeycloakUserAlreadyExistsException(String message) {
    super(message);
  }

  protected KeycloakUserAlreadyExistsException(String message, Throwable cause) {
    super(message, cause);
  }

  protected KeycloakUserAlreadyExistsException(Throwable cause) {
    super(cause);
  }

  @Override
  public String getErrorCode() {
    return ERROR_CODE;
  }
}
