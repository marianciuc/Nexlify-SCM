package works.marianciuc.logistic_commerce.userservice.keycloak.util;

import jakarta.ws.rs.core.Response;
import java.util.function.Supplier;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import works.marianciuc.logistic_commerce.userservice.keycloak.exception.*;

/**
 * Utility class for standardized Keycloak response handling. Provides consistent error handling and
 * response processing across all Keycloak operations.
 */
@Slf4j
@Component
public class KeycloakResponseHandler {

  /**
   * Handles Keycloak admin client responses with proper error handling.
   *
   * @param operation the operation being performed (for logging and error context)
   * @param responseSupplier supplier that provides the Response
   * @param <T> the expected return type
   * @return the result of the operation
   * @throws KeycloakException if the operation fails
   */
  public <T> T handleAdminResponse(String operation, Supplier<Response> responseSupplier) {
    try {
      log.debug("Executing Keycloak admin operation: {}", operation);

      try (Response response = responseSupplier.get()) {
        int status = response.getStatus();

        if (isSuccessStatus(status)) {
          log.debug(
              "Keycloak admin operation '{}' completed successfully with status: {}",
              operation,
              status);
          return null; // Most admin operations don't return data
        } else {
          String errorMessage = extractErrorMessage(response);
          log.error(
              "Keycloak admin operation '{}' failed with status: {}, message: {}",
              operation,
              status,
              errorMessage);

          throw createOperationException(operation, status, errorMessage);
        }
      }
    } catch (KeycloakException e) {
      throw e; // Re-throw our own exceptions
    } catch (Exception e) {
      log.error(
          "Unexpected error during Keycloak admin operation '{}': {}",
          operation,
          e.getMessage(),
          e);
      throw new KeycloakOperationException(
          "Unexpected error during operation: " + operation, operation, e);
    }
  }

  /**
   * Handles Keycloak admin client responses that return data.
   *
   * @param operation the operation being performed
   * @param responseSupplier supplier that provides the Response
   * @param dataExtractor function to extract data from successful response
   * @param <T> the expected return type
   * @return the extracted data
   * @throws KeycloakException if the operation fails
   */
  public <T> T handleAdminResponseWithData(
      String operation,
      Supplier<Response> responseSupplier,
      ResponseDataExtractor<T> dataExtractor) {
    try {
      log.debug("Executing Keycloak admin operation with data: {}", operation);

      try (Response response = responseSupplier.get()) {
        int status = response.getStatus();

        if (isSuccessStatus(status)) {
          T data = dataExtractor.extract(response);
          log.debug(
              "Keycloak admin operation '{}' completed successfully with status: {}",
              operation,
              status);
          return data;
        } else {
          String errorMessage = extractErrorMessage(response);
          log.error(
              "Keycloak admin operation '{}' failed with status: {}, message: {}",
              operation,
              status,
              errorMessage);

          throw createOperationException(operation, status, errorMessage);
        }
      }
    } catch (KeycloakException e) {
      throw e; // Re-throw our own exceptions
    } catch (Exception e) {
      log.error(
          "Unexpected error during Keycloak admin operation '{}': {}",
          operation,
          e.getMessage(),
          e);
      throw new KeycloakOperationException(
          "Unexpected error during operation: " + operation, operation, e);
    }
  }

  /**
   * Handles REST template responses for token operations.
   *
   * @param operation the operation being performed
   * @param responseSupplier supplier that provides the ResponseEntity
   * @param <T> the expected return type
   * @return the response entity
   * @throws KeycloakException if the operation fails
   */
  public <T> ResponseEntity<T> handleRestResponse(
      String operation, Supplier<ResponseEntity<T>> responseSupplier) {
    try {
      log.debug("Executing Keycloak REST operation: {}", operation);

      ResponseEntity<T> response = responseSupplier.get();

      if (response.getStatusCode().is2xxSuccessful()) {
        log.debug(
            "Keycloak REST operation '{}' completed successfully with status: {}",
            operation,
            response.getStatusCode());
        return response;
      } else {
        log.error(
            "Keycloak REST operation '{}' failed with status: {}",
            operation,
            response.getStatusCode());

        throw KeycloakOperationException.unexpectedStatus(
            operation, 200, response.getStatusCode().value());
      }
    } catch (HttpClientErrorException e) {
      log.error(
          "Client error during Keycloak REST operation '{}': {} - {}",
          operation,
          e.getStatusCode(),
          e.getResponseBodyAsString());

      if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
        throw KeycloakConfigurationException.authenticationFailed("unknown", "unknown", e);
      } else if (e.getStatusCode() == HttpStatus.FORBIDDEN) {
        throw KeycloakOperationException.permissionDenied(operation, "unknown");
      } else {
        throw new KeycloakOperationException(
            "Client error during operation: " + operation + " - " + e.getResponseBodyAsString(),
            operation,
            e);
      }
    } catch (HttpServerErrorException e) {
      log.error(
          "Server error during Keycloak REST operation '{}': {} - {}",
          operation,
          e.getStatusCode(),
          e.getResponseBodyAsString());

      throw new KeycloakOperationException(
          "Server error during operation: " + operation + " - " + e.getResponseBodyAsString(),
          operation,
          e);
    } catch (ResourceAccessException e) {
      log.error(
          "Connection error during Keycloak REST operation '{}': {}", operation, e.getMessage());
      throw new KeycloakConnectionException(
          "Connection failed during operation: " + operation, "unknown", e);
    } catch (RestClientException e) {
      log.error("REST client error during Keycloak operation '{}': {}", operation, e.getMessage());
      throw new KeycloakOperationException(
          "REST client error during operation: " + operation, operation, e);
    } catch (KeycloakException e) {
      throw e; // Re-throw our own exceptions
    } catch (Exception e) {
      log.error(
          "Unexpected error during Keycloak REST operation '{}': {}", operation, e.getMessage(), e);
      throw new KeycloakOperationException(
          "Unexpected error during operation: " + operation, operation, e);
    }
  }

  /**
   * Validates that a resource exists, throwing an exception if not found.
   *
   * @param resourceType the type of resource (e.g., "user", "role", "realm")
   * @param resourceId the resource identifier
   * @param checkSupplier supplier that returns true if resource exists
   * @throws KeycloakOperationException if resource doesn't exist
   */
  public void validateResourceExists(
      String resourceType, String resourceId, Supplier<Boolean> checkSupplier) {
    try {
      if (!checkSupplier.get()) {
        throw KeycloakOperationException.resourceNotFound(resourceType, resourceId);
      }
    } catch (KeycloakException e) {
      throw e;
    } catch (Exception e) {
      log.error("Error checking if {} '{}' exists: {}", resourceType, resourceId, e.getMessage());
      throw new KeycloakOperationException(
          "Error checking resource existence: " + resourceType + " " + resourceId,
          "CHECK_EXISTS",
          resourceType,
          resourceId,
          e);
    }
  }

  private boolean isSuccessStatus(int status) {
    return status >= 200 && status < 300;
  }

  private String extractErrorMessage(Response response) {
    try {
      if (response.hasEntity()) {
        return response.readEntity(String.class);
      }
    } catch (Exception e) {
      log.debug("Could not extract error message from response: {}", e.getMessage());
    }
    return "HTTP " + response.getStatus();
  }

  private KeycloakException createOperationException(String operation, int status, String message) {
    return switch (status) {
      case 400 -> new KeycloakValidationException("Bad request: " + message, "request");
      case 401 -> KeycloakConfigurationException.authenticationFailed("unknown", "unknown", null);
      case 403 -> KeycloakOperationException.permissionDenied(operation, "unknown");
      case 404 -> KeycloakOperationException.resourceNotFound("unknown", "unknown");
      case 409 -> new KeycloakValidationException("Conflict: " + message, "conflict");
      default -> KeycloakOperationException.unexpectedStatus(operation, 200, status);
    };
  }

  /** Functional interface for extracting data from successful responses. */
  @FunctionalInterface
  public interface ResponseDataExtractor<T> {
    T extract(Response response) throws Exception;
  }
}
