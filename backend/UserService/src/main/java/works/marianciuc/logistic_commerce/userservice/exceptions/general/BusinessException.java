package works.marianciuc.logistic_commerce.userservice.exceptions.general;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Represents a base exception for business-related errors in the application. This exception is
 * designed to provide a structured way to capture error details, including an HTTP status and a
 * specific error code, which can be used for error handling and client communication.
 *
 * <p>The concrete subclasses of this exception should define specific business error scenarios by
 * extending this class and optionally providing additional context or settings.
 *
 * <p>Constructors are provided to set the exception message, HTTP status, and error code. If the
 * HTTP status and error code are not explicitly provided, default values are used.
 */
@Getter
public abstract class BusinessException extends RuntimeException {
  private static final String DEFAULT_ERROR_CODE = "BUSINESS_EXCEPTION";
  private final HttpStatus status;
  private final String errorCode;
  private final String[] args;

  public BusinessException(String message, HttpStatus status, String errorCode) {
    super(message);
    this.args = new String[0];
    this.status = status;
    this.errorCode = errorCode;
  }

  public BusinessException(String message, HttpStatus status, String errorCode, String... args) {
    super(message);
    this.status = status;
    this.errorCode = errorCode;
    this.args = args;
  }

  protected BusinessException(String message) {
    this(message, HttpStatus.BAD_REQUEST, DEFAULT_ERROR_CODE);
  }
}
