package works.marianciuc.logistic_commerce.userservice.exceptions.user;

import works.marianciuc.logistic_commerce.userservice.exceptions.general.NotFoundException;

/**
 * Exception thrown when a user is not found in the system.
 *
 * <p>This exception is a specific type of {@code NotFoundException} and is used to indicate that an
 * operation attempted to retrieve or interact with a user entity that does not exist in the system.
 *
 * <p>By design, it initializes with a predefined error message and a domain code specific to
 * user-related errors.
 *
 * <ul>
 *   <li>Error Code: "NOT_FOUND_USER"
 *   <li>HTTP Status: 404 (NOT_FOUND)
 *   <li>Default Message: "error.user.not_found"
 * </ul>
 *
 * <p>This class is meant to provide a clear and consistent way to handle cases where a requested
 * user entity is not located, streamlining the exception handling in the application.
 */
public class UserNotFoundException extends NotFoundException {

  private static final String DOMAIN = "USER";
  private static final String MESSAGE = "errors.user.not_found";

  public UserNotFoundException() {
    super(MESSAGE, DOMAIN);
  }
}
