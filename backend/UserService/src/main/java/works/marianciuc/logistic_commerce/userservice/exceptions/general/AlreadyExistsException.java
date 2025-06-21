package works.marianciuc.logistic_commerce.userservice.exceptions.general;

import org.springframework.http.HttpStatus;

/**
 * Represents an exception that is thrown when an attempt is made to create or add a resource that
 * already exists within the application's domain.
 *
 * <p>This class extends {@link BusinessException} and provides a specific way to handle resource
 * conflict scenarios by using a predefined HTTP status code (409 Conflict) and an error code prefix
 * ("ALREADY_EXISTS_") to systematically categorize such errors.
 *
 * <p>Subclasses should specify the domain or context of the resource that caused the exception by
 * appending it to the error code prefix. This helps in uniquely identifying the type of resource
 * conflict encountered.
 *
 * <p>The primary purpose of this exception is to offer a structured means for signaling resource
 * conflicts while enabling meaningful error handling and client-side communication.
 *
 * <p>When using this exception, provide both a descriptive error message and the relevant domain in
 * which the duplicate resource conflict occurred.
 */
public abstract class AlreadyExistsException extends BusinessException {

  private static final String ERROR_CODE_PREFIX = "ALREADY_EXISTS_";
  private static final HttpStatus DEFAULT_STATUS = HttpStatus.CONFLICT;

  public AlreadyExistsException(String message, String domain) {
    super(message, DEFAULT_STATUS, ERROR_CODE_PREFIX + domain);
  }
}
