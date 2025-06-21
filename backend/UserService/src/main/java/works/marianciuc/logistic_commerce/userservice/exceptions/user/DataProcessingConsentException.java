package works.marianciuc.logistic_commerce.userservice.exceptions.user;

import org.springframework.http.HttpStatus;
import works.marianciuc.logistic_commerce.userservice.exceptions.general.BusinessException;

/**
 * Exception thrown when attempting to give consent that has already been given or when consent
 * operations fail.
 */
public class DataProcessingConsentException extends BusinessException {

  private static final String MESSAGE_KEY = "errors.user.consent.already_given";
  private static final String ERROR_CODE = "CONSENT_ALREADY_GIVEN";

  public DataProcessingConsentException() {
    super(MESSAGE_KEY, HttpStatus.CONFLICT, ERROR_CODE);
  }

  public DataProcessingConsentException(String reason) {
    super(MESSAGE_KEY, HttpStatus.CONFLICT, ERROR_CODE, reason);
  }
}
