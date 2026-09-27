package com.marianciuc.nexifly.orders.domain.fsm;

import com.marianciuc.nexifly.orders.domain.enums.OrderStatus;

import java.util.Collections;
import java.util.Map;
import java.util.Set;

import static com.marianciuc.nexifly.orders.domain.enums.OrderStatus.*;

public class OrderFsm {

    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED_TRANSITIONS = Map.ofEntries(
            Map.entry(DRAFT, Set.of(SUBMITTED, CANCELLED)),
            Map.entry(SUBMITTED, Set.of(RESERVED, CANCELLED_OUT_OF_STOCK, CANCELLED)),
            Map.entry(RESERVED, Set.of(AWAITING_PAYMENT, CANCELLED)),
            Map.entry(AWAITING_PAYMENT, Set.of(PAID, PAYMENT_FAILED, CANCELLED)),
            Map.entry(PAYMENT_FAILED, Set.of(AWAITING_PAYMENT, CANCELLED)),
            Map.entry(PAID, Set.of(IN_PROCESSING, CANCELLED)),
            Map.entry(IN_PROCESSING, Set.of(SHIPPED, CANCELLED)),
            Map.entry(SHIPPED, Set.of(DELIVERED)),
            Map.entry(DELIVERED, Set.of(COMPLETED, DISPUTED)),
            Map.entry(DISPUTED, Set.of(COMPLETED, CANCELLED)),
            Map.entry(CANCELLED_OUT_OF_STOCK, Collections.emptySet()),
            Map.entry(CANCELLED, Collections.emptySet()),
            Map.entry(COMPLETED, Collections.emptySet())
    );

    public static boolean canTransition(OrderStatus from, OrderStatus to) {
        if (from == null || to == null) return false;
        return ALLOWED_TRANSITIONS.getOrDefault(from, Set.of()).contains(to);
    }

    public static void validate(OrderStatus from, OrderStatus to) {
        if (!canTransition(from, to)) {
            throw new IllegalStateException(String.format("Invalid order state transition: cannot change status from %s to %s", from, to));
        }
    }
}
