import { createFileRoute } from '@tanstack/react-router';
import { FileText, Building2, Printer } from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useLocale } from '@/hooks/useLocale';

export const Route = createFileRoute('/buyer/contracts')({
    component: BuyerContractsPage,
    staticData: { crumb: { label: 'nav.buyer.contracts' } },
});

interface FrameworkContract {
    id: string;
    contractNumber: string;
    supplierName: string;
    supplierNip: string;
    productCategory: string;
    volumeCommittedUnits: number;
    volumeFulfilledUnits: number;
    contractDiscountPercent: number;
    validFrom: string;
    validTo: string;
    slaMaxLeadTimeDays: number;
    slaPenaltyPerDayPercent: number;
    status: 'ACTIVE' | 'PENDING_RENEWAL' | 'COMPLETED';
}

const CONTRACTS_DATA: FrameworkContract[] = [
    {
        id: 'cntr-01',
        contractNumber: 'B2B-SLA-2026-0019',
        supplierName: 'Drewnex Palety Sp. z o.o.',
        supplierNip: '7822910483',
        productCategory: 'Packaging & Cargo Units (EPAL)',
        volumeCommittedUnits: 10000,
        volumeFulfilledUnits: 7500,
        contractDiscountPercent: 18.5,
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
        slaMaxLeadTimeDays: 2,
        slaPenaltyPerDayPercent: 0.5,
        status: 'ACTIVE',
    },
    {
        id: 'cntr-02',
        contractNumber: 'B2B-SLA-2026-0044',
        supplierName: 'PlastChem Industrial Sp. k.',
        supplierNip: '8942019485',
        productCategory: 'Stretch Film & Packaging Supplies',
        volumeCommittedUnits: 2500,
        volumeFulfilledUnits: 2350,
        contractDiscountPercent: 15.0,
        validFrom: '2026-03-01',
        validTo: '2026-09-30',
        slaMaxLeadTimeDays: 3,
        slaPenaltyPerDayPercent: 0.75,
        status: 'PENDING_RENEWAL',
    },
];

const STATUS_META: Record<FrameworkContract['status'], { tone: 'success' | 'warning' | 'neutral'; labelKey: string }> = {
    ACTIVE:          { tone: 'success', labelKey: 'buyer.contracts.status.active' },
    PENDING_RENEWAL: { tone: 'warning', labelKey: 'buyer.contracts.status.pendingRenewal' },
    COMPLETED:       { tone: 'neutral', labelKey: 'buyer.contracts.status.completed' },
};

function BuyerContractsPage() {
    const { t } = useLocale();
    const contracts = CONTRACTS_DATA;

    return (
        <div className="space-y-6 max-w-7xl mx-auto min-w-0">
            <PageHeader
                title={
                    <span className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        {t('buyer.pageTitle.contracts')}
                    </span>
                }
                subtitle={t('buyer.pageTitle.contractsSubtitle')}
            />

            <p
                role="status"
                className="border-l-2 border-amber-500 pl-3 py-1 text-sm text-muted-foreground"
            >
                {t('buyer.contracts.demoNotice')}
            </p>

            <div className="space-y-6">
                {contracts.map((c) => {
                    const fulfillmentProgress = Math.round((c.volumeFulfilledUnits / c.volumeCommittedUnits) * 100);
                    const meta = STATUS_META[c.status];
                    return (
                        <Card key={c.id} className="border-border shadow-2xs overflow-hidden bg-card">
                            <CardHeader className="bg-muted/40 border-b border-border py-3 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <Building2 className="h-5 w-5 text-primary shrink-0" />
                                    <div className="min-w-0">
                                        <span className="font-mono text-xs font-bold text-muted-foreground block">
                                            {c.contractNumber}
                                        </span>
                                        <h3 className="text-base font-semibold text-foreground truncate">
                                            {c.supplierName}
                                        </h3>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <StatusBadge tone={meta.tone} label={t(meta.labelKey as any)} />
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="gap-1 h-8"
                                        onClick={() => window.print()}
                                    >
                                        <Printer className="h-3.5 w-3.5" />
                                        {t('buyer.contracts.print')}
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-semibold text-foreground">
                                            {t('buyer.contracts.volumeProgress', {
                                                target: c.volumeCommittedUnits.toLocaleString('pl-PL'),
                                                unit: t('buyer.contracts.units'),
                                            })}
                                        </span>
                                        <span className="font-mono font-bold text-primary">
                                            {c.volumeFulfilledUnits.toLocaleString('pl-PL')} {t('buyer.contracts.units')} ({fulfillmentProgress}%)
                                        </span>
                                    </div>

                                    <div
                                        className="w-full bg-muted rounded-full h-3 overflow-hidden"
                                        role="progressbar"
                                        aria-valuenow={fulfillmentProgress}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                    >
                                        <div
                                            className="bg-primary h-full rounded-full transition-all duration-500"
                                            style={{ width: `${fulfillmentProgress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/40 p-4 rounded-xl border border-border text-xs">
                                    <Term
                                        label={t('buyer.contracts.discount')}
                                        value={`-${c.contractDiscountPercent}% ${t('buyer.contracts.discountOf')}`}
                                        tone="success"
                                    />
                                    <Term
                                        label={t('buyer.contracts.slaLeadTime')}
                                        value={t('buyer.contracts.leadTimeMax', {
                                            days: c.slaMaxLeadTimeDays,
                                        })}
                                    />
                                    <Term
                                        label={t('buyer.contracts.slaPenalty')}
                                        value={t('buyer.contracts.penaltyPerDay', {
                                            percent: c.slaPenaltyPerDayPercent,
                                        })}
                                        tone="warning"
                                    />
                                    <Term
                                        label={t('buyer.contracts.validity')}
                                        value={`${c.validFrom} → ${c.validTo}`}
                                        tone="muted"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

function Term({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'success' | 'warning' | 'muted' }) {
    const valueClass =
        tone === 'success'
            ? 'font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm'
            : tone === 'warning'
                ? 'font-semibold text-amber-600 dark:text-amber-400'
                : tone === 'muted'
                    ? 'font-mono text-muted-foreground'
                    : 'font-semibold text-foreground';
    return (
        <div>
            <span className="text-muted-foreground block">{label}</span>
            <span className={valueClass}>{value}</span>
        </div>
    );
}

export default BuyerContractsPage;