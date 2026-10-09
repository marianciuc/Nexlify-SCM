package com.marianciuc.nexifly.rfq.exception;

import java.util.UUID;

public class BidNotFoundException extends RuntimeException {
    public BidNotFoundException(UUID id) {
        super("Bid not found with ID: " + id);
    }

    public BidNotFoundException(String message) {
        super(message);
    }
}
