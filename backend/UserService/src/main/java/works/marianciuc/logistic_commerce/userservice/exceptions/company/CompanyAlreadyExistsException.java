package works.marianciuc.logistic_commerce.userservice.exceptions.company;

public class CompanyAlreadyExistsException extends RuntimeException {
  public CompanyAlreadyExistsException(String message) {
    super(message);
  }
}
