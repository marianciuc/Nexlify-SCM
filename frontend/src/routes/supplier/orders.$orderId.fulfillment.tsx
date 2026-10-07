import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { ChevronLeft, Barcode, Package, Weight, Printer, Truck, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { PageHeader } from '@/components/page-header';
import { StatusBadge, type StatusTone } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocale } from '@/hooks/useLocale';
import {
  useOrdersQuery,
  INITIAL_ORDERS,
  useUpdateOrderStatusMutation,
  useCreateEcmrMutation,
} from '@/hooks/useScmQueries';

export const Route = createFileRoute('/supplier/orders/$orderId/fulfillment')({
  component: WarehouseFulfillmentWorkstation,
  staticData: {
    crumb: {
      label: 'nav.supplier.fulfillment',
    },
  },
});

interface PickItem {
  sku: string;
  name: string;
  zone: string;
  bin: string;
  quantityRequired: number;
  quantityPicked: number;
  scannedBarcode: string;
  isVerified: boolean;
}

const LIFECYCLE_STEPS = [
  'DRAFT',
  'SUBMITTED',
  'RESERVED',
  'AWAITING_PAYMENT',
  'PAID',
  'IN_PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'COMPLETED',
] as const;

function WarehouseFulfillmentWorkstation() {
  return <WarehouseFulfillmentContent />;
}

function WarehouseFulfillmentContent() {
  const { t } = useLocale();
  const { orderId } = Route.useParams();
  const navigate = useNavigate();
  const { data: orders = INITIAL_ORDERS } = useOrdersQuery();
  const updateStatusMutation = useUpdateOrderStatusMutation();
  const createEcmrMutation = useCreateEcmrMutation();

  const order = orders.find((o) => o.id === orderId) || INITIAL_ORDERS[0]!;

  const [cargoWeightKg, setCargoWeightKg] = useState(2540);
  const [pickItems, setPickItems] = useState<PickItem[]>([
    {
      sku: 'SKU-PAL-01',
      name: 'EPAL Euro-Pallet Standard (Pine Wood)',
      zone: 'Zone A (Pallet racks)',
      bin: 'A-04-BIN-108',
      quantityRequired: 100,
      quantityPicked: 0,
      scannedBarcode: '5901234567890',
      isVerified: false,
    },
    {
      sku: 'SKU-STR-05',
      name: 'Industrial Stretch Film 23mic (Roll 300m)',
      zone: 'Zone C (Packaging materials)',
      bin: 'C-01-BIN-042',
      quantityRequired: 40,
      quantityPicked: 0,
      scannedBarcode: '5909876543210',
      isVerified: false,
    },
  ]);

  const allVerified = pickItems.every((i) => i.isVerified);

  const scanSchema = z.object({ barcodeInput: z.string() });

  const barcodeForm = useForm<z.infer<typeof scanSchema>>({
    resolver: zodResolver(scanSchema),
    defaultValues: { barcodeInput: '' },
  });

  const onScanBarcode = (data: z.infer<typeof scanSchema>) => {
    const input = data.barcodeInput.trim();
    if (!input) return;

    const itemIndex = pickItems.findIndex(
      (i) => !i.isVerified && (i.sku === input || i.scannedBarcode === input)
    );

    const itemToUpdate = itemIndex > -1 ? pickItems[itemIndex] : undefined;
    if (itemIndex > -1 && itemToUpdate) {
      const updated = [...pickItems];
      updated[itemIndex] = {
        ...itemToUpdate,
        quantityPicked: itemToUpdate.quantityRequired,
        isVerified: true,
      };
      setPickItems(updated);
      barcodeForm.reset();
      toast.success(
        t('supplier.fulfillment.verifySuccess', {
          name: itemToUpdate.name,
          qty: itemToUpdate.quantityRequired,
        })
      );
    } else {
      toast.error(t('supplier.fulfillment.verifyError'));
    }
  };

  const handleQuickVerifyAll = () => {
    setPickItems(
      pickItems.map((i) => ({
        ...i,
        quantityPicked: i.quantityRequired,
        isVerified: true,
      }))
    );
    toast.success(t('supplier.fulfillment.verifyAllSuccess'));
  };

  const handlePrintLabels = () => {
    toast.success(t('supplier.fulfillment.printLabelsSuccess'));
  };

  const handleDispatchOrder = async () => {
    await updateStatusMutation.mutateAsync({
      orderId: order.id,
      nextStatus: 'SHIPPED',
    });
    await createEcmrMutation.mutateAsync({
      orderNumber: order.orderNumber,
      carrierName: 'Nexlify Fleet Express (WI 49102)',
      consigneeName: order.customerName,
      destinationCity: order.deliveryCity,
    });
    toast.success(t('supplier.fulfillment.dispatch.success', { number: order.orderNumber }));
    navigate({ to: '/supplier/orders' });
  };

  const currentStepIndex = LIFECYCLE_STEPS.indexOf('IN_PROCESSING');

  return (
    <div className="space-y-6 max-w-6xl mx-auto min-w-0">
      <div className="flex flex-col gap-2">
        <Link
          to="/supplier/orders"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          {t('supplier.fulfillment.backToQueue')}
        </Link>
        <PageHeader
          title={
            <span className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" aria-hidden="true" />
              {t('supplier.fulfillment.title')}
            </span>
          }
          subtitle={t('supplier.fulfillment.orderLine', {
            number: order.orderNumber,
            customer: order.customerName,
          })}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintLabels}
              className="gap-1.5 w-full sm:w-auto font-medium"
            >
              <Printer className="h-3.5 w-3.5" aria-hidden="true" />
              {t('supplier.fulfillment.printLabels')}
            </Button>
          }
        />
      </div>

      <Card className="border-border bg-card shadow-xs">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold uppercase tracking-wider text-muted-foreground">
              {t('supplier.fulfillment.statusBar.title')}:{' '}
              <StatusBadge
                tone={pickItems.every((i) => i.isVerified) ? 'success' : 'warning'}
                label={order.status}
                size="sm"
                className="ml-1"
              />
            </span>
            <span className="text-[11px] text-muted-foreground">
              {t('supplier.fulfillment.statusBar.stepCounter', {
                current: currentStepIndex + 1,
                total: LIFECYCLE_STEPS.length,
              })}
            </span>
          </div>
          <div
            className="flex items-center justify-between text-[10px] overflow-x-auto gap-1 py-1"
            role="list"
          >
            {LIFECYCLE_STEPS.map((st, idx) => {
              const isPast = idx <= currentStepIndex;
              const isCurrent = st === 'IN_PROCESSING';
              return (
                <div key={st} className="flex items-center gap-1 shrink-0" role="listitem">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                      isCurrent
                        ? 'bg-primary text-primary-foreground'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                    aria-hidden="true"
                  >
                    {idx + 1}
                  </div>
                  <span
                    className={`font-medium ${
                      isCurrent
                        ? 'text-primary font-bold'
                        : isPast
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {st}
                  </span>
                  {idx < LIFECYCLE_STEPS.length - 1 && (
                    <span className="text-muted-foreground/40 ml-1" aria-hidden="true">
                      ›
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/30 bg-primary/5 shadow-xs">
        <CardContent className="p-4">
          <Form {...barcodeForm}>
            <form
              onSubmit={barcodeForm.handleSubmit(onScanBarcode)}
              className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
            >
              <div className="relative w-full">
                <Barcode
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary"
                  aria-hidden="true"
                />
                <Input
                  {...barcodeForm.register('barcodeInput')}
                  placeholder={t('supplier.fulfillment.scanner.placeholder')}
                  aria-label={t('supplier.fulfillment.scanner.label')}
                  className="pl-9 font-mono text-xs bg-background"
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  type="submit"
                  size="sm"
                  className="font-semibold shadow-xs text-xs shrink-0"
                >
                  {t('supplier.fulfillment.scanner.verify')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleQuickVerifyAll}
                  className="text-xs shrink-0 font-medium"
                >
                  {t('supplier.fulfillment.scanner.verifyAll')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-xs overflow-hidden">
        <div className="flex flex-row items-center justify-between gap-2 py-3 px-5 border-b border-border">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" aria-hidden="true" />
            {t('supplier.fulfillment.pickList.title')}
          </h2>
          <Link
            to="/supplier/inventory/map"
            search={{ sku: pickItems[0]?.sku, bin: pickItems[0]?.bin, orderId }}
            className="text-xs"
          >
            <Button size="sm" variant="outline" className="text-xs h-7 gap-1.5 border-primary/30">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {t('supplier.fulfillment.pickList.viewMap')}
            </Button>
          </Link>
        </div>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[720px]">
            <caption className="sr-only">{t('supplier.fulfillment.pickList.tableCaption')}</caption>
            <thead className="bg-muted/40 border-b border-border text-muted-foreground whitespace-nowrap uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">{t('supplier.fulfillment.pickList.zoneBin')}</th>
                <th className="py-3 px-4">{t('supplier.fulfillment.pickList.item')}</th>
                <th className="py-3 px-4">{t('supplier.fulfillment.pickList.barcode')}</th>
                <th className="py-3 px-4 text-right">
                  {t('supplier.fulfillment.pickList.required')}
                </th>
                <th className="py-3 px-4 text-right">
                  {t('supplier.fulfillment.pickList.picked')}
                </th>
                <th className="py-3 px-4 text-right">
                  {t('supplier.fulfillment.pickList.verification')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pickItems.map((item) => {
                const verificationTone: StatusTone = item.isVerified ? 'success' : 'warning';
                const verificationLabel = item.isVerified
                  ? t('supplier.fulfillment.pickList.verifiedBadge')
                  : t('supplier.fulfillment.pickList.pendingBadge');
                return (
                  <tr
                    key={item.sku}
                    className={item.isVerified ? 'bg-emerald-500/5' : 'hover:bg-muted/40'}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground">{item.zone}</div>
                      <Link
                        to="/supplier/inventory/map"
                        search={{ sku: item.sku, bin: item.bin, orderId }}
                        className="font-mono text-[11px] text-primary font-bold inline-flex items-center gap-1 hover:underline"
                        aria-label={t('supplier.fulfillment.pickList.mapAria', { bin: item.bin })}
                      >
                        <MapPin className="h-3 w-3" aria-hidden="true" /> {item.bin}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground">{item.name}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">{item.sku}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">
                      {item.scannedBarcode}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums text-foreground">
                      {item.quantityRequired} {t('supplier.fulfillment.itemsUnit')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                      {item.quantityPicked} {t('supplier.fulfillment.itemsUnit')}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <StatusBadge tone={verificationTone} label={verificationLabel} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-xs">
        <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-muted text-muted-foreground shrink-0">
              <Weight className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <Label htmlFor="cargo-weight" className="text-xs font-semibold">
                {t('supplier.fulfillment.weight.label')}
              </Label>
              <Input
                id="cargo-weight"
                type="number"
                value={cargoWeightKg}
                onChange={(e) => setCargoWeightKg(Number(e.target.value))}
                className="w-40 font-mono font-bold text-sm mt-1 bg-background"
              />
            </div>
          </div>

          <Button
            size="sm"
            disabled={!allVerified}
            onClick={handleDispatchOrder}
            className="gap-2 font-bold shadow-xs w-full sm:w-auto"
          >
            <Truck className="h-4 w-4" aria-hidden="true" />
            {t('supplier.fulfillment.dispatch.button')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default WarehouseFulfillmentWorkstation;