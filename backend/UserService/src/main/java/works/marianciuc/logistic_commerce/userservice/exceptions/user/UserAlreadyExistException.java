package works.marianciuc.logistic_commerce.userservice.exceptions.user;

import works.marianciuc.logistic_commerce.userservice.exceptions.general.AlreadyExistsException;

public class UserAlreadyExistException extends AlreadyExistsException {

  private static final String DOMAIN = "USER";
  private static final String MESSAGE = "errors.user.already_exists";

  public UserAlreadyExistException() {
    super(MESSAGE, DOMAIN);
  }
}
