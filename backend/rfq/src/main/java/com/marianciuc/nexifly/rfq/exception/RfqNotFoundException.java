package com.marianciuc.nexifly.rfq.exception;

import java.util.UUID;

public class RfqNotFoundException extends RuntimeException {
    public RfqNotFoundException(UUID id) {
        super("RFQ not found with ID: " + id);
    }

    public RfqNotFoundException(String message) {
        super(message);
    }
}
