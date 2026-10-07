import { createFileRoute, Link } from '@tanstack/react-router';
import { FileQuestion, Plus, ArrowRight, Layers } from 'lucide-react';
import { useState } from 'react';

import { MoneyDisplay } from '@/components/money-display';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/hooks/useLocale';
import { useRfqsQuery } from '@/hooks/useScmQueries';
import useEnvironmentStore from '@/service/env/environment-store';

export const Route = createFileRoute('/buyer/requests')({
    component: BuyerRequestsPage,
    staticData: { crumb: { label: 'nav.buyer.rfq' } },
});

const RFQ_STATUS_META = {
    DRAFT:      { tone: 'neutral' as const, labelKey: 'buyer.requests.status.DRAFT' },
    OPEN:       { tone: 'success' as const, labelKey: 'buyer.requests.status.OPEN' },
    EVALUATION: { tone: 'info'    as const, labelKey: 'buyer.requests.status.EVALUATION' },
    AWARDED:    { tone: 'success' as const, labelKey: 'buyer.requests.status.AWARDED' },
    CLOSED:     { tone: 'neutral' as const, labelKey: 'buyer.requests.status.CLOSED' },
};

const FILTERS = ['ALL', 'OPEN', 'AWARDED'] as const;

function BuyerRequestsPage() {
    const { t } = useLocale();
    const { data: rfqs = [], isLoading, isError, refetch } = useRfqsQuery();
    const { isMockMode } = useEnvironmentStore();
    const [selectedStatus, setSelectedStatus] = useState<(typeof FILTERS)[number]>('ALL');

    const filteredRfqs = selectedStatus === 'ALL' ? rfqs : rfqs.filter((r) => r.status === selectedStatus);
    const activeCount = rfqs.filter((r) => r.status === 'OPEN').length;
    const underReviewCount = rfqs.filter((r) => r.bids && r.bids.length > 0 && r.status === 'OPEN').length;
    const awardedCount = rfqs.filter((r) => r.status === 'AWARDED').length;

    return (
        <div className="space-y-6 max-w-7xl mx-auto min-w-0">
            <PageHeader
                title={
                    <span className="flex items-center gap-2">
                        <FileQuestion className="h-5 w-5 text-primary" />
                        {t('buyer.pageTitle.rfq')}
                    </span>
                }
                subtitle={t('buyer.pageTitle.rfqSubtitle')}
                actions={
                    <Link to="/buyer/requests/new" className="w-full sm:w-auto">
                        <Button size="sm" className="gap-2 shadow-xs w-full sm:w-auto font-medium">
                            <Plus className="h-4 w-4" />
                            {t('buyer.requests.createCta')}
                        </Button>
                    </Link>
                }
            />

            {isMockMode && (
                <p
                    role="status"
                    className="border-l-2 border-amber-500 pl-3 text-sm text-muted-foreground"
                >
                    {t('buyer.requests.mockNotice')}
                </p>
            )}

            {isError ? (
                <section role="alert" className="rounded-md border p-6">
                    <h2 className="font-semibold">{t('buyer.requests.errorTitle')}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t('buyer.requests.errorDesc')}
                    </p>
                    <Button className="mt-3" variant="outline" onClick={() => refetch()}>
                        {t('common.cancel') === t('common.cancel') ? t('buyer.requests.retry') : t('buyer.requests.retry')}
                    </Button>
                </section>
            ) : isLoading ? (
                <p
                    className="py-8 text-center text-sm text-muted-foreground"
                    role="status"
                >
                    {t('buyer.requests.loading')}
                </p>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <KpiCard title={t('buyer.requests.kpi.open')} hint={t('buyer.requests.kpi.openHint')} value={activeCount} />
                        <KpiCard title={t('buyer.requests.kpi.review')} hint={t('buyer.requests.kpi.reviewHint')} value={underReviewCount} tone="primary" />
                        <KpiCard title={t('buyer.requests.kpi.awarded')} hint={t('buyer.requests.kpi.awardedHint')} value={awardedCount} />
                    </div>

                    <div className="flex items-center gap-1.5 bg-card p-1.5 rounded-lg border border-border shadow-2xs text-xs overflow-x-auto">
                        {FILTERS.map((id) => (
                            <button
                                key={id}
                                onClick={() => setSelectedStatus(id)}
                                className={`px-3 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap ${
                                    selectedStatus === id
                                        ? 'bg-primary text-primary-foreground shadow-2xs'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`}
                            >
                                {t(id === 'ALL' ? 'buyer.requests.filterAll' : `buyer.requests.status.${id}`)}
                            </button>
                        ))}
                    </div>

                    {filteredRfqs.length === 0 && (
                        <div className="border-y py-12 text-center">
                            <h2 className="font-semibold">
                                {rfqs.length
                                    ? t('buyer.requests.empty.filtered')
                                    : t('buyer.requests.empty.none')}
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {t('buyer.requests.empty.desc')}
                            </p>
                            {rfqs.length === 0 && (
                                <Link to="/buyer/requests/new" className="mt-4 inline-flex">
                                    <Button variant="outline">{t('buyer.requests.createCtaFirst')}</Button>
                                </Link>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRfqs.map((rfq) => {
                            const bidsCount = rfq.bids?.length || 0;
                            const statusMeta =
                                RFQ_STATUS_META[rfq.status as keyof typeof RFQ_STATUS_META] ??
                                RFQ_STATUS_META.DRAFT;
                            return (
                                <Card
                                    key={rfq.id}
                                    className="border-border hover:border-border/80 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between bg-card"
                                >
                                    <div>
                                        <CardHeader className="p-4 pb-2 border-b border-border/60">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground">
                                                    {rfq.rfqNumber}
                                                </span>
                                                <StatusBadge tone={statusMeta.tone} label={t(statusMeta.labelKey as any)} size="sm" />
                                            </div>
                                            <CardTitle className="text-base font-semibold mt-2 line-clamp-1">
                                                {rfq.title}
                                            </CardTitle>
                                            <div className="text-[11px] text-muted-foreground">{rfq.category}</div>
                                        </CardHeader>

                                        <CardContent className="p-4 space-y-3 text-xs">
                                            <p className="text-muted-foreground line-clamp-2">{rfq.description}</p>

                                            <div className="bg-muted/40 p-2.5 rounded-lg border border-border/60 space-y-1">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">
                                                        {t('buyer.requests.targetBudget')}
                                                    </span>
                                                    <MoneyDisplay
                                                        amount={rfq.targetBudget}
                                                        variant="inline"
                                                        emphasize
                                                    />
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">
                                                        {t('buyer.requests.itemsCount')}
                                                    </span>
                                                    <span className="font-semibold text-foreground">
                                                        {t('buyer.requests.itemsCountValue', {
                                                            count: rfq.items?.length ?? 0,
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">
                                                        {t('buyer.requests.deadline')}
                                                    </span>
                                                    <span className="font-medium text-amber-600 dark:text-amber-400">
                                                        {rfq.deadline}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-1">
                                                <span className="text-muted-foreground flex items-center gap-1">
                                                    <Layers className="h-3.5 w-3.5 text-primary" />
                                                    <strong>{bidsCount}</strong> {t('buyer.requests.bidsReceived')}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {rfq.deadline
                                                        ? new Date(rfq.deadline).toLocaleDateString(
                                                              document.documentElement.lang === 'ru' ? 'ru-RU' : 'en-GB'
                                                          )
                                                        : t('buyer.requests.deadlineNotSet')}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </div>

                                    <div className="p-4 pt-0 border-t border-border/60 mt-2">
                                        <Link to="/buyer/requests/$requestId" params={{ requestId: rfq.id }}>
                                            <Button size="sm" className="w-full gap-1.5 shadow-xs font-medium">
                                                <span>{t('buyer.requests.evaluateBids', { count: bidsCount })}</span>
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </Button>
                                        </Link>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

function KpiCard({
    title,
    hint,
    value,
    tone = 'default',
}: {
    title: string;
    hint: string;
    value: number;
    tone?: 'default' | 'primary';
}) {
    const valueClass = tone === 'primary' ? 'text-primary' : 'text-foreground';
    return (
        <Card className="border-border shadow-2xs bg-card">
            <CardHeader className="py-3 px-4">
                <CardTitle className="text-xs uppercase font-semibold text-muted-foreground">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
                <div className={`text-2xl font-bold tabular-nums font-mono ${valueClass}`}>{value}</div>
                <p className="text-xs text-muted-foreground mt-1">{hint}</p>
            </CardContent>
        </Card>
    );
}

export default BuyerRequestsPage;