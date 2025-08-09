package works.marianciuc.logistic_commerce.userservice.keycloak.exception;

import lombok.Getter;

/**
 * Exception thrown when there are connection issues with Keycloak server. This includes network
 * timeouts, connection refused, DNS resolution failures, etc.
 */
@Getter
public class KeycloakConnectionException extends KeycloakException {

  private static final String ERROR_CODE = "KEYCLOAK_CONNECTION_ERROR";
  private final String serverUrl;

  public KeycloakConnectionException(String message, String serverUrl) {
    super(message);
    this.serverUrl = serverUrl;
  }

  public KeycloakConnectionException(String message, String serverUrl, Throwable cause) {
    super(message, cause);
    this.serverUrl = serverUrl;
  }

  public KeycloakConnectionException(String serverUrl, Throwable cause) {
    super("Failed to connect to Keycloak server: " + serverUrl, cause);
    this.serverUrl = serverUrl;
  }

  @Override
  public String getErrorCode() {
    return ERROR_CODE;
  }

  @Override
  public String getErrorContext() {
    return "Server URL: " + serverUrl;
  }
}
