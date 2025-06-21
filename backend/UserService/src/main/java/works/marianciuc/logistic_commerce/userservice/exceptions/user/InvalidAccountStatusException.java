package works.marianciuc.logistic_commerce.userservice.exceptions.user;

import org.springframework.http.HttpStatus;
import works.marianciuc.logistic_commerce.userservice.exceptions.general.BusinessException;

/**
 * Exception thrown when attempting to perform operations on an account that is not in the correct
 * status for the requested operation.
 */
public class InvalidAccountStatusException extends BusinessException {

  private static final String MESSAGE_KEY = "errors.user.account.invalid_status";
  private static final String ERROR_CODE = "INVALID_ACCOUNT_STATUS";

  public InvalidAccountStatusException(String currentStatus, String requiredStatus) {
    super(MESSAGE_KEY, HttpStatus.CONFLICT, ERROR_CODE, currentStatus, requiredStatus);
  }

  public InvalidAccountStatusException(String currentStatus) {
    super(MESSAGE_KEY, HttpStatus.CONFLICT, ERROR_CODE, currentStatus);
  }
}
