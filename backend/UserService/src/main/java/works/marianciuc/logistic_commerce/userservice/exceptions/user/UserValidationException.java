package works.marianciuc.logistic_commerce.userservice.exceptions.user;

import works.marianciuc.logistic_commerce.userservice.exceptions.general.InvalidArgumentException;

/** Exception thrown when user data validation fails. */
public class UserValidationException extends InvalidArgumentException {

  private static final String MESSAGE_KEY = "errors.validation.failed";
  private static final String ERROR_CODE = "USER_VALIDATION_FAILED";

  public UserValidationException(String fieldName, String reason) {
    super(MESSAGE_KEY, ERROR_CODE, fieldName, reason);
  }

  public UserValidationException(String reason) {
    super(MESSAGE_KEY, ERROR_CODE, reason);
  }
}
