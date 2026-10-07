package com.marianciuc.nexifly.inventory.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Weight unit of measure.
 */
public enum WeightUnit {
    G("g"),
    KG("kg"),
    TON("t"),
    LB("lb");

    private final String code;

    WeightUnit(String code) {
        this.code = code;
    }

    @JsonValue
    public String getCode() {
        return code;
    }

    @JsonCreator
    public static WeightUnit fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return KG;
        }
        for (WeightUnit unit : values()) {
            if (unit.name().equalsIgnoreCase(value.trim()) || unit.code.equalsIgnoreCase(value.trim())) {
                return unit;
            }
        }
        return KG;
    }
}
