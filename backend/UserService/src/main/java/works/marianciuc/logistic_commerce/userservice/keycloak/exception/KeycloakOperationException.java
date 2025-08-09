package works.marianciuc.logistic_commerce.userservice.keycloak.exception;

import lombok.Getter;

/**
 * Exception thrown when Keycloak operations fail. This includes API call failures, resource not
 * found, permission denied, unexpected response status codes, etc.
 */
@Getter
public class KeycloakOperationException extends KeycloakException {

  private static final String ERROR_CODE = "KEYCLOAK_OPERATION_ERROR";
  private final String operation;
  private final String resourceType;
  private final String resourceId;
  private final Integer httpStatusCode;

  public KeycloakOperationException(String message, String operation) {
    super(message);
    this.operation = operation;
    this.resourceType = null;
    this.resourceId = null;
    this.httpStatusCode = null;
  }

  public KeycloakOperationException(String message, String operation, Throwable cause) {
    super(message, cause);
    this.operation = operation;
    this.resourceType = null;
    this.resourceId = null;
    this.httpStatusCode = null;
  }

  public KeycloakOperationException(
      String message, String operation, String resourceType, String resourceId) {
    super(message);
    this.operation = operation;
    this.resourceType = resourceType;
    this.resourceId = resourceId;
    this.httpStatusCode = null;
  }

  public KeycloakOperationException(
      String message,
      String operation,
      String resourceType,
      String resourceId,
      Integer httpStatusCode) {
    super(message);
    this.operation = operation;
    this.resourceType = resourceType;
    this.resourceId = resourceId;
    this.httpStatusCode = httpStatusCode;
  }

  public KeycloakOperationException(
      String message, String operation, String resourceType, String resourceId, Throwable cause) {
    super(message, cause);
    this.operation = operation;
    this.resourceType = resourceType;
    this.resourceId = resourceId;
    this.httpStatusCode = null;
  }

  public KeycloakOperationException(
      String message,
      String operation,
      String resourceType,
      String resourceId,
      Integer httpStatusCode,
      Throwable cause) {
    super(message, cause);
    this.operation = operation;
    this.resourceType = resourceType;
    this.resourceId = resourceId;
    this.httpStatusCode = httpStatusCode;
  }

  /** Creates an exception for resource not found errors. */
  public static KeycloakOperationException resourceNotFound(
      String resourceType, String resourceId) {
    return new KeycloakOperationException(
        String.format("%s with ID '%s' not found", resourceType, resourceId),
        "GET",
        resourceType,
        resourceId,
        404);
  }

  /** Creates an exception for permission denied errors. */
  public static KeycloakOperationException permissionDenied(String operation, String resourceType) {
    return new KeycloakOperationException(
        String.format(
            "Permission denied for operation '%s' on resource type '%s'", operation, resourceType),
        operation,
        resourceType,
        null,
        403);
  }

  /** Creates an exception for unexpected HTTP status codes. */
  public static KeycloakOperationException unexpectedStatus(
      String operation, int expectedStatus, int actualStatus) {
    return new KeycloakOperationException(
        String.format(
            "Unexpected HTTP status for operation '%s'. Expected: %d, Actual: %d",
            operation, expectedStatus, actualStatus),
        operation,
        null,
        null,
        actualStatus);
  }

  /** Creates an exception for resource creation failures. */
  public static KeycloakOperationException creationFailed(
      String resourceType, String resourceId, Throwable cause) {
    return new KeycloakOperationException(
        String.format("Failed to create %s with ID '%s'", resourceType, resourceId),
        "CREATE",
        resourceType,
        resourceId,
        cause);
  }

  /** Creates an exception for resource update failures. */
  public static KeycloakOperationException updateFailed(
      String resourceType, String resourceId, Throwable cause) {
    return new KeycloakOperationException(
        String.format("Failed to update %s with ID '%s'", resourceType, resourceId),
        "UPDATE",
        resourceType,
        resourceId,
        cause);
  }

  /** Creates an exception for resource deletion failures. */
  public static KeycloakOperationException deletionFailed(
      String resourceType, String resourceId, Throwable cause) {
    return new KeycloakOperationException(
        String.format("Failed to delete %s with ID '%s'", resourceType, resourceId),
        "DELETE",
        resourceType,
        resourceId,
        cause);
  }

  @Override
  public String getErrorCode() {
    return ERROR_CODE;
  }

  @Override
  public String getErrorContext() {
    StringBuilder context = new StringBuilder();
    context.append("Operation: ").append(operation);
    if (resourceType != null) {
      context.append(", Resource type: ").append(resourceType);
    }
    if (resourceId != null) {
      context.append(", Resource ID: ").append(resourceId);
    }
    if (httpStatusCode != null) {
      context.append(", HTTP status: ").append(httpStatusCode);
    }
    return context.toString();
  }
}
