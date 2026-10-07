package com.marianciuc.nexifly.inventory.domain.enums;

/**
 * Reservation lock type (SOFT: temporary pending checkout/payment, HARD: committed order).
 */
public enum ReservationType {
    SOFT,
    HARD
}
