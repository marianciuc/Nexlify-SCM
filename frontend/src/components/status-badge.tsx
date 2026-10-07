import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const TONE_CLASS: Record<StatusTone, string> = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30',
    danger:  'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30',
    info:    'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/30',
    neutral: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/30',
};

export interface StatusBadgeProps {
    tone: StatusTone;
    label: string;
    className?: string;
    /** Compact spacing for use inside dense tables */
    size?: 'sm' | 'md';
}

export function StatusBadge({ tone, label, className, size = 'md' }: StatusBadgeProps) {
    return (
        <Badge
            variant="outline"
            className={cn(
                'font-semibold whitespace-nowrap border',
                size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2 py-0.5',
                TONE_CLASS[tone],
                className
            )}
        >
            {label}
        </Badge>
    );
}

import type { OrderStatus } from '@/types/scm-domain';

/** Map OrderStatus → tone + label key (label resolved by i18n). */
export const ORDER_STATUS_META: Record<OrderStatus, { tone: StatusTone; labelKey: string }> = {
    DRAFT:                 { tone: 'neutral', labelKey: 'buyer.orders.status.DRAFT' },
    SUBMITTED:             { tone: 'info',    labelKey: 'buyer.orders.status.SUBMITTED' },
    RESERVED:              { tone: 'warning', labelKey: 'buyer.orders.status.RESERVED' },
    AWAITING_PAYMENT:      { tone: 'warning', labelKey: 'buyer.orders.status.AWAITING_PAYMENT' },
    PAID:                  { tone: 'success', labelKey: 'buyer.orders.status.PAID' },
    IN_PROCESSING:         { tone: 'info',    labelKey: 'buyer.orders.status.IN_PROCESSING' },
    SHIPPED:               { tone: 'info',    labelKey: 'buyer.orders.status.SHIPPED' },
    DELIVERED:             { tone: 'success', labelKey: 'buyer.orders.status.DELIVERED' },
    COMPLETED:             { tone: 'success', labelKey: 'buyer.orders.status.COMPLETED' },
    CANCELLED_OUT_OF_STOCK:{ tone: 'danger',  labelKey: 'buyer.orders.status.CANCELLED_OUT_OF_STOCK' },
    PAYMENT_FAILED:        { tone: 'danger',  labelKey: 'buyer.orders.status.PAYMENT_FAILED' },
    DISPUTED:              { tone: 'danger',  labelKey: 'buyer.orders.status.DISPUTED' },
    CANCELLED:             { tone: 'danger',  labelKey: 'buyer.orders.status.CANCELLED' },
};

export function OrderStatusBadge({ status, t, size }: { status: OrderStatus; t: (key: any) => string; size?: 'sm' | 'md' }) {
    const meta = ORDER_STATUS_META[status];
    return <StatusBadge tone={meta.tone} label={t(meta.labelKey)} size={size} />;
}

export const STOCK_STATUS_META = {
    IN_STOCK:    { tone: 'success' as StatusTone, labelKey: 'buyer.catalog.stock.in' },
    LOW_STOCK:   { tone: 'warning' as StatusTone, labelKey: 'buyer.catalog.stock.low' },
    OUT_OF_STOCK:{ tone: 'danger'  as StatusTone, labelKey: 'buyer.catalog.stock.out' },
};

export function StockStatusBadge({ status, t, size }: { status: keyof typeof STOCK_STATUS_META; t: (key: any) => string; size?: 'sm' | 'md' }) {
    const meta = STOCK_STATUS_META[status];
    return <StatusBadge tone={meta.tone} label={t(meta.labelKey)} size={size} />;
}