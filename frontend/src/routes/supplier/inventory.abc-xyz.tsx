import { createFileRoute } from '@tanstack/react-router';
import { Grid, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { MoneyDisplay } from '@/components/money-display';
import { PageHeader } from '@/components/page-header';
import { StatusBadge, type StatusTone } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocale } from '@/hooks/useLocale';
import { type TranslationPath } from '@/types/generated-locale';

export const Route = createFileRoute('/supplier/inventory/abc-xyz')({
  component: AbcXyzAnalysisPage,
  staticData: {
    crumb: {
      label: 'nav.supplier.abcXyz',
    },
  },
});

/** Analysis class codes — locale-independent, only rendering goes through t(). */
type AbcClass = 'A' | 'B' | 'C';
type XyzClass = 'X' | 'Y' | 'Z';
type AbcFilter = 'ALL' | AbcClass;
type XyzFilter = 'ALL' | XyzClass;
type PolicyCode = 'JIT_BUFFER' | 'WEEKLY_REORDER' | 'SEASONAL_SAFETY_STOCK' | 'ON_DEMAND';

interface AbcItem {
  sku: string;
  name: string;
  annualRevenuePln: number;
  revenueSharePercent: number;
  variationCoefficientPercent: number;
  abc: AbcClass;
  xyz: XyzClass;
  policy: PolicyCode;
}

const ABC_ITEMS: AbcItem[] = [
  {
    sku: 'SKU-PAL-01',
    name: 'EPAL Euro-Pallet Standard',
    annualRevenuePln: 1450000,
    revenueSharePercent: 62.5,
    variationCoefficientPercent: 6.8,
    abc: 'A',
    xyz: 'X',
    policy: 'JIT_BUFFER',
  },
  {
    sku: 'SKU-STR-05',
    name: 'Industrial Stretch Film 23mic',
    annualRevenuePln: 420000,
    revenueSharePercent: 18.1,
    variationCoefficientPercent: 8.2,
    abc: 'B',
    xyz: 'X',
    policy: 'WEEKLY_REORDER',
  },
  {
    sku: 'SKU-COL-09',
    name: 'Insulated Thermobox 60L Pharma',
    annualRevenuePln: 280000,
    revenueSharePercent: 12.0,
    variationCoefficientPercent: 21.4,
    abc: 'B',
    xyz: 'Y',
    policy: 'SEASONAL_SAFETY_STOCK',
  },
  {
    sku: 'SKU-HYD-02',
    name: 'Hydraulic Hand Pallet Truck 2.5t',
    annualRevenuePln: 170000,
    revenueSharePercent: 7.4,
    variationCoefficientPercent: 34.0,
    abc: 'C',
    xyz: 'Z',
    policy: 'ON_DEMAND',
  },
];

const ABC_TONE: Record<AbcClass, StatusTone> = {
  A: 'success',
  B: 'info',
  C: 'neutral',
};

const XYZ_TONE: Record<XyzClass, StatusTone> = {
  X: 'success',
  Y: 'warning',
  Z: 'danger',
};

const POLICY_LABEL_KEY: Record<PolicyCode, TranslationPath> = {
  JIT_BUFFER: 'supplier.abcXyz.policy.JIT_BUFFER',
  WEEKLY_REORDER: 'supplier.abcXyz.policy.WEEKLY_REORDER',
  SEASONAL_SAFETY_STOCK: 'supplier.abcXyz.policy.SEASONAL_SAFETY_STOCK',
  ON_DEMAND: 'supplier.abcXyz.policy.ON_DEMAND',
};

const ABC_FILTERS: AbcFilter[] = ['ALL', 'A', 'B', 'C'];
const XYZ_FILTERS: XyzFilter[] = ['ALL', 'X', 'Y', 'Z'];

function AbcXyzAnalysisPage() {
  return <AbcXyzAnalysisContent />;
}

function AbcXyzAnalysisContent() {
  const { t } = useLocale();
  const [abcFilter, setAbcFilter] = useState<AbcFilter>('ALL');
  const [xyzFilter, setXyzFilter] = useState<XyzFilter>('ALL');

  const filtered = useMemo(
    () =>
      ABC_ITEMS.filter(
        (item) =>
          (abcFilter === 'ALL' || item.abc === abcFilter) &&
          (xyzFilter === 'ALL' || item.xyz === xyzFilter)
      ),
    [abcFilter, xyzFilter]
  );

  const abcCounts = useMemo(() => {
    const base: Record<AbcFilter, number> = { ALL: ABC_ITEMS.length, A: 0, B: 0, C: 0 };
    for (const item of ABC_ITEMS) base[item.abc] += 1;
    return base;
  }, []);

  const xyzCounts = useMemo(() => {
    const base: Record<XyzFilter, number> = { ALL: ABC_ITEMS.length, X: 0, Y: 0, Z: 0 };
    for (const item of ABC_ITEMS) base[item.xyz] += 1;
    return base;
  }, []);

  const hasFilters = abcFilter !== 'ALL' || xyzFilter !== 'ALL';
  const clearAll = () => {
    setAbcFilter('ALL');
    setXyzFilter('ALL');
  };

  const renderFilterGroup = <T extends AbcFilter | XyzFilter>(
    filters: readonly T[],
    active: T,
    onSelect: (next: T) => void,
    counts: Record<T, number>,
    ariaLabel: string
  ) => (
    <div
      className="flex items-center gap-1 bg-card p-1 rounded-lg border border-border shadow-xs text-xs overflow-x-auto"
      role="group"
      aria-label={ariaLabel}
    >
      {filters.map((id) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            aria-pressed={isActive}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 ${
              isActive
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <span>{id === 'ALL' ? t('common.all') : id}</span>
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
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto min-w-0">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Grid className="h-5 w-5 text-primary" aria-hidden="true" />
            {t('supplier.abcXyz.title')}
          </span>
        }
        subtitle={t('supplier.abcXyz.subtitle')}
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {renderFilterGroup(ABC_FILTERS, abcFilter, setAbcFilter, abcCounts, t('supplier.abcXyz.filters.abcAria'))}
          {renderFilterGroup(XYZ_FILTERS, xyzFilter, setXyzFilter, xyzCounts, t('supplier.abcXyz.filters.xyzAria'))}
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs self-start">
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            {t('common.clearAll')}
          </Button>
        )}
      </div>

      {/* Compact class definitions — replaces the decorative 9-cell grid card */}
      <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-xs space-y-2">
        <p className="font-semibold text-foreground">{t('supplier.abcXyz.legend.title')}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-muted-foreground">
          <span className="font-medium text-foreground">{t('supplier.abcXyz.legend.abcLabel')}</span>
          <span className="inline-flex items-center gap-1.5">
            <StatusBadge tone={ABC_TONE.A} label="A" size="sm" />
            {t('supplier.abcXyz.legend.abcA')}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <StatusBadge tone={ABC_TONE.B} label="B" size="sm" />
            {t('supplier.abcXyz.legend.abcB')}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <StatusBadge tone={ABC_TONE.C} label="C" size="sm" />
            {t('supplier.abcXyz.legend.abcC')}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-muted-foreground">
          <span className="font-medium text-foreground">{t('supplier.abcXyz.legend.xyzLabel')}</span>
          <span className="inline-flex items-center gap-1.5">
            <StatusBadge tone={XYZ_TONE.X} label="X" size="sm" />
            {t('supplier.abcXyz.legend.xyzX')}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <StatusBadge tone={XYZ_TONE.Y} label="Y" size="sm" />
            {t('supplier.abcXyz.legend.xyzY')}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <StatusBadge tone={XYZ_TONE.Z} label="Z" size="sm" />
            {t('supplier.abcXyz.legend.xyzZ')}
          </span>
        </div>
      </div>

      <Card className="border-border shadow-xs overflow-hidden bg-card">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[980px]">
            <caption className="sr-only">{t('supplier.abcXyz.table.caption')}</caption>
            <thead className="bg-muted/40 border-b border-border text-muted-foreground whitespace-nowrap uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">{t('supplier.abcXyz.table.item')}</th>
                <th className="py-3 px-4 text-right">{t('supplier.abcXyz.table.annualRevenue')}</th>
                <th className="py-3 px-4 text-right">{t('supplier.abcXyz.table.revenueShare')}</th>
                <th className="py-3 px-4 text-right">{t('supplier.abcXyz.table.variation')}</th>
                <th className="py-3 px-4">{t('supplier.abcXyz.table.abcClass')}</th>
                <th className="py-3 px-4">{t('supplier.abcXyz.table.xyzClass')}</th>
                <th className="py-3 px-4 min-w-[280px]">{t('supplier.abcXyz.table.policy')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                    <Grid className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" aria-hidden="true" />
                    <p className="font-semibold text-foreground">{t('supplier.abcXyz.empty.title')}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('supplier.abcXyz.empty.subtitle')}</p>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.sku} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-foreground">{item.name}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">{item.sku}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <MoneyDisplay amount={item.annualRevenuePln} variant="inline" emphasize />
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-foreground">
                      {item.revenueSharePercent}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-muted-foreground">
                      {item.variationCoefficientPercent}%
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge tone={ABC_TONE[item.abc]} label={item.abc} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge tone={XYZ_TONE[item.xyz]} label={item.xyz} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {t(POLICY_LABEL_KEY[item.policy])}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default AbcXyzAnalysisPage;
