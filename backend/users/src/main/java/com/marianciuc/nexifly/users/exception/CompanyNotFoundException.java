package com.marianciuc.nexifly.users.exception;

import java.util.UUID;

public class CompanyNotFoundException extends RuntimeException {
    public CompanyNotFoundException(UUID id) {
        super("Company not found with id: " + id);
    }

    public CompanyNotFoundException(String message) {
        super(message);
    }
}
