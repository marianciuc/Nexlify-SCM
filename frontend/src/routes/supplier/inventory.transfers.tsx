import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { ArrowLeftRight, Plus, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  FormFieldSelect,
  FormFieldNumber,
} from '@/components/forms/common';
import { QuantityDisplay } from '@/components/money-display';
import { PageHeader } from '@/components/page-header';
import { StatusBadge, type StatusTone } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useLocale } from '@/hooks/useLocale';
import { type TranslationPath } from '@/types/generated-locale';

export const Route = createFileRoute('/supplier/inventory/transfers')({
  component: WarehouseTransfersPage,
  staticData: {
    crumb: {
      label: 'nav.supplier.transfers',
    },
  },
});

type TransferStatus = 'DISPATCHED' | 'IN_TRANSIT' | 'RECEIVED';
type TransferFilter = 'ALL' | TransferStatus;
/** Locale-independent arrival code; only the rendering goes through t(). */
type EtaKind = 'TODAY' | 'TOMORROW' | 'DELIVERED';

interface TransferOrder {
  id: string;
  transferNo: string;
  sourceHub: string;
  destinationHub: string;
  sku: string;
  productName: string;
  quantity: number;
  carrier: string;
  status: TransferStatus;
  initiatedBy: string;
  createdAt: string;
  eta: EtaKind;
  etaTime: string;
}

const INITIAL_TRANSFERS: TransferOrder[] = [
  {
    id: 'trf-01',
    transferNo: 'TRF-2026-0812',
    sourceHub: 'Central DC Warszawa (WH-WAW-01)',
    destinationHub: 'Silesia Logistics Hub Katowice (WH-KTW-03)',
    sku: 'SKU-PAL-01',
    productName: 'EPAL Euro-Pallet Standard',
    quantity: 300,
    carrier: 'Nexlify Inter-DC Shuttle #4',
    status: 'IN_TRANSIT',
    initiatedBy: 'A. Kowalska',
    createdAt: '2026-10-06',
    eta: 'TODAY',
    etaTime: '17:30',
  },
  {
    id: 'trf-02',
    transferNo: 'TRF-2026-0813',
    sourceHub: 'Central DC Warszawa (WH-WAW-01)',
    destinationHub: 'Port Logistics Hub Szczecin (WH-SZC-02)',
    sku: 'SKU-STR-05',
    productName: 'Industrial Stretch Film 23mic',
    quantity: 120,
    carrier: 'Baltic Shuttle Line',
    status: 'RECEIVED',
    initiatedBy: 'M. Nowak',
    createdAt: '2026-10-03',
    eta: 'DELIVERED',
    etaTime: '',
  },
];

const STATUS_TONE: Record<TransferStatus, StatusTone> = {
  DISPATCHED: 'info',
  IN_TRANSIT: 'warning',
  RECEIVED: 'success',
};

const STATUS_LABEL_KEY: Record<TransferStatus, TranslationPath> = {
  DISPATCHED: 'supplier.transfers.status.DISPATCHED',
  IN_TRANSIT: 'supplier.transfers.status.IN_TRANSIT',
  RECEIVED: 'supplier.transfers.status.RECEIVED',
};

const FILTER_LABEL_KEY: Record<TransferFilter, TranslationPath> = {
  ALL: 'common.all',
  ...STATUS_LABEL_KEY,
};

const ETA_LABEL_KEY: Record<EtaKind, TranslationPath> = {
  TODAY: 'supplier.transfers.eta.today',
  TOMORROW: 'supplier.transfers.eta.tomorrow',
  DELIVERED: 'supplier.transfers.eta.delivered',
};

const TRANSFER_FILTERS: TransferFilter[] = ['ALL', 'DISPATCHED', 'IN_TRANSIT', 'RECEIVED'];

const sourceHubOptions = [
  { value: 'Central DC Warszawa (WH-WAW-01)', label: 'Central DC Warszawa (WH-WAW-01)' },
  { value: 'Silesia Logistics Hub Katowice (WH-KTW-03)', label: 'Silesia Logistics Hub Katowice (WH-KTW-03)' },
  { value: 'Port Logistics Hub Szczecin (WH-SZC-02)', label: 'Port Logistics Hub Szczecin (WH-SZC-02)' },
];

const destHubOptions = [
  { value: 'Silesia Logistics Hub Katowice (WH-KTW-03)', label: 'Silesia Logistics Hub Katowice (WH-KTW-03)' },
  { value: 'Central DC Warszawa (WH-WAW-01)', label: 'Central DC Warszawa (WH-WAW-01)' },
  { value: 'Port Logistics Hub Szczecin (WH-SZC-02)', label: 'Port Logistics Hub Szczecin (WH-SZC-02)' },
];

const SKU_CATALOG: Record<string, string> = {
  'SKU-PAL-01': 'EPAL Euro-Pallet',
  'SKU-STR-05': 'Stretch Film 23mic',
  'SKU-HYD-02': 'Pallet Trucks',
};

function WarehouseTransfersPage() {
  return <WarehouseTransfersContent />;
}

function WarehouseTransfersContent() {
  const { t } = useLocale();
  const [transfers, setTransfers] = useState<TransferOrder[]>(INITIAL_TRANSFERS);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TransferFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Validation messages are user-visible — rebuild schema with the active locale.
  const transferSchema = useMemo(
    () =>
      z.object({
        sourceHub: z.string().min(1, t('supplier.transfers.modal.validation.sourceRequired')),
        destHub: z.string().min(1, t('supplier.transfers.modal.validation.destRequired')),
        sku: z.string().min(1, t('supplier.transfers.modal.validation.skuRequired')),
        qty: z.number().int().min(1, t('supplier.transfers.modal.validation.qtyMin')),
      }),
    [t]
  );

  const skuOptions = useMemo(
    () =>
      Object.entries(SKU_CATALOG).map(([value, name]) => ({
        value,
        label: t('supplier.transfers.modal.skuOption', { sku: value, name }),
      })),
    [t]
  );

  const form = useForm<z.infer<typeof transferSchema>>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      sourceHub: 'Central DC Warszawa (WH-WAW-01)',
      destHub: 'Silesia Logistics Hub Katowice (WH-KTW-03)',
      sku: 'SKU-PAL-01',
      qty: 150,
    },
  });

  const onSubmit = (data: z.infer<typeof transferSchema>) => {
    const newTrf: TransferOrder = {
      id: 'trf-' + Math.random().toString(36).substring(2, 7),
      transferNo: `TRF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      sourceHub: data.sourceHub,
      destinationHub: data.destHub,
      sku: data.sku,
      productName: data.sku === 'SKU-PAL-01' ? 'EPAL Euro-Pallet Standard' : 'Warehouse Item',
      quantity: data.qty,
      carrier: 'Internal Hub Logistics Shuttle',
      status: 'DISPATCHED',
      initiatedBy: 'Nexlify WMS Console',
      createdAt: '2026-10-07',
      eta: 'TOMORROW',
      etaTime: '12:00',
    };
    setTransfers([newTrf, ...transfers]);
    setShowModal(false);
    form.reset();
    toast.success(
      t('supplier.transfers.modal.success', {
        number: newTrf.transferNo,
        from: data.sourceHub,
        to: data.destHub,
      })
    );
  };

  const counts = useMemo(() => {
    const base: Record<TransferFilter, number> = {
      ALL: transfers.length,
      DISPATCHED: 0,
      IN_TRANSIT: 0,
      RECEIVED: 0,
    };
    for (const trf of transfers) base[trf.status] += 1;
    return base;
  }, [transfers]);

  const filtered = useMemo(() => {
    const s = searchQuery.toLowerCase().trim();
    return transfers.filter((trf) => {
      if (filterStatus !== 'ALL' && trf.status !== filterStatus) return false;
      if (!s) return true;
      return (
        trf.transferNo.toLowerCase().includes(s) ||
        trf.sku.toLowerCase().includes(s) ||
        trf.productName.toLowerCase().includes(s) ||
        trf.sourceHub.toLowerCase().includes(s) ||
        trf.destinationHub.toLowerCase().includes(s) ||
        trf.initiatedBy.toLowerCase().includes(s)
      );
    });
  }, [transfers, filterStatus, searchQuery]);

  const hasFilters = filterStatus !== 'ALL' || searchQuery.length > 0;
  const clearAll = () => {
    setFilterStatus('ALL');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto min-w-0">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-primary" aria-hidden="true" />
            {t('supplier.transfers.title')}
          </span>
        }
        subtitle={t('supplier.transfers.subtitle')}
        actions={
          <Button
            size="sm"
            className="gap-2 shadow-xs font-semibold w-full sm:w-auto"
            onClick={() => setShowModal(true)}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t('supplier.transfers.actions.create')}
          </Button>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="flex items-center gap-1 bg-card p-1 rounded-lg border border-border shadow-xs text-xs overflow-x-auto"
          role="group"
          aria-label={t('supplier.transfers.filters.ariaLabel')}
        >
          {TRANSFER_FILTERS.map((id) => {
            const isActive = filterStatus === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFilterStatus(id)}
                aria-pressed={isActive}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <span>{t(FILTER_LABEL_KEY[id])}</span>
                <span
                  className={`tabular-nums px-1.5 rounded text-[10px] font-bold ${
                    isActive
                      ? 'bg-primary-foreground/15 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {counts[id]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              placeholder={t('supplier.transfers.filters.searchPlaceholder')}
              aria-label={t('supplier.transfers.filters.searchLabel')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 w-full sm:w-[280px] text-xs bg-background border-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={t('common.clear')}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs">
              {t('common.clearAll')}
            </Button>
          )}
        </div>
      </div>

      <Card className="border-border shadow-xs overflow-hidden bg-card">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[1020px]">
            <caption className="sr-only">{t('supplier.transfers.table.caption')}</caption>
            <thead className="bg-muted/40 border-b border-border text-muted-foreground whitespace-nowrap uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">{t('supplier.transfers.table.transferNo')}</th>
                <th className="py-3 px-4">{t('supplier.transfers.table.item')}</th>
                <th className="py-3 px-4">{t('supplier.transfers.table.from')}</th>
                <th className="py-3 px-4">{t('supplier.transfers.table.to')}</th>
                <th className="py-3 px-4 text-right">{t('supplier.transfers.table.qty')}</th>
                <th className="py-3 px-4">{t('common.status')}</th>
                <th className="py-3 px-4">{t('supplier.transfers.table.initiatedBy')}</th>
                <th className="py-3 px-4">{t('supplier.transfers.table.created')}</th>
                <th className="py-3 px-4 text-right">{t('supplier.transfers.table.eta')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border whitespace-nowrap">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-sm text-muted-foreground">
                    <ArrowLeftRight className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" aria-hidden="true" />
                    <p className="font-semibold text-foreground">{t('supplier.transfers.empty.title')}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('supplier.transfers.empty.subtitle')}</p>
                  </td>
                </tr>
              ) : (
                filtered.map((trf) => (
                  <tr key={trf.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-xs text-primary">
                      {trf.transferNo}
                    </td>
                    <td className="py-3 px-4 max-w-[220px]">
                      <div className="font-semibold text-foreground line-clamp-1">{trf.productName}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">{trf.sku}</div>
                    </td>
                    <td className="py-3 px-4 max-w-[220px]">
                      <div className="text-foreground line-clamp-1">{trf.sourceHub}</div>
                    </td>
                    <td className="py-3 px-4 max-w-[220px]">
                      <div className="text-foreground line-clamp-1">{trf.destinationHub}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <QuantityDisplay amount={trf.quantity} unit={t('supplier.transfers.units.pcs')} emphasize />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge
                        tone={STATUS_TONE[trf.status]}
                        label={t(STATUS_LABEL_KEY[trf.status])}
                        size="sm"
                      />
                    </td>
                    <td className="py-3 px-4 text-xs text-foreground">{trf.initiatedBy}</td>
                    <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{trf.createdAt}</td>
                    <td className="py-3 px-4 text-right text-xs text-foreground">
                      {t(ETA_LABEL_KEY[trf.eta], { time: trf.etaTime })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <ArrowLeftRight className="h-5 w-5 text-primary" aria-hidden="true" />
              {t('supplier.transfers.modal.title')}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-xs">
              <FormFieldSelect
                control={form.control}
                name="sourceHub"
                label={t('supplier.transfers.modal.fields.sourceHub')}
                options={sourceHubOptions}
              />

              <FormFieldSelect
                control={form.control}
                name="destHub"
                label={t('supplier.transfers.modal.fields.destHub')}
                options={destHubOptions}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormFieldSelect
                  control={form.control}
                  name="sku"
                  label={t('supplier.transfers.modal.fields.sku')}
                  options={skuOptions}
                  className="font-mono"
                />

                <FormFieldNumber
                  control={form.control}
                  name="qty"
                  label={t('supplier.transfers.modal.fields.qty')}
                  min={1}
                  step={1}
                  className="font-bold"
                />
              </div>

              <DialogFooter className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" size="sm" className="gap-1.5 font-semibold shadow-xs">
                  {t('supplier.transfers.modal.submit')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default WarehouseTransfersPage;
