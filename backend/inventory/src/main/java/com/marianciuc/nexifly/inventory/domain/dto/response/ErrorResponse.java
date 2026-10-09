package com.marianciuc.nexifly.inventory.domain.dto.response;

import org.springframework.http.HttpStatus;

import java.util.Map;

public record ErrorResponse(
        HttpStatus code,
        String message,
        String errorCode,
        Map<String, Object> additionalDetails
) {
}
