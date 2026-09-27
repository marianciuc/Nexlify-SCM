package com.marianciuc.nexifly.users.exception;

public class EmailAlreadyExistsException extends RuntimeException {
    public EmailAlreadyExistsException(String email) {
        super("Email is already registered: " + email);
    }
}
