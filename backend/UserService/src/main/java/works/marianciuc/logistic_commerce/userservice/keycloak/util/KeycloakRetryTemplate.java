package works.marianciuc.logistic_commerce.userservice.keycloak.util;

import java.util.concurrent.ThreadLocalRandom;
import java.util.function.Supplier;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import works.marianciuc.logistic_commerce.userservice.keycloak.config.KeycloakProperties;
import works.marianciuc.logistic_commerce.userservice.keycloak.exception.*;

/**
 * Utility class for implementing retry logic for Keycloak operations. Provides configurable retry
 * mechanisms with exponential backoff and jitter.
 */
@Slf4j
@Component
public class KeycloakRetryTemplate {

  private final KeycloakProperties keycloakProperties;

  public KeycloakRetryTemplate(KeycloakProperties keycloakProperties) {
    this.keycloakProperties = keycloakProperties;
  }

  /**
   * Executes an operation with retry logic using default configuration.
   *
   * @param operation the operation to execute
   * @param operationName name of the operation for logging
   * @param <T> the return type
   * @return the result of the operation
   * @throws KeycloakException if all retry attempts fail
   */
  public <T> T executeWithRetry(Supplier<T> operation, String operationName) {
    return executeWithRetry(
        operation, operationName, RetryConfig.defaultConfig(keycloakProperties));
  }

  /**
   * Executes an operation with retry logic using custom configuration.
   *
   * @param operation the operation to execute
   * @param operationName name of the operation for logging
   * @param config retry configuration
   * @param <T> the return type
   * @return the result of the operation
   * @throws KeycloakException if all retry attempts fail
   */
  public <T> T executeWithRetry(Supplier<T> operation, String operationName, RetryConfig config) {
    Exception lastException = null;

    for (int attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        log.debug(
            "Executing Keycloak operation '{}' (attempt {}/{})",
            operationName,
            attempt,
            config.maxAttempts);

        T result = operation.get();

        if (attempt > 1) {
          log.info(
              "Keycloak operation '{}' succeeded on attempt {}/{}",
              operationName,
              attempt,
              config.maxAttempts);
        }

        return result;

      } catch (Exception e) {
        lastException = e;

        if (!shouldRetry(e, attempt, config)) {
          log.error(
              "Keycloak operation '{}' failed permanently on attempt {}/{}: {}",
              operationName,
              attempt,
              config.maxAttempts,
              e.getMessage());
          break;
        }

        if (attempt < config.maxAttempts) {
          long delayMs = calculateDelay(attempt, config);
          log.warn(
              "Keycloak operation '{}' failed on attempt {}/{}, retrying in {}ms: {}",
              operationName,
              attempt,
              config.maxAttempts,
              delayMs,
              e.getMessage());

          try {
            Thread.sleep(delayMs);
          } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
            throw new KeycloakOperationException(
                "Operation interrupted during retry: " + operationName, operationName, ie);
          }
        } else {
          log.error(
              "Keycloak operation '{}' failed on final attempt {}/{}: {}",
              operationName,
              attempt,
              config.maxAttempts,
              e.getMessage());
        }
      }
    }

    // All attempts failed
    if (lastException instanceof KeycloakException) {
      throw (KeycloakException) lastException;
    } else {
      throw new KeycloakOperationException(
          "Operation failed after " + config.maxAttempts + " attempts: " + operationName,
          operationName,
          lastException);
    }
  }

  /**
   * Executes an operation with retry logic for void operations.
   *
   * @param operation the operation to execute
   * @param operationName name of the operation for logging
   * @throws KeycloakException if all retry attempts fail
   */
  public void executeWithRetryVoid(Runnable operation, String operationName) {
    executeWithRetry(
        () -> {
          operation.run();
          return null;
        },
        operationName);
  }

  /**
   * Executes an operation with retry logic for void operations using custom configuration.
   *
   * @param operation the operation to execute
   * @param operationName name of the operation for logging
   * @param config retry configuration
   * @throws KeycloakException if all retry attempts fail
   */
  public void executeWithRetryVoid(Runnable operation, String operationName, RetryConfig config) {
    executeWithRetry(
        () -> {
          operation.run();
          return null;
        },
        operationName,
        config);
  }

  private boolean shouldRetry(Exception e, int attempt, RetryConfig config) {
    // Don't retry if we've reached max attempts
    if (attempt >= config.maxAttempts) {
      return false;
    }

    // Don't retry validation errors or configuration errors
    if (e instanceof KeycloakValidationException || e instanceof KeycloakConfigurationException) {
      return false;
    }

    // Retry connection errors and certain operation errors
    if (e instanceof KeycloakConnectionException) {
      return true;
    }

    if (e instanceof KeycloakOperationException operationEx) {
      Integer httpStatus = operationEx.getHttpStatusCode();
      if (httpStatus != null) {
        // Retry on server errors (5xx) and certain client errors
        return httpStatus >= 500 || httpStatus == 429 || httpStatus == 408;
      }
      return true; // Retry if no HTTP status available
    }

    // Retry on generic exceptions (network issues, etc.)
    return !(e instanceof KeycloakException);
  }

  private long calculateDelay(int attempt, RetryConfig config) {
    if (config.useExponentialBackoff) {
      // Exponential backoff: delay = baseDelay * (2 ^ (attempt - 1))
      long exponentialDelay = config.baseDelayMs * (1L << (attempt - 1));
      long cappedDelay = Math.min(exponentialDelay, config.maxDelayMs);

      if (config.useJitter) {
        // Add random jitter (±25% of the delay)
        long jitterRange = cappedDelay / 4;
        long jitter = ThreadLocalRandom.current().nextLong(-jitterRange, jitterRange + 1);
        return Math.max(0, cappedDelay + jitter);
      }

      return cappedDelay;
    } else {
      // Fixed delay
      return config.baseDelayMs;
    }
  }

  /** Configuration class for retry behavior. */
  public static class RetryConfig {
    public final int maxAttempts;
    public final long baseDelayMs;
    public final long maxDelayMs;
    public final boolean useExponentialBackoff;
    public final boolean useJitter;

    public RetryConfig(
        int maxAttempts,
        long baseDelayMs,
        long maxDelayMs,
        boolean useExponentialBackoff,
        boolean useJitter) {
      this.maxAttempts = maxAttempts;
      this.baseDelayMs = baseDelayMs;
      this.maxDelayMs = maxDelayMs;
      this.useExponentialBackoff = useExponentialBackoff;
      this.useJitter = useJitter;
    }

    public static RetryConfig defaultConfig(KeycloakProperties properties) {
      return new RetryConfig(
          properties.getConnection().getRetryAttempts(),
          properties.getConnection().getRetryDelayMs(),
          30000, // 30 seconds max delay
          true, // use exponential backoff
          true // use jitter
          );
    }

    public static RetryConfig noRetry() {
      return new RetryConfig(1, 0, 0, false, false);
    }

    public static RetryConfig fixedDelay(int maxAttempts, long delayMs) {
      return new RetryConfig(maxAttempts, delayMs, delayMs, false, false);
    }

    public static RetryConfig exponentialBackoff(
        int maxAttempts, long baseDelayMs, long maxDelayMs) {
      return new RetryConfig(maxAttempts, baseDelayMs, maxDelayMs, true, true);
    }
  }
}
