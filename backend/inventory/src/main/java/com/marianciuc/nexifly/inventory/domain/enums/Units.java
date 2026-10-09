package com.marianciuc.nexifly.inventory.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

/**
 * Standard unit of measure enumeration for inventory items and products.
 */
public enum Units {
    PCS("pcs"),
    KG("kg"),
    G("g"),
    LITERS("l"),
    ML("ml"),
    METER("m"),
    CM("cm"),
    MM("mm"),
    M2("m2"),
    M3("m3"),
    BOX("box"),
    PALLET("pallet"),
    PACK("pack");

    private final String code;

    Units(String code) {
        this.code = code;
    }

    @JsonValue
    public String getCode() {
        return code;
    }

    @JsonCreator
    public static Units fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return PCS;
        }
        String normalized = value.trim().toUpperCase();
        for (Units unit : values()) {
            if (unit.name().equalsIgnoreCase(normalized) || unit.code.equalsIgnoreCase(value.trim())) {
                return unit;
            }
        }
        // Fallback matching common variants (e.g. "PIECE", "PIECES", "LITER", "LITRE")
        if (normalized.startsWith("PIECE")) return PCS;
        if (normalized.startsWith("LITER") || normalized.startsWith("LITRE")) return LITERS;
        return PCS;
    }
}
