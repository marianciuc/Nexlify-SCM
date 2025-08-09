package works.marianciuc.logistic_commerce.userservice.keycloak.exception;

import lombok.Getter;

/**
 * Exception thrown when there are configuration issues with Keycloak setup. This includes missing
 * properties, invalid configuration values, authentication failures due to wrong credentials, etc.
 */
@Getter
public class KeycloakConfigurationException extends KeycloakException {

  private static final String ERROR_CODE = "KEYCLOAK_CONFIGURATION_ERROR";
  private final String configurationKey;
  private final String configurationValue;

  public KeycloakConfigurationException(String message, String configurationKey) {
    super(message);
    this.configurationKey = configurationKey;
    this.configurationValue = null;
  }

  public KeycloakConfigurationException(
      String message, String configurationKey, String configurationValue) {
    super(message);
    this.configurationKey = configurationKey;
    this.configurationValue = configurationValue;
  }

  public KeycloakConfigurationException(String message, String configurationKey, Throwable cause) {
    super(message, cause);
    this.configurationKey = configurationKey;
    this.configurationValue = null;
  }

  public KeycloakConfigurationException(
      String message, String configurationKey, String configurationValue, Throwable cause) {
    super(message, cause);
    this.configurationKey = configurationKey;
    this.configurationValue = configurationValue;
  }

  /** Creates an exception for missing configuration property. */
  public static KeycloakConfigurationException missingProperty(String propertyName) {
    return new KeycloakConfigurationException(
        "Missing required Keycloak configuration property: " + propertyName, propertyName);
  }

  /** Creates an exception for invalid configuration value. */
  public static KeycloakConfigurationException invalidValue(
      String propertyName, String value, String expectedFormat) {
    return new KeycloakConfigurationException(
        String.format(
            "Invalid value for Keycloak configuration property '%s': '%s'. Expected format: %s",
            propertyName, value, expectedFormat),
        propertyName,
        value);
  }

  /** Creates an exception for authentication failures. */
  public static KeycloakConfigurationException authenticationFailed(
      String realm, String clientId, Throwable cause) {
    return new KeycloakConfigurationException(
        String.format("Authentication failed for realm '%s' with client '%s'", realm, clientId),
        "authentication",
        realm + "/" + clientId,
        cause);
  }

  @Override
  public String getErrorCode() {
    return ERROR_CODE;
  }

  @Override
  public String getErrorContext() {
    StringBuilder context = new StringBuilder();
    context.append("Configuration key: ").append(configurationKey);
    if (configurationValue != null) {
      context.append(", Value: ").append(configurationValue);
    }
    return context.toString();
  }
}
