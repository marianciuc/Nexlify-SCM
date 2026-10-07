import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Gavel,
  Send,
  ArrowUpRight,
  ShieldCheck,
  X,
  Search,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { MoneyDisplay } from '@/components/money-display';
import { PageHeader } from '@/components/page-header';
import { StatusBadge, type StatusTone } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLocale } from '@/hooks/useLocale';
import { useOpenRfqsQuery } from '@/hooks/useScmQueries';
import { type TranslationPath } from '@/types/generated-locale';
import type { RfqItem } from '@/types/scm-domain';

export const Route = createFileRoute('/supplier/bids/board')({
  component: RfqMarketplacePage,
  staticData: {
    crumb: {
      label: 'nav.supplier.rfq',
    },
  },
});

type StatusFilter = 'ALL' | 'OPEN' | 'EVALUATION' | 'AWARDED';

const STATUS_FILTERS: { id: StatusFilter; labelKey: TranslationPath }[] = [
  { id: 'ALL', labelKey: 'supplier.bids.filters.all' },
  { id: 'OPEN', labelKey: 'supplier.bids.filters.open' },
  { id: 'EVALUATION', labelKey: 'supplier.bids.filters.evaluation' },
  { id: 'AWARDED', labelKey: 'supplier.bids.filters.awarded' },
];

const RFQ_STATUS_TONE: Record<RfqItem['status'], StatusTone> = {
  DRAFT: 'neutral',
  OPEN: 'success',
  EVALUATION: 'warning',
  AWARDED: 'info',
  CLOSED: 'neutral',
};

function RfqMarketplacePage() {
  return <RfqMarketplaceContent />;
}

function RfqMarketplaceContent() {
  const { t } = useLocale();
  const { data: rfqs = [], isLoading, isError } = useOpenRfqsQuery();

  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const counts = useMemo(
    () => ({
      ALL: rfqs.length,
      OPEN: rfqs.filter((r) => r.status === 'OPEN').length,
      EVALUATION: rfqs.filter((r) => r.status === 'EVALUATION').length,
      AWARDED: rfqs.filter((r) => r.status === 'AWARDED').length,
    }),
    [rfqs]
  );

  const filtered = useMemo(() => {
    const s = searchQuery.toLowerCase().trim();
    return rfqs.filter((r) => {
      const matchesStatus = selectedStatus === 'ALL' || r.status === selectedStatus;
      if (!matchesStatus) return false;
      if (!s) return true;
      return (
        r.title.toLowerCase().includes(s) ||
        r.rfqNumber.toLowerCase().includes(s) ||
        r.category.toLowerCase().includes(s) ||
        r.issuerName.toLowerCase().includes(s)
      );
    });
  }, [rfqs, selectedStatus, searchQuery]);

  const hasFilters = selectedStatus !== 'ALL' || searchQuery.length > 0;
  const clearAll = () => {
    setSelectedStatus('ALL');
    setSearchQuery('');
  };

  const statusLabelKey: Record<RfqItem['status'], TranslationPath> = {
    DRAFT: 'supplier.bids.status.DRAFT',
    OPEN: 'supplier.bids.status.OPEN',
    EVALUATION: 'supplier.bids.status.EVALUATION',
    AWARDED: 'supplier.bids.status.AWARDED',
    CLOSED: 'supplier.bids.status.CLOSED',
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto min-w-0">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Gavel className="h-5 w-5 text-primary" aria-hidden="true" />
            {t('supplier.bids.title')}
          </span>
        }
        subtitle={t('supplier.bids.subtitle')}
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="flex items-center gap-1 bg-card p-1 rounded-lg border border-border shadow-xs text-xs overflow-x-auto"
          role="group"
          aria-label={t('supplier.bids.filters.ariaLabel')}
        >
          {STATUS_FILTERS.map((f) => {
            const isActive = selectedStatus === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedStatus(f.id)}
                aria-pressed={isActive}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <span>{t(f.labelKey)}</span>
                <span
                  className={`tabular-nums px-1.5 rounded text-[10px] font-bold ${
                    isActive
                      ? 'bg-primary-foreground/15 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {counts[f.id]}
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
              placeholder={t('supplier.bids.filters.searchPlaceholder')}
              aria-label={t('supplier.bids.filters.searchLabel')}
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
              {t('supplier.bids.filters.clearAll')}
            </Button>
          )}
        </div>
      </div>

      <Card className="border-border shadow-xs overflow-hidden bg-card">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[860px]">
            <caption className="sr-only">{t('supplier.bids.table.caption')}</caption>
            <thead className="bg-muted/40 border-b border-border text-muted-foreground whitespace-nowrap uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">{t('supplier.bids.table.rfq')}</th>
                <th className="py-3 px-4">{t('supplier.bids.table.title')}</th>
                <th className="py-3 px-4 text-right">{t('supplier.bids.table.items')}</th>
                <th className="py-3 px-4">{t('supplier.bids.table.deadline')}</th>
                <th className="py-3 px-4 text-right">{t('supplier.bids.table.budget')}</th>
                <th className="py-3 px-4">{t('supplier.bids.table.status')}</th>
                <th className="py-3 px-4 text-right">{t('supplier.bids.table.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border whitespace-nowrap">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                    {t('supplier.bids.loading')}
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={7}
                    role="alert"
                    className="py-12 text-center text-sm text-destructive"
                  >
                    {t('supplier.bids.error')}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                    {t('supplier.bids.empty')}
                  </td>
                </tr>
              ) : (
                filtered.map((rfq) => {
                  const itemCount = rfq.items?.length ?? 1;
                  return (
                    <tr key={rfq.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-xs text-primary">
                        <span className="inline-flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-primary/10">{rfq.rfqNumber}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-[320px]">
                        <Link
                          to="/supplier/bids/$rfqId/submit"
                          params={{ rfqId: rfq.id }}
                          className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                        >
                          {rfq.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                          <Badge variant="outline" className="text-[10px] font-mono font-semibold">
                            {rfq.category}
                          </Badge>
                          <span>·</span>
                          <span className="truncate">{rfq.issuerName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-semibold text-foreground">
                        {itemCount}
                      </td>
                      <td className="py-3 px-4">
                        <DeadlineCell deadline={rfq.deadline} t={t} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <MoneyDisplay amount={rfq.targetBudget} variant="inline" emphasize />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge
                          tone={RFQ_STATUS_TONE[rfq.status]}
                          label={t(statusLabelKey[rfq.status])}
                          size="sm"
                        />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {rfq.bids.length > 0 && (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-semibold gap-1"
                              aria-label={t('supplier.bids.actions.viewBidsAria', {
                                number: rfq.rfqNumber,
                              })}
                            >
                              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                              {rfq.bids.length}
                            </Badge>
                          )}
                          {rfq.status !== 'AWARDED' && rfq.status !== 'CLOSED' ? (
                            <Link
                              to="/supplier/bids/$rfqId/submit"
                              params={{ rfqId: rfq.id }}
                              aria-label={t('supplier.bids.actions.submitBidAria', {
                                number: rfq.rfqNumber,
                              })}
                            >
                              <Button
                                size="xs"
                                className="gap-1.5 shadow-xs font-semibold"
                              >
                                <Send className="h-3 w-3" aria-hidden="true" />
                                {t('supplier.bids.actions.submitBid')}
                              </Button>
                            </Link>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-[10px] gap-1 border-primary/30 bg-primary/5 text-primary"
                            >
                              <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                              {t('supplier.bids.award.slaVerified')}
                            </Badge>
                          )}
                        </div>
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

function DeadlineCell({ deadline, t }: { deadline: string; t: (key: TranslationPath, opts?: Record<string, unknown>) => string }) {
  const date = new Date(deadline);
  const today = new Date();
  const diffMs = date.getTime() - today.setHours(0, 0, 0, 0);
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const tone: StatusTone =
    diffDays < 0 ? 'danger' : diffDays <= 2 ? 'warning' : 'neutral';
  const label =
    diffDays < 0
      ? t('supplier.bids.urgency.overdue')
      : diffDays === 0
      ? t('supplier.bids.urgency.today')
      : t('supplier.bids.urgency.days', { count: diffDays });
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-xs text-foreground">{deadline}</span>
      <StatusBadge tone={tone} label={label} size="sm" />
    </div>
  );
}

export default RfqMarketplacePage;