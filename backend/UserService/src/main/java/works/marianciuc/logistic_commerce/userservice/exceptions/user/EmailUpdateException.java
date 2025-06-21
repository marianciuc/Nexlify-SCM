package works.marianciuc.logistic_commerce.userservice.exceptions.user;

import org.springframework.http.HttpStatus;
import works.marianciuc.logistic_commerce.userservice.exceptions.general.BusinessException;

/**
 * Exception thrown when attempting to update an email address with invalid data or when the email
 * update operation cannot be completed.
 */
public class EmailUpdateException extends BusinessException {

  private static final String MESSAGE_KEY = "errors.user.email.update_failed";
  private static final String ERROR_CODE = "EMAIL_UPDATE_FAILED";

  public EmailUpdateException(String reason) {
    super(MESSAGE_KEY, HttpStatus.BAD_REQUEST, ERROR_CODE, reason);
  }

  public EmailUpdateException() {
    super(MESSAGE_KEY, HttpStatus.BAD_REQUEST, ERROR_CODE);
  }
}
