import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronLeft, Package, ShieldAlert, Truck, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { FormFieldInput, FormFieldNumber, FormFieldSelect } from '@/components/forms/common';
import { MoneyDisplay, QuantityDisplay } from '@/components/money-display';
import { PageHeader } from '@/components/page-header';
import { OrderStatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useLocale } from '@/hooks/useLocale';
import {
  INITIAL_ORDERS,
  useCreateClaimMutation,
  useOrdersQuery,
  useUpdateOrderStatusMutation,
} from '@/hooks/useScmQueries';
import { type TranslationPath } from '@/types/generated-locale';
import type { IncotermsCode, OrderStatus } from '@/types/scm-domain';

export const Route = createFileRoute('/buyer/orders/$orderId')({
  component: OrderDetailPage,
  staticData: {
    crumb: { label: 'nav.buyer.orderDetail' },
  },
});

const HAPPY_PATH_ORDER: OrderStatus[] = [
  'DRAFT',
  'SUBMITTED',
  'RESERVED',
  'AWAITING_PAYMENT',
  'PAID',
  'IN_PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'COMPLETED',
];

const STATUS_LABEL_KEY: Record<OrderStatus, TranslationPath> = {
  DRAFT: 'buyer.orders.status.DRAFT',
  SUBMITTED: 'buyer.orders.status.SUBMITTED',
  RESERVED: 'buyer.orders.status.RESERVED',
  AWAITING_PAYMENT: 'buyer.orders.status.AWAITING_PAYMENT',
  PAID: 'buyer.orders.status.PAID',
  IN_PROCESSING: 'buyer.orders.status.IN_PROCESSING',
  SHIPPED: 'buyer.orders.status.SHIPPED',
  DELIVERED: 'buyer.orders.status.DELIVERED',
  COMPLETED: 'buyer.orders.status.COMPLETED',
  CANCELLED_OUT_OF_STOCK: 'buyer.orders.status.CANCELLED_OUT_OF_STOCK',
  PAYMENT_FAILED: 'buyer.orders.status.PAYMENT_FAILED',
  DISPUTED: 'buyer.orders.status.DISPUTED',
  CANCELLED: 'buyer.orders.status.CANCELLED',
};

type RmaFormData = {
  rmaReason: string;
  rmaItemSku: string;
  rmaQty: number;
  rmaNotes?: string;
};

function OrderDetailPage() {
  const { t } = useLocale();
  const { orderId } = Route.useParams();
  const { data: orders = INITIAL_ORDERS } = useOrdersQuery();

  const [currentSimulatedStatus, setCurrentSimulatedStatus] = useState<OrderStatus | null>(null);
  const [showRmaDialog, setShowRmaDialog] = useState(false);

  const rawOrder = useMemo(() => {
    return (
      orders.find((o) => o.id === orderId || o.orderNumber === orderId) || {
        id: orderId,
        orderNumber: 'ORD-2026-0891',
        customerName: 'Baltic Retail Group Sp. z o.o.',
        status: 'SHIPPED' as OrderStatus,
        totalAmount: 28450.0,
        currency: 'PLN',
        itemsCount: 140,
        deliveryCity: 'Warszawa',
        deliveryAddress: 'ul. Magazynowa 14, Rampa 4',
        deliveryPostalCode: '05-090 Raszyn',
        incoterms: 'DAP' as IncotermsCode,
        slaTargetDate: '2026-09-26 14:00 CEST',
        slaMaxTransitHours: 24,
        guaranteedOtifPercent: 99.2,
        createdAt: '2026-09-24 10:15',
        items: [
          { sku: 'SKU-PAL-01', name: 'EPAL Euro-Pallet Standard (Pine Wood)', quantity: 100, unitPrice: 120.0 },
          { sku: 'SKU-STR-05', name: 'Industrial Stretch Film 23mic', quantity: 40, unitPrice: 411.25 },
        ],
      }
    );
  }, [orders, orderId]);

  const activeStatus: OrderStatus = currentSimulatedStatus || rawOrder.status;

  const currentStepIndex = HAPPY_PATH_ORDER.indexOf(activeStatus);
  const isHappyPath = currentStepIndex !== -1;

  // Validation messages are user-visible, so the schema is rebuilt with the active locale.
  const rmaSchema = useMemo(
    () =>
      z.object({
        rmaReason: z.string().min(1, t('buyer.orderDetail.rma.reasonRequired')),
        rmaItemSku: z.string().min(1, t('buyer.orderDetail.rma.skuRequired')),
        rmaQty: z.number().int().min(1, t('buyer.orderDetail.rma.qtyMin')),
        rmaNotes: z.string().optional(),
      }),
    [t]
  );

  const rmaReasonOptions = useMemo(
    () => [
      { value: 'DAMAGED_CARGO', label: t('buyer.orderDetail.rma.reasonDamaged') },
      { value: 'SHORTAGE', label: t('buyer.orderDetail.rma.reasonShortage') },
      { value: 'WRONG_SKU', label: t('buyer.orderDetail.rma.reasonWrongSku') },
    ],
    [t]
  );

  const rmaForm = useForm<RmaFormData>({
    resolver: zodResolver(rmaSchema),
    defaultValues: {
      rmaReason: 'DAMAGED_CARGO',
      rmaItemSku: '',
      rmaQty: 1,
      rmaNotes: '',
    },
  });

  const createClaimMutation = useCreateClaimMutation();
  const updateStatusMutation = useUpdateOrderStatusMutation();

  const onFileRma = async (data: RmaFormData) => {
    await createClaimMutation.mutateAsync({
      orderNumber: rawOrder.orderNumber,
      supplierName: 'PlastChem Industrial Sp. k.',
      reason: `${data.rmaReason}: ${data.rmaNotes || 'Дефект груза при приемке'}`,
      claimAmountPln: data.rmaQty * 120,
    });
    await updateStatusMutation.mutateAsync({
      orderId: rawOrder.id,
      nextStatus: 'DISPUTED',
    });
    setCurrentSimulatedStatus('DISPUTED');
    setShowRmaDialog(false);
    rmaForm.reset();
  };

  const handleAdvanceStatus = async () => {
    if (isHappyPath && currentStepIndex < HAPPY_PATH_ORDER.length - 1) {
      const nextStatus = HAPPY_PATH_ORDER[currentStepIndex + 1]!;
      await updateStatusMutation.mutateAsync({
        orderId: rawOrder.id,
        nextStatus,
      });
      setCurrentSimulatedStatus(nextStatus);
    } else {
      await updateStatusMutation.mutateAsync({
        orderId: rawOrder.id,
        nextStatus: 'SUBMITTED',
      });
      setCurrentSimulatedStatus('SUBMITTED');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto min-w-0">
      <div>
        <Link
          to="/buyer/orders"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          {t('buyer.orderDetail.backToOrders')}
        </Link>
      </div>

      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" aria-hidden="true" />
            {rawOrder.orderNumber}
          </span>
        }
        subtitle={`${rawOrder.customerName} · ${rawOrder.deliveryCity}`}
        actions={
          <>
            <OrderStatusBadge status={activeStatus} t={t} size="md" />
            <Button
              variant="outline"
              size="sm"
              onClick={handleAdvanceStatus}
              className="gap-1.5 font-medium"
            >
              <Zap className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              {t('buyer.orderDetail.advance')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRmaDialog(true)}
              className="gap-1.5 font-medium"
            >
              <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
              {t('buyer.orderDetail.rma.open')}
            </Button>
          </>
        }
      />

      {/* Lifecycle: compact step indicator */}
      <Card className="border-border bg-card shadow-xs">
        <CardContent className="p-4 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('buyer.orderDetail.lifecycle.title')}
          </span>
          {isHappyPath ? (
            <div
              className="flex items-center gap-1 overflow-x-auto py-1 text-[11px]"
              role="list"
              aria-label={t('buyer.orderDetail.lifecycle.stepsAria')}
            >
              {HAPPY_PATH_ORDER.map((stepStatus, idx) => {
                const isPast = idx <= currentStepIndex;
                const isCurrent = activeStatus === stepStatus;
                return (
                  <div key={stepStatus} className="flex items-center gap-1 shrink-0" role="listitem">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        isPast
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                      aria-hidden="true"
                    >
                      {idx + 1}
                    </div>
                    <span
                      className={`font-medium whitespace-nowrap ${
                        isCurrent
                          ? 'text-primary font-bold'
                          : isPast
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {t(STATUS_LABEL_KEY[stepStatus])}
                    </span>
                    {idx < HAPPY_PATH_ORDER.length - 1 && (
                      <span className="text-muted-foreground/40 ml-1" aria-hidden="true">
                        ›
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <OrderStatusBadge status={activeStatus} t={t} size="sm" />
              <span className="text-xs text-muted-foreground">
                {t('buyer.orderDetail.lifecycle.exceptionNote')}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Line items */}
      <Card className="border-border bg-card shadow-xs overflow-hidden">
        <div className="flex items-center justify-between gap-2 py-3 px-5 border-b border-border">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" aria-hidden="true" />
            {t('buyer.orderDetail.items.title')}
          </h2>
          <QuantityDisplay amount={rawOrder.itemsCount} unit={t('buyer.orderDetail.items.unit')} />
        </div>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[760px]">
            <caption className="sr-only">{t('buyer.orderDetail.items.caption')}</caption>
            <thead className="bg-muted/40 border-b border-border text-muted-foreground whitespace-nowrap uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">{t('buyer.orderDetail.items.item')}</th>
                <th className="py-3 px-4">{t('buyer.orderDetail.items.brand')}</th>
                <th className="py-3 px-4 text-right">{t('buyer.orderDetail.items.qty')}</th>
                <th className="py-3 px-4 text-right">{t('buyer.orderDetail.items.unitPrice')}</th>
                <th className="py-3 px-4 text-right">{t('buyer.orderDetail.items.vat')}</th>
                <th className="py-3 px-4 text-right">{t('buyer.orderDetail.items.gross')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(rawOrder.items || []).map((item) => {
                const lineNet = item.unitPrice * item.quantity;
                const lineVat = lineNet * 0.23;
                const lineGross = lineNet + lineVat;
                return (
                  <tr key={item.sku} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{item.name}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">{item.sku}</div>
                    </td>
                    <td className="py-3 px-4">
                      {item.brand ? (
                        <div className="min-w-0 max-w-[220px]">
                          <div className="text-xs font-medium text-foreground truncate">
                            {item.brandCode || item.brand}
                          </div>
                          {item.manufacturer && (
                            <div className="text-[11px] text-muted-foreground truncate">
                              {item.manufacturer}
                              {item.manufacturerCountry && (
                                <span className="font-mono"> ({item.manufacturerCountry})</span>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <QuantityDisplay amount={item.quantity} unit={item.unit} emphasize />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <MoneyDisplay amount={item.unitPrice} variant="inline" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <MoneyDisplay amount={lineVat} variant="inline" className="text-muted-foreground" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <MoneyDisplay amount={lineGross} variant="inline" emphasize />
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-muted/30 border-t border-border">
                <td colSpan={5} className="py-3 px-4 text-sm font-bold text-foreground">
                  {t('buyer.orderDetail.items.orderTotal')}
                </td>
                <td className="py-3 px-4 text-right">
                  <MoneyDisplay amount={rawOrder.totalAmount} variant="inline" emphasize className="text-primary" />
                </td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>

      {/* Delivery & SLA */}
      <Card className="border-border bg-card shadow-xs">
        <div className="flex items-center gap-2 py-3 px-5 border-b border-border">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" aria-hidden="true" />
            {t('buyer.orderDetail.delivery.title')}
          </h2>
        </div>
        <CardContent className="p-5">
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            <div className="min-w-0">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                {t('buyer.orderDetail.delivery.customer')}
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground truncate">{rawOrder.customerName}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                {t('buyer.orderDetail.delivery.destination')}
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                <div className="truncate">{rawOrder.deliveryAddress || '—'}</div>
                <div className="text-xs text-muted-foreground">
                  {rawOrder.deliveryPostalCode || ''} {rawOrder.deliveryCity}
                </div>
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                {t('buyer.orderDetail.delivery.incoterms')}
              </dt>
              <dd className="mt-1 text-sm font-mono font-bold text-foreground">
                {rawOrder.incoterms || '—'}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                {t('buyer.orderDetail.delivery.slaTarget')}
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground font-mono">
                {rawOrder.slaTargetDate || '—'}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                {t('buyer.orderDetail.delivery.transitLimit')}
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {rawOrder.slaMaxTransitHours != null
                  ? t('buyer.orderDetail.delivery.transitHours', { hours: rawOrder.slaMaxTransitHours })
                  : '—'}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                {t('buyer.orderDetail.delivery.otif')}
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {rawOrder.guaranteedOtifPercent != null
                  ? t('buyer.orderDetail.delivery.otifPercent', { percent: rawOrder.guaranteedOtifPercent })
                  : '—'}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                {t('buyer.orderDetail.delivery.createdAt')}
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground font-mono">{rawOrder.createdAt}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* RMA Claim Dialog — dispute action */}
      <Dialog open={showRmaDialog} onOpenChange={setShowRmaDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="h-5 w-5 text-primary" aria-hidden="true" />
              {t('buyer.orderDetail.rma.title')}
            </DialogTitle>
            <DialogDescription>{t('buyer.orderDetail.rma.description')}</DialogDescription>
          </DialogHeader>
          <Form {...rmaForm}>
            <form onSubmit={rmaForm.handleSubmit(onFileRma)} className="space-y-4">
              <FormFieldSelect
                control={rmaForm.control}
                name="rmaReason"
                label={t('buyer.orderDetail.rma.reasonLabel')}
                options={rmaReasonOptions}
              />

              <FormFieldSelect
                control={rmaForm.control}
                name="rmaItemSku"
                label={t('buyer.orderDetail.rma.skuLabel')}
                placeholder={t('buyer.orderDetail.rma.skuPlaceholder')}
                options={(rawOrder.items || []).map((i) => ({
                  value: i.sku,
                  label: `${i.sku} - ${i.name}`,
                }))}
              />

              <FormFieldNumber
                control={rmaForm.control}
                name="rmaQty"
                label={t('buyer.orderDetail.rma.qtyLabel')}
                min={1}
                step={1}
              />

              <FormFieldInput
                control={rmaForm.control}
                name="rmaNotes"
                label={t('buyer.orderDetail.rma.notesLabel')}
                placeholder={t('buyer.orderDetail.rma.notesPlaceholder')}
              />

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowRmaDialog(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" size="sm">
                  {t('buyer.orderDetail.rma.submit')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OrderDetailPage;
