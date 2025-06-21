package works.marianciuc.logistic_commerce.userservice.exceptions.integrations;

import org.springframework.http.HttpStatus;
import works.marianciuc.logistic_commerce.userservice.exceptions.general.BusinessException;

/** Exception thrown when external integration times out. */
public class IntegrationTimeoutException extends BusinessException {

  private static final String MESSAGE_KEY = "errors.integration.timeout";
  private static final String ERROR_CODE = "INTEGRATION_TIMEOUT";

  public IntegrationTimeoutException(String service, int timeoutSeconds) {
    super(
        MESSAGE_KEY,
        HttpStatus.REQUEST_TIMEOUT,
        ERROR_CODE,
        service,
        String.valueOf(timeoutSeconds));
  }
}
