package works.marianciuc.logistic_commerce.userservice.exceptions.records;

import works.marianciuc.logistic_commerce.userservice.exceptions.general.UnsupportedOperationException;

public class DeletedRecordException extends UnsupportedOperationException {

  private static final String DOMAIN = "RECORD";

  public DeletedRecordException(String message) {
    super(message, DOMAIN);
  }
}
