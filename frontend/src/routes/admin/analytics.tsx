import { createFileRoute } from '@tanstack/react-router';
import {
    BarChart3,
    TrendingUp,
    Clock,
    ShieldCheck,
    Truck,
    Layers,
    Warehouse,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/hooks/useLocale';
import { INITIAL_KPIS, useAnalyticsKpiQuery } from '@/hooks/useScmQueries';
import useEnvironmentStore from '@/service/env/environment-store';

export const Route = createFileRoute('/admin/analytics')({
    component: AnalyticsDashboardPage,
    staticData: {
        crumb: { label: 'nav.admin.analytics' },
    },
});

const OTIF_TRENDS = [
    { period: 'May 2026', otif: 96.2, onTime: 97.5, inFull: 98.1, delayed: 2.5 },
    { period: 'Jun 2026', otif: 97.1, onTime: 98.0, inFull: 98.8, delayed: 2.0 },
    { period: 'Jul 2026', otif: 96.8, onTime: 97.8, inFull: 98.4, delayed: 2.2 },
    { period: 'Aug 2026', otif: 98.0, onTime: 98.9, inFull: 99.1, delayed: 1.1 },
    { period: 'Sep 2026', otif: 98.4, onTime: 99.2, inFull: 99.2, delayed: 0.8 },
];

const CORRIDORS = [
    { corridor: 'Warszawa Hub → Katowice DC', avgDays: 1.2, benchmarkDays: 2.0, status: 'OPTIMAL', distanceKm: 295, loadFactor: 92 },
    { corridor: 'Szczecin Port → Warszawa Hub', avgDays: 2.4, benchmarkDays: 3.0, status: 'OPTIMAL', distanceKm: 565, loadFactor: 88 },
    { corridor: 'Gdańsk Terminal → Katowice DC', avgDays: 2.8, benchmarkDays: 3.5, status: 'OPTIMAL', distanceKm: 520, loadFactor: 85 },
    { corridor: 'Wrocław Depot → Poznań Hub', avgDays: 1.1, benchmarkDays: 1.5, status: 'OPTIMAL', distanceKm: 180, loadFactor: 94 },
    { corridor: 'Szczecin → Hamburg (cross-border)', avgDays: 3.1, benchmarkDays: 4.0, status: 'ATTENTION', distanceKm: 370, loadFactor: 79 },
];

const WAREHOUSES = [
    { warehouse: 'Warszawa Central Hub (DC-01)', turnoverRatio: 14.2, daysOnHand: 25.7 },
    { warehouse: 'Katowice Logistics Park (DC-02)', turnoverRatio: 18.5, daysOnHand: 19.7 },
    { warehouse: 'Szczecin Cross-dock Terminal (DC-03)', turnoverRatio: 22.1, daysOnHand: 16.5 },
    { warehouse: 'Gdańsk Reefer Cold Storage (DC-04)', turnoverRatio: 16.8, daysOnHand: 21.7 },
];

const CORRIDOR_TONE: Record<'OPTIMAL' | 'ATTENTION', 'success' | 'warning'> = {
    OPTIMAL: 'success',
    ATTENTION: 'warning',
};

function AnalyticsDashboardPage() {
    const { currentTenant } = useEnvironmentStore();
    const { data: kpis = INITIAL_KPIS, isFetching: loading, refetch } = useAnalyticsKpiQuery();
    const { t } = useLocale();

    const handleRefresh = async () => {
        await refetch();
        toast.success(t('admin.analytics.refreshed'));
    };

    const otifPct = kpis.otifRate;
    const leadPct = Math.min(100, (kpis.averageLeadTimeDays / kpis.leadTimeTargetDays) * 100);
    const throughputPct = kpis.fleetEfficiencyScore;
    const savingsPct = 78;

    return (
        <div className="space-y-6 max-w-7xl mx-auto min-w-0">
            <PageHeader
                title={
                    <span className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        {t('admin.analytics.title')}
                    </span>
                }
                subtitle={t('admin.analytics.subtitle', { tenant: currentTenant.name })}
                actions={
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={loading}
                        className="gap-2"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
                        <span>{t('admin.analytics.refresh')}</span>
                    </Button>
                }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <KpiCard
                    label={t('admin.analytics.otif')}
                    icon={<ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                    value={`${kpis.otifRate}%`}
                    tone="success"
                    delta={{
                        direction: 'up',
                        value: `+3.4% ${t('admin.analytics.toSlaTarget')}`,
                    }}
                    progress={{ value: otifPct, tone: 'success' }}
                />
                <KpiCard
                    label={t('admin.analytics.leadTime')}
                    icon={<Clock className="h-4 w-4 text-sky-600 dark:text-sky-400" />}
                    value={
                        <>
                            {kpis.averageLeadTimeDays}
                            <span className="text-base font-normal text-muted-foreground ml-1">{t('common.days')}</span>
                        </>
                    }
                    tone="info"
                    delta={{
                        direction: 'down',
                        value: `-0.7${t('admin.analytics.fasterThan')} (${kpis.leadTimeTargetDays}${t('common.days')})`,
                    }}
                    progress={{ value: leadPct, tone: 'info' }}
                />
                <KpiCard
                    label={t('admin.analytics.throughput')}
                    icon={<Truck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
                    value={
                        <>
                            {kpis.totalThroughputTons.toLocaleString('ru-RU')}
                            <span className="text-base font-normal text-muted-foreground ml-1">{t('common.tons')}</span>
                        </>
                    }
                    tone="indigo"
                    delta={{ direction: 'flat', value: `${kpis.activeRoutesCount} ${t('admin.analytics.activeCorridors')}` }}
                    progress={{ value: throughputPct, tone: 'indigo' }}
                />
                <KpiCard
                    label={t('admin.analytics.savings')}
                    icon={<TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
                    value={
                        <>
                            {kpis.costSavingsTotal.toLocaleString('ru-RU')}
                            <span className="text-base font-normal text-muted-foreground ml-1">{kpis.currency}</span>
                        </>
                    }
                    tone="purple"
                    delta={{ direction: 'flat', value: t('admin.analytics.vrpReverseAuctions') }}
                    progress={{ value: savingsPct, tone: 'purple' }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="border-border shadow-xs">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                            {t('admin.analytics.otifTrendTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <table className="w-full text-sm">
                            <caption className="sr-only">{t('admin.analytics.otifTrendTitle')}</caption>
                            <thead className="text-xs uppercase text-muted-foreground tracking-wider">
                                <tr>
                                    <th className="text-left py-1 font-semibold">{t('admin.analytics.trendPeriod')}</th>
                                    <th className="text-right py-1 font-semibold">{t('admin.analytics.trendOnTime')}</th>
                                    <th className="text-right py-1 font-semibold">{t('admin.analytics.trendInFull')}</th>
                                    <th className="text-right py-1 font-semibold">{t('admin.analytics.trendDelayed')}</th>
                                    <th className="text-right py-1 font-semibold">{t('admin.analytics.trendOtif')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {OTIF_TRENDS.map((row) => (
                                    <tr key={row.period} className="hover:bg-muted/40">
                                        <td className="py-2 font-semibold text-foreground">{row.period}</td>
                                        <td className="py-2 text-right tabular-nums">{row.onTime}%</td>
                                        <td className="py-2 text-right tabular-nums">{row.inFull}%</td>
                                        <td className="py-2 text-right tabular-nums text-rose-700 dark:text-rose-400">{row.delayed}%</td>
                                        <td className="py-2 text-right">
                                            <StatusBadge tone="success" label={`${row.otif}%`} size="sm" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                <Card className="border-border shadow-xs">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Truck className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                            {t('admin.analytics.corridorsTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-sm min-w-[640px]">
                            <caption className="sr-only">{t('admin.analytics.corridorsTitle')}</caption>
                            <thead className="bg-muted/40 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                                <tr>
                                    <th className="px-3 py-2 text-left font-semibold">{t('admin.analytics.corridor')}</th>
                                    <th className="px-3 py-2 text-right font-semibold">{t('admin.analytics.distance')}</th>
                                    <th className="px-3 py-2 text-right font-semibold">{t('admin.analytics.actual')}</th>
                                    <th className="px-3 py-2 text-right font-semibold">{t('admin.analytics.target')}</th>
                                    <th className="px-3 py-2 text-right font-semibold">{t('admin.analytics.load')}</th>
                                    <th className="px-3 py-2 text-right font-semibold">{t('common.status')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {CORRIDORS.map((c, idx) => (
                                    <tr key={idx} className="hover:bg-muted/40 transition-colors">
                                        <td className="px-3 py-2 font-medium text-foreground">{c.corridor}</td>
                                        <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{c.distanceKm} km</td>
                                        <td className="px-3 py-2 text-right tabular-nums font-semibold">{c.avgDays}d</td>
                                        <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{c.benchmarkDays}d</td>
                                        <td className="px-3 py-2 text-right tabular-nums font-semibold text-primary">{c.loadFactor}%</td>
                                        <td className="px-3 py-2 text-right">
                                            <StatusBadge
                                                tone={CORRIDOR_TONE[c.status as keyof typeof CORRIDOR_TONE]}
                                                label={c.status === 'OPTIMAL' ? t('admin.analytics.statusOptimal') : t('admin.analytics.statusAttention')}
                                                size="sm"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="border-border shadow-xs lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Layers className="h-4 w-4 text-purple-600" aria-hidden="true" />
                            {t('admin.analytics.abcTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <table className="w-full text-sm">
                            <caption className="sr-only">{t('admin.analytics.abcTitle')}</caption>
                            <thead className="bg-muted/40 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                                <tr>
                                    <th className="px-3 py-2 text-left font-semibold">{t('admin.analytics.abcClass')}</th>
                                    <th className="px-3 py-2 text-left font-semibold">{t('admin.analytics.abcProfile')}</th>
                                    <th className="px-3 py-2 text-right font-semibold">{t('admin.analytics.abcShare')}</th>
                                    <th className="px-3 py-2 text-left font-semibold">{t('admin.analytics.abcExamples')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                <tr>
                                    <td className="px-3 py-2"><Badge className="bg-sky-600 text-white font-bold">{t('admin.analytics.abcA')}</Badge></td>
                                    <td className="px-3 py-2 text-xs text-muted-foreground">{t('admin.analytics.abcADesc')}</td>
                                    <td className="px-3 py-2 text-right tabular-nums font-semibold text-sky-700 dark:text-sky-400">72.4%</td>
                                    <td className="px-3 py-2 text-xs font-mono text-muted-foreground">SKU-PAL-01, SKU-COL-09, SKU-STR-05</td>
                                </tr>
                                <tr>
                                    <td className="px-3 py-2"><Badge className="bg-indigo-600 text-white font-bold">{t('admin.analytics.abcB')}</Badge></td>
                                    <td className="px-3 py-2 text-xs text-muted-foreground">{t('admin.analytics.abcBDesc')}</td>
                                    <td className="px-3 py-2 text-right tabular-nums font-semibold text-indigo-700 dark:text-indigo-400">20.1%</td>
                                    <td className="px-3 py-2 text-xs font-mono text-muted-foreground">SKU-HYD-02, SKU-LBL-12</td>
                                </tr>
                                <tr>
                                    <td className="px-3 py-2"><Badge variant="outline" className="font-bold">{t('admin.analytics.abcC')}</Badge></td>
                                    <td className="px-3 py-2 text-xs text-muted-foreground">{t('admin.analytics.abcCDesc')}</td>
                                    <td className="px-3 py-2 text-right tabular-nums font-semibold text-muted-foreground">7.5%</td>
                                    <td className="px-3 py-2 text-xs font-mono text-muted-foreground">SKU-CRB-04, SKU-TAP-08</td>
                                </tr>
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                <Card className="border-border shadow-xs">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Warehouse className="h-4 w-4 text-cyan-600" aria-hidden="true" />
                            {t('admin.analytics.warehouseTurnover')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-sm min-w-[300px]">
                            <caption className="sr-only">{t('admin.analytics.warehouseTurnover')}</caption>
                            <thead className="bg-muted/40 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                                <tr>
                                    <th className="px-3 py-2 text-left font-semibold">{t('admin.analytics.warehouse')}</th>
                                    <th className="px-3 py-2 text-right font-semibold">{t('admin.analytics.turnover')}</th>
                                    <th className="px-3 py-2 text-right font-semibold">{t('admin.analytics.daysOnHand')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {WAREHOUSES.map((w) => (
                                    <tr key={w.warehouse} className="hover:bg-muted/40 transition-colors">
                                        <td className="px-3 py-2 font-medium text-foreground">{w.warehouse}</td>
                                        <td className="px-3 py-2 text-right tabular-nums font-semibold text-primary">{w.turnoverRatio}×</td>
                                        <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{w.daysOnHand}d</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

type Tone = 'success' | 'info' | 'indigo' | 'purple';

const TONE_BAR: Record<Tone, string> = {
    success: 'bg-emerald-500',
    info: 'bg-sky-500',
    indigo: 'bg-indigo-500',
    purple: 'bg-purple-500',
};

const TONE_DELTA: Record<'up' | 'down' | 'flat', string> = {
    up: 'text-emerald-700 dark:text-emerald-400',
    down: 'text-sky-700 dark:text-sky-400',
    flat: 'text-muted-foreground',
};

function KpiCard({
    label,
    icon,
    value,
    tone,
    delta,
    progress,
}: {
    label: string;
    icon: React.ReactNode;
    value: React.ReactNode;
    tone: Tone;
    delta: { direction: 'up' | 'down' | 'flat'; value: string };
    progress: { value: number; tone: Tone };
}) {
    return (
        <Card className="border-border shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {label}
                </CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-foreground tabular-nums">{value}</div>
                <div className={`flex items-center gap-1.5 text-xs mt-1 font-semibold ${TONE_DELTA[delta.direction]}`}>
                    {delta.direction === 'up' && <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />}
                    {delta.direction === 'down' && <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />}
                    <span>{delta.value}</span>
                </div>
                <div
                    className="w-full bg-muted h-1.5 rounded-full mt-3 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={Math.round(progress.value)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                >
                    <div className={`h-full rounded-full ${TONE_BAR[progress.tone]}`} style={{ width: `${progress.value}%` }} />
                </div>
            </CardContent>
        </Card>
    );
}

export default AnalyticsDashboardPage;