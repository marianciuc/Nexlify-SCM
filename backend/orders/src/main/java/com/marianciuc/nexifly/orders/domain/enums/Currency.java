package com.marianciuc.nexifly.orders.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Currency {
    PLN("PLN"),
    EUR("EUR"),
    USD("USD"),
    GBP("GBP");

    private final String code;

    Currency(String code) {
        this.code = code;
    }

    @JsonValue
    public String getCode() {
        return code;
    }

    @JsonCreator
    public static Currency fromString(String value) {
        if (value == null || value.isBlank()) {
            return PLN;
        }
        for (Currency c : values()) {
            if (c.code.equalsIgnoreCase(value.trim()) || c.name().equalsIgnoreCase(value.trim())) {
                return c;
            }
        }
        return PLN;
    }
}
