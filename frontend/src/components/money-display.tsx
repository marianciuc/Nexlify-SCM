import * as React from 'react';
import { cn } from '@/lib/utils';

const currencyFormat = new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
});

const decimalFormat = new Intl.NumberFormat('pl-PL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export interface MoneyDisplayProps {
    /** Amount in PLN */
    amount: number;
    /** Render as `PLN 1 234,56` if 'inline', or `1234.56 PLN` style for tables. Default: currency-styled. */
    variant?: 'currency' | 'inline';
    /** Bold weight */
    emphasize?: boolean;
    /** Truncate fractional part if 0 (useful for unit prices) */
    trimZeros?: boolean;
    className?: string;
}

/** Locale-aware PLN amount with tabular-nums so columns align. */
export function MoneyDisplay({ amount, variant = 'currency', emphasize = false, trimZeros = false, className }: MoneyDisplayProps) {
    const formatted = (() => {
        if (variant === 'inline') {
            const n = trimZeros ? Math.round(amount * 100) / 100 : amount;
            return `${decimalFormat.format(n)} PLN`;
        }
        return currencyFormat.format(amount);
    })();

    return (
        <span
            className={cn(
                'font-mono tabular-nums whitespace-nowrap',
                emphasize && 'font-bold',
                className
            )}
        >
            {formatted}
        </span>
    );
}

export interface QuantityDisplayProps {
    /** Numeric amount (integer) */
    amount: number;
    /** Optional unit, e.g. "kg", "PLN", "pal" */
    unit?: string;
    /** Show as bold (price totals) */
    emphasize?: boolean;
    className?: string;
}

export function QuantityDisplay({ amount, unit, emphasize = false, className }: QuantityDisplayProps) {
    return (
        <span
            className={cn(
                'font-mono tabular-nums whitespace-nowrap',
                emphasize && 'font-bold',
                className
            )}
        >
            {decimalFormat.format(amount)}
            {unit ? <span className="ml-0.5 text-xs text-muted-foreground font-sans">{unit}</span> : null}
        </span>
    );
}