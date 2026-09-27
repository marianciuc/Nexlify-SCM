package com.marianciuc.nexifly.inventory.domain.enums;

/**
 * Stock status classification for inventory items.
 * Used for ABC analysis thresholds and dashboard filtering.
 */
public enum StockStatus {
    IN_STOCK,
    LOW_STOCK,
    OUT_OF_STOCK,
    RESERVED,
    DISCONTINUED
}
