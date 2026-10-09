package com.marianciuc.nexifly.billing.exception;

import java.util.UUID;

public class InvoiceNotFoundException extends RuntimeException {
    public InvoiceNotFoundException(UUID id) {
        super("Invoice not found: " + id);
    }

    public InvoiceNotFoundException(String message) {
        super(message);
    }
}
