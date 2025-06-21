package works.marianciuc.logistic_commerce.userservice.exceptions.general;

import org.springframework.http.HttpStatus;

/**
 * Represents an exception that is thrown when access to a specific resource or operation is denied
 * within the context of the application's business logic.
 *
 * <p>This class extends {@link BusinessException} and provides a structured mechanism to handle
 * forbidden access scenarios by using a predefined HTTP status code (403 Forbidden) and an error
 * code prefix ("FORBIDDEN_") to systematically categorize such errors.
 *
 * <p>Subclasses should specify the domain or context in which the access was denied by appending it
 * to the error code prefix. This helps in uniquely identifying the type of access issue
 * encountered.
 *
 * <p>The primary purpose of this exception is to offer a clear and standardized approach for
 * signaling access denial scenarios, facilitating meaningful error handling and communication with
 * clients reflecting such constraints.
 *
 * <p>When constructing this exception, provide both a descriptive error message and the relevant
 * domain in which the forbidden access occurred. A default access denial message is also provided
 * and can be used for generic access denial cases.
 */
public abstract class ForbiddenException extends BusinessException {

  private static final String ERROR_CODE_PREFIX = "FORBIDDEN_";
  private static final HttpStatus DEFAULT_STATUS = HttpStatus.FORBIDDEN;
  private static final String DEFAULT_MESSAGE = "error.business.access_denied";

  public ForbiddenException(String message, String domain) {
    super(message, DEFAULT_STATUS, ERROR_CODE_PREFIX + domain);
  }

  public ForbiddenException(String message, String domain, String... args) {
    super(message, DEFAULT_STATUS, ERROR_CODE_PREFIX + domain, args);
  }

  public ForbiddenException(String domain) {
    this(DEFAULT_MESSAGE, domain);
  }
}
