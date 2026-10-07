package com.marianciuc.nexifly.inventory.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Dimension unit of measure (e.g. CM, MM, M, INCH).
 */
public enum DimensionUnit {
    MM("mm"),
    CM("cm"),
    M("m"),
    INCH("in");

    private final String code;

    DimensionUnit(String code) {
        this.code = code;
    }

    @JsonValue
    public String getCode() {
        return code;
    }

    @JsonCreator
    public static DimensionUnit fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return CM;
        }
        for (DimensionUnit unit : values()) {
            if (unit.name().equalsIgnoreCase(value.trim()) || unit.code.equalsIgnoreCase(value.trim())) {
                return unit;
            }
        }
        return CM;
    }
}
