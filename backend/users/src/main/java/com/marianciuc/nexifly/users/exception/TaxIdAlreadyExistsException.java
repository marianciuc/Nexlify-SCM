package com.marianciuc.nexifly.users.exception;

public class TaxIdAlreadyExistsException extends RuntimeException {
    public TaxIdAlreadyExistsException(String taxId) {
        super("Company with Tax ID (NIP/VAT) already exists: " + taxId);
    }
}
