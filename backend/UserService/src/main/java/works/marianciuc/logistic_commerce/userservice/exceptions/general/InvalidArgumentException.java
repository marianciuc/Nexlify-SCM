package works.marianciuc.logistic_commerce.userservice.exceptions.general;

import org.springframework.http.HttpStatus;

/**
 * Represents an exception that is thrown when invalid arguments are provided to business operations
 * within the application's domain.
 *
 * <p>This class extends {@link BusinessException} and provides a specific way to handle invalid
 * argument scenarios by using a predefined HTTP status code (400 Bad Request) and an error code
 * prefix ("BAD_ARGUMENT_") to systematically categorize such errors.
 *
 * <p>Subclasses should specify the domain or context of the invalid argument that caused the
 * exception by appending it to the error code prefix. This helps in uniquely identifying the type
 * of argument validation error encountered.
 *
 * <p>The primary purpose of this exception is to offer a structured means for signaling argument
 * validation failures while enabling meaningful error handling and client-side communication.
 *
 * <p>When using this exception, provide both a descriptive error message and the relevant domain in
 * which the invalid argument occurred.
 */
public abstract class InvalidArgumentException extends BusinessException {

  private static final String ERROR_CODE_PREFIX = "BAD_ARGUMENT_";
  private static final HttpStatus DEFAULT_STATUS = HttpStatus.BAD_REQUEST;

  public InvalidArgumentException(String message, String domain) {
    super(message, DEFAULT_STATUS, ERROR_CODE_PREFIX + domain);
  }

  public InvalidArgumentException(String message, String domain, String... args) {
    super(message, DEFAULT_STATUS, ERROR_CODE_PREFIX + domain, args);
  }
}
