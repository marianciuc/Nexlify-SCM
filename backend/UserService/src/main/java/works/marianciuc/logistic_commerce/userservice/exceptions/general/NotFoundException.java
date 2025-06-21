package works.marianciuc.logistic_commerce.userservice.exceptions.general;

import org.springframework.http.HttpStatus;

/**
 * Represents an exception that is thrown when a requested resource cannot be found within the
 * application's domain.
 *
 * <p>This class extends {@link BusinessException} and provides a specific way to handle resource
 * not found scenarios by using a predefined HTTP status code (404 Not Found) and an error code
 * prefix ("NOT_FOUND_") to systematically categorize such errors.
 *
 * <p>Subclasses should specify the domain or context of the resource that caused the exception by
 * appending it to the error code prefix. This helps in uniquely identifying the type of resource
 * that could not be found.
 *
 * <p>The primary purpose of this exception is to offer a structured means for signaling missing
 * resource scenarios while enabling meaningful error handling and client-side communication.
 *
 * <p>When using this exception, provide both a descriptive error message and the relevant domain in
 * which the resource was not found.
 */
public abstract class NotFoundException extends BusinessException {

  private static final String ERROR_CODE_PREFIX = "NOT_FOUND_";
  private static final HttpStatus DEFAULT_STATUS = HttpStatus.NOT_FOUND;

  public NotFoundException(String message, String domain) {
    super(message, DEFAULT_STATUS, ERROR_CODE_PREFIX + domain);
  }
}
