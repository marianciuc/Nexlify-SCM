package works.marianciuc.logistic_commerce.userservice.exceptions.general;

import org.springframework.http.HttpStatus;

/**
 * Represents an exception that is thrown when a specific operation is not supported within the
 * business logic of the application.
 *
 * <p>This class extends {@link BusinessException} and provides a structured way to handle
 * unsupported operation scenarios by using a predefined HTTP status code (400 Bad Request) and an
 * error code prefix ("UNSUPPORTED_OPERATION_") to classify such errors.
 *
 * <p>Subclasses should define the specific domain of the unsupported operation by appending the
 * domain to the error code prefix. This helps to uniquely identify the unsupported operation
 * context.
 *
 * <p>The primary purpose of this exception is to offer a standardized mechanism for reporting
 * unsupported behaviors or operations while facilitating meaningful error handling and enhanced
 * client communication.
 *
 * <p>Use this exception when fundamental business operations are invoked that are explicitly not
 * supported in a given context or state.
 */
public abstract class UnsupportedOperationException extends BusinessException {

  private static final String PREFIX = "UNSUPPORTED_OPERATION_";
  private static final HttpStatus DEFAULT_STATUS = HttpStatus.BAD_REQUEST;
  private static final String DEFAULT_MESSAGE = "business.unsupported_operation";

  public UnsupportedOperationException(String message, String domain) {
    super(message, HttpStatus.BAD_REQUEST, PREFIX + domain);
  }

  public UnsupportedOperationException(String message, String domain, String... args) {
    super(message, HttpStatus.BAD_REQUEST, PREFIX + domain, args);
  }

  public UnsupportedOperationException(String domain) {
    this(DEFAULT_MESSAGE, domain);
  }
}
