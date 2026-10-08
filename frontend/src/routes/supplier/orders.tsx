import { createFileRoute, Link } from '@tanstack/react-router';
import { Boxes, ArrowRight, MapPin, Barcode } from 'lucide-react';
import { useState } from 'react';

import { QuantityDisplay } from '@/components/money-display';
import { PageHeader } from '@/components/page-header';
import { OrderStatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocale } from '@/hooks/useLocale';
import { useOrdersQuery, INITIAL_ORDERS } from '@/hooks/useScmQueries';

export const Route = createFileRoute('/supplier/orders')({
  component: SupplierOrdersQueuePage,
  staticData: {
    crumb: {
      label: 'nav.supplier.orders',
    },
  },
});

type FilterId = 'ALL' | 'PENDING' | 'READY_FOR_DISPATCH';

const FILTER_IDS: FilterId[] = ['ALL', 'PENDING', 'READY_FOR_DISPATCH'];

function SupplierOrdersQueuePage() {
  return <SupplierOrdersQueueContent />;
}

function SupplierOrdersQueueContent() {
  const { t } = useLocale();
  const { data: orders = INITIAL_ORDERS } = useOrdersQuery();
  const [selectedFilter, setSelectedFilter] = useState<FilterId>('ALL');

  const filteredOrders = orders.filter((o) => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'PENDING') return o.status === 'SUBMITTED' || o.status === 'RESERVED';
    if (selectedFilter === 'READY_FOR_DISPATCH') return o.status === 'SHIPPED' || o.status === 'COMPLETED';
    return true;
  });

  const counts = {
    ALL: orders.length,
    PENDING: orders.filter((o) => o.status === 'SUBMITTED' || o.status === 'RESERVED').length,
    READY_FOR_DISPATCH: orders.filter((o) => o.status === 'SHIPPED' || o.status === 'COMPLETED').length,
  };

  const filterLabels: Record<FilterId, string> = {
    ALL: t('supplier.orders.filters.all'),
    PENDING: t('supplier.orders.filters.pending'),
    READY_FOR_DISPATCH: t('supplier.orders.filters.readyForDispatch'),
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto min-w-0">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Boxes className="h-5 w-5 text-primary" />
            {t('supplier.orders.title')}
          </span>
        }
        subtitle={t('supplier.orders.subtitle')}
      />

      <div
        className="flex items-center gap-1.5 bg-card p-1.5 rounded-lg border border-border shadow-xs text-xs overflow-x-auto"
        role="group"
        aria-label={t('supplier.orders.filters.ariaLabel')}
      >
        {FILTER_IDS.map((id) => {
          const isActive = selectedFilter === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setSelectedFilter(id)}
              aria-pressed={isActive}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors shrink-0 whitespace-nowrap inline-flex items-center gap-2 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <span>{filterLabels[id]}</span>
              <span
                className={`tabular-nums px-1.5 rounded text-[10px] font-bold ${
                  isActive ? 'bg-primary-foreground/15 text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {counts[id]}
              </span>
            </button>
          );
        })}
      </div>

      <Card className="border-border shadow-xs overflow-hidden bg-card">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[760px]">
            <caption className="sr-only">{t('supplier.orders.title')}</caption>
            <thead className="bg-muted/40 border-b border-border text-muted-foreground whitespace-nowrap font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">{t('supplier.orders.table.orderNumber')}</th>
                <th className="py-3 px-4">{t('supplier.orders.table.customerDelivery')}</th>
                <th className="py-3 px-4 text-right">{t('supplier.orders.table.items')}</th>
                <th className="py-3 px-4 text-right">{t('supplier.orders.table.total')}</th>
                <th className="py-3 px-4">{t('supplier.orders.table.status')}</th>
                <th className="py-3 px-4 text-right">{t('supplier.orders.table.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border whitespace-nowrap">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                    {t('supplier.orders.empty')}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const itemCount = order.items?.length || 0;
                  return (
                    <tr key={order.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">
                        <Link
                          to="/supplier/orders/$orderId/fulfillment"
                          params={{ orderId: order.id }}
                          className="hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground">{order.customerName}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" aria-hidden="true" /> {order.deliveryCity}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <QuantityDisplay amount={itemCount} unit={t('supplier.orders.itemsUnit')} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-mono font-bold tabular-nums text-foreground">
                          {order.totalAmount.toLocaleString('pl-PL')}{' '}
                          <span className="font-medium text-muted-foreground">{order.currency}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <OrderStatusBadge status={order.status} t={t as never} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to="/supplier/orders/$orderId/fulfillment"
                          params={{ orderId: order.id }}
                          aria-label={t('supplier.orders.actionAria', { number: order.orderNumber })}
                        >
                          <Button size="sm" className="gap-1.5 shadow-xs font-medium h-8">
                            <Barcode className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{t('supplier.orders.fulfillAction')}</span>
                            <ArrowRight className="h-3 w-3 ml-1 rtl:rotate-180" aria-hidden="true" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default SupplierOrdersQueuePage;