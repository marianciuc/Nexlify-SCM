package works.marianciuc.logistic_commerce.userservice.exceptions.company;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/** Exception thrown when a company is not found. */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class CompanyNotFoundException extends RuntimeException {

  /**
   * Constructs a new CompanyNotFoundException with the specified detail message.
   *
   * @param message the detail message
   */
  public CompanyNotFoundException(String message) {
    super(message);
  }

  /**
   * Constructs a new CompanyNotFoundException with the specified detail message and cause.
   *
   * @param message the detail message
   * @param cause the cause
   */
  public CompanyNotFoundException(String message, Throwable cause) {
    super(message, cause);
  }
}
