package works.marianciuc.logistic_commerce.userservice.exceptions.records;

public class DeletedRecordException extends RuntimeException {
  public DeletedRecordException(String message) {
    super(message);
  }
}
