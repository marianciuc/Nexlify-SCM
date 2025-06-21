package works.marianciuc.logistic_commerce.userservice.exceptions.user;

import org.springframework.http.HttpStatus;
import works.marianciuc.logistic_commerce.userservice.exceptions.general.BusinessException;

/**
 * Exception thrown when attempting to verify an email that is already verified or when email
 * verification fails.
 */
public class EmailVerificationException extends BusinessException {

  private static final String MESSAGE_KEY = "errors.user.email.verification_failed";
  private static final String ERROR_CODE = "EMAIL_VERIFICATION_FAILED";

  public EmailVerificationException(String reason) {
    super(MESSAGE_KEY, HttpStatus.CONFLICT, ERROR_CODE, reason);
  }

  public EmailVerificationException() {
    super(MESSAGE_KEY, HttpStatus.CONFLICT, ERROR_CODE);
  }
}
