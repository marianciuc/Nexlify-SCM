import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Tag, Plus, Search, X, ArrowRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  FormFieldInput,
  FormFieldSelect,
  FormFieldNumber,
} from '@/components/forms/common';
import { MoneyDisplay } from '@/components/money-display';
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

export const Route = createFileRoute('/supplier/pricing/')({
  component: SupplierPricingPage,
});

interface PricingContract {
  id: string;
  contractNo: string;
  buyerName: string;
  buyerNip: string;
  sku: string;
  productName: string;
  basePrice: number;
  contractPrice: number;
  discountPercent: number;
  validUntil: string;
  status: 'ACTIVE' | 'EXPIRED';
}

const INITIAL_CONTRACTS: PricingContract[] = [
  {
    id: 'prc-01',
    contractNo: 'PRC-2026-0081',
    buyerName: 'Baltic Retail Group Sp. z o.o.',
    buyerNip: '8522619472',
    sku: 'SKU-PAL-01',
    productName: 'EPAL Euro-Pallet Standard (Pine Wood)',
    basePrice: 120.0,
    contractPrice: 102.0,
    discountPercent: 15.0,
    validUntil: '2026-12-31',
    status: 'ACTIVE',
  },
  {
    id: 'prc-02',
    contractNo: 'PRC-2026-0094',
    buyerName: 'Pomerania Foods Sp. k.',
    buyerNip: '5832918471',
    sku: 'SKU-COL-09',
    productName: 'Insulated Thermobox 60L Pharma/Food Grade',
    basePrice: 224.33,
    contractPrice: 195.0,
    discountPercent: 13.1,
    validUntil: '2026-11-30',
    status: 'ACTIVE',
  },
  {
    id: 'prc-03',
    contractNo: 'PRC-2026-0042',
    buyerName: 'Silesia Freight & Logistics S.A.',
    buyerNip: '6342819401',
    sku: 'SKU-STR-05',
    productName: 'Industrial Stretch Film 23mic',
    basePrice: 411.25,
    contractPrice: 360.0,
    discountPercent: 12.5,
    validUntil: '2026-10-15',
    status: 'ACTIVE',
  },
];

const STATUS_TONE: Record<PricingContract['status'], StatusTone> = {
  ACTIVE: 'success',
  EXPIRED: 'neutral',
};

const STATUS_LABEL_KEY: Record<PricingContract['status'], TranslationPath> = {
  ACTIVE: 'supplier.pricing.status.ACTIVE',
  EXPIRED: 'supplier.pricing.status.EXPIRED',
};

function SupplierPricingPage() {
  return <SupplierPricingContent />;
}

function SupplierPricingContent() {
  const { t } = useLocale();
  const [contracts, setContracts] = useState<PricingContract[]>(INITIAL_CONTRACTS);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'EXPIRED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Validation messages are user-visible — rebuild schema with the active locale.
  const contractSchema = useMemo(
    () =>
      z.object({
        buyerName: z.string().min(1, t('supplier.pricing.modal.validation.buyerRequired')),
        buyerNip: z.string().min(10, t('supplier.pricing.modal.validation.nipRequired')),
        sku: z.string().min(1, t('supplier.pricing.modal.validation.skuRequired')),
        discountPercent: z.number().min(1).max(50),
        validUntil: z.string().min(1, t('supplier.pricing.modal.validation.validUntilRequired')),
      }),
    [t]
  );

  const skuOptions = useMemo(
    () => [
      { value: 'SKU-PAL-01', label: t('supplier.pricing.modal.skuOption', { sku: 'SKU-PAL-01', name: 'EPAL Euro-Pallet', price: '120.00' }) },
      { value: 'SKU-STR-05', label: t('supplier.pricing.modal.skuOption', { sku: 'SKU-STR-05', name: 'Stretch Film 23mic', price: '411.25' }) },
      { value: 'SKU-COL-09', label: t('supplier.pricing.modal.skuOption', { sku: 'SKU-COL-09', name: 'Thermobox 60L', price: '224.33' }) },
    ],
    [t]
  );

  const form = useForm<z.infer<typeof contractSchema>>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      buyerName: '',
      buyerNip: '',
      sku: 'SKU-PAL-01',
      discountPercent: 10,
      validUntil: '2026-12-31',
    },
  });

  const onSubmit = (data: z.infer<typeof contractSchema>) => {
    const basePrice = data.sku === 'SKU-PAL-01' ? 120.0 : 411.25;
    const contractPrice =
      Math.round((basePrice * (1 - data.discountPercent / 100)) * 100) / 100;

    const productName =
      data.sku === 'SKU-PAL-01'
        ? 'EPAL Euro-Pallet Standard'
        : data.sku === 'SKU-STR-05'
        ? 'Industrial Stretch Film 23mic'
        : 'Insulated Thermobox 60L';

    const newContract: PricingContract = {
      id: 'prc-' + Math.random().toString(36).substring(2, 7),
      contractNo: `PRC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      buyerName: data.buyerName,
      buyerNip: data.buyerNip,
      sku: data.sku,
      productName,
      basePrice,
      contractPrice,
      discountPercent: data.discountPercent,
      validUntil: data.validUntil,
      status: 'ACTIVE',
    };

    setContracts([newContract, ...contracts]);
    setShowModal(false);
    form.reset();
    toast.success(
      t('supplier.pricing.modal.success', { number: newContract.contractNo, nip: data.buyerNip })
    );
  };

  const counts = useMemo(
    () => ({
      ALL: contracts.length,
      ACTIVE: contracts.filter((c) => c.status === 'ACTIVE').length,
      EXPIRED: contracts.filter((c) => c.status === 'EXPIRED').length,
    }),
    [contracts]
  );

  const filtered = useMemo(() => {
    const s = searchQuery.toLowerCase().trim();
    return contracts.filter((c) => {
      if (filterStatus !== 'ALL' && c.status !== filterStatus) return false;
      if (!s) return true;
      return (
        c.contractNo.toLowerCase().includes(s) ||
        c.buyerName.toLowerCase().includes(s) ||
        c.buyerNip.includes(s) ||
        c.sku.toLowerCase().includes(s) ||
        c.productName.toLowerCase().includes(s)
      );
    });
  }, [contracts, filterStatus, searchQuery]);

  const hasFilters = filterStatus !== 'ALL' || searchQuery.length > 0;
  const clearAll = () => {
    setFilterStatus('ALL');
    setSearchQuery('');
  };

  const filterLabels: Record<typeof filterStatus, string> = {
    ALL: t('supplier.pricing.filters.all'),
    ACTIVE: t('supplier.pricing.filters.active'),
    EXPIRED: t('supplier.pricing.filters.expired'),
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto min-w-0">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" aria-hidden="true" />
            {t('supplier.pricing.title')}
          </span>
        }
        subtitle={t('supplier.pricing.subtitle')}
        actions={
          <Button
            size="sm"
            className="gap-2 shadow-xs font-semibold w-full sm:w-auto"
            onClick={() => setShowModal(true)}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t('supplier.pricing.actions.new')}
          </Button>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="flex items-center gap-1 bg-card p-1 rounded-lg border border-border shadow-xs text-xs overflow-x-auto"
          role="group"
          aria-label={t('supplier.pricing.filters.ariaLabel')}
        >
          {(['ALL', 'ACTIVE', 'EXPIRED'] as const).map((id) => {
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
                <span>{filterLabels[id]}</span>
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
              placeholder={t('supplier.pricing.filters.searchPlaceholder')}
              aria-label={t('supplier.pricing.filters.searchLabel')}
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
              {t('supplier.pricing.filters.clearAll')}
            </Button>
          )}
        </div>
      </div>

      <Card className="border-border shadow-xs overflow-hidden bg-card">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[860px]">
            <caption className="sr-only">{t('supplier.pricing.table.caption')}</caption>
            <thead className="bg-muted/40 border-b border-border text-muted-foreground whitespace-nowrap uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">{t('supplier.pricing.table.contractNo')}</th>
                <th className="py-3 px-4">{t('supplier.pricing.table.buyer')}</th>
                <th className="py-3 px-4">{t('supplier.pricing.table.item')}</th>
                <th className="py-3 px-4 text-right">{t('supplier.pricing.table.listPrice')}</th>
                <th className="py-3 px-4 text-right">{t('supplier.pricing.table.contractPrice')}</th>
                <th className="py-3 px-4 text-right">{t('supplier.pricing.table.discount')}</th>
                <th className="py-3 px-4">{t('supplier.pricing.table.validUntil')}</th>
                <th className="py-3 px-4">{t('supplier.pricing.table.status')}</th>
                <th className="py-3 px-4 text-right">{t('supplier.pricing.table.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border whitespace-nowrap">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-sm text-muted-foreground">
                    {t('supplier.pricing.empty')}
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-xs text-primary">
                      <Link
                        to="/supplier/pricing/$contractId"
                        params={{ contractId: c.id }}
                        className="hover:underline"
                      >
                        {c.contractNo}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{c.buyerName}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        NIP: {c.buyerNip}
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-[260px]">
                      <div className="font-semibold text-foreground line-clamp-1">{c.productName}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">{c.sku}</div>
                    </td>
                    <td className="py-3 px-4 text-right text-muted-foreground line-through">
                      <MoneyDisplay amount={c.basePrice} variant="inline" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <MoneyDisplay
                        amount={c.contractPrice}
                        variant="inline"
                        emphasize
                        className="text-foreground"
                      />
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                      -{c.discountPercent}%
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-foreground">{c.validUntil}</td>
                    <td className="py-3 px-4">
                      <StatusBadge
                        tone={STATUS_TONE[c.status]}
                        label={t(STATUS_LABEL_KEY[c.status])}
                        size="sm"
                      />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to="/supplier/pricing/$contractId"
                        params={{ contractId: c.id }}
                        aria-label={t('supplier.pricing.actions.detailsAria', {
                          number: c.contractNo,
                        })}
                      >
                        <Button variant="ghost" size="xs" className="gap-1">
                          {t('supplier.pricing.actions.details')}
                          <ArrowRight className="h-3 w-3 rtl:rotate-180" aria-hidden="true" />
                        </Button>
                      </Link>
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
              <Tag className="h-5 w-5 text-primary" aria-hidden="true" />
              {t('supplier.pricing.modal.title')}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-xs">
              <FormFieldInput
                control={form.control}
                name="buyerName"
                label={t('supplier.pricing.modal.fields.buyerName')}
                placeholder={t('supplier.pricing.modal.fields.buyerNamePlaceholder')}
                className="font-medium"
              />

              <FormFieldInput
                control={form.control}
                name="buyerNip"
                label={t('supplier.pricing.modal.fields.buyerNip')}
                placeholder={t('supplier.pricing.modal.fields.buyerNipPlaceholder')}
                className="font-mono font-bold"
              />

              <FormFieldSelect
                control={form.control}
                name="sku"
                label={t('supplier.pricing.modal.fields.sku')}
                options={skuOptions}
                className="font-mono"
              />

              <div className="grid grid-cols-2 gap-3">
                <FormFieldNumber
                  control={form.control}
                  name="discountPercent"
                  label={t('supplier.pricing.modal.fields.discount')}
                  min={1}
                  max={50}
                  className="font-bold"
                />

                <FormFieldInput
                  control={form.control}
                  name="validUntil"
                  type="date"
                  label={t('supplier.pricing.modal.fields.validUntil')}
                />
              </div>

              <DialogFooter className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                >
                  {t('supplier.pricing.modal.cancel')}
                </Button>
                <Button type="submit" size="sm" className="gap-1.5 font-semibold shadow-xs">
                  {t('supplier.pricing.modal.submit')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SupplierPricingPage;