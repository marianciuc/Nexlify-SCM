package works.marianciuc.logistic_commerce.userservice.keycloak.exception;

/**
 * Base exception for all Keycloak-related operations. This exception serves as the parent class for
 * all specific Keycloak exceptions, providing a common interface for error handling.
 */
public abstract class KeycloakException extends RuntimeException {

  protected KeycloakException(String message) {
    super(message);
  }

  protected KeycloakException(String message, Throwable cause) {
    super(message, cause);
  }

  protected KeycloakException(Throwable cause) {
    super(cause);
  }

  /**
   * Returns the error code associated with this exception. Subclasses should override this method
   * to provide specific error codes.
   *
   * @return the error code
   */
  public abstract String getErrorCode();

  /**
   * Returns additional context information about the error. This can include details like realm
   * name, user ID, etc.
   *
   * @return error context or null if no context is available
   */
  public String getErrorContext() {
    return null;
  }
}
