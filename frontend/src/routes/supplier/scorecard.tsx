import { createFileRoute } from '@tanstack/react-router';
import { Award } from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { useLocale } from '@/hooks/useLocale';

export const Route = createFileRoute('/supplier/scorecard')({
    component: SupplierScorecardPage,
    staticData: { crumb: { label: 'nav.supplier.scorecard' } },
});

const FACTORS: { id: 'otif' | 'quality' | 'price' | 'leadTime'; weight: number; score: number; threshold: number; helper: 'avgDispatch' | 'zeroCriticalRma' | 'competitive' | 'leadTimeDays'; value: string }[] = [
    { id: 'otif', weight: 40, score: 98.4, threshold: 95.0, helper: 'avgDispatch', value: '1.2d' },
    { id: 'quality', weight: 30, score: 99.2, threshold: 0, helper: 'zeroCriticalRma', value: '0' },
    { id: 'price', weight: 20, score: 96.8, threshold: 0, helper: 'competitive', value: 'top 5%' },
    { id: 'leadTime', weight: 10, score: 99.5, threshold: 0, helper: 'leadTimeDays', value: '1.2' },
];

function SupplierScorecardPage() {
    const { t } = useLocale();
    const compositeScore = 98.4;
    const deliveries = 420;
    const period = 'Q3';

    return (
        <div className="space-y-6 max-w-5xl mx-auto min-w-0">
            <PageHeader
                title={
                    <span className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" aria-hidden="true" />
                        {t('supplier.scorecard.title')}
                    </span>
                }
                subtitle={t('supplier.scorecard.subtitle')}
                actions={
                    <StatusBadge tone="success" label={`${compositeScore}/100 · ${t('supplier.scorecard.tierGold')}`} size="md" />
                }
            />

            <div className="rounded-md border border-border bg-card p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {t('supplier.scorecard.compositeLabel')}
                        </p>
                        <div className="mt-1 flex items-baseline gap-3">
                            <span className="text-4xl font-bold tabular-nums text-foreground">{compositeScore}</span>
                            <span className="text-base font-medium text-muted-foreground">/ 100</span>
                            <StatusBadge tone="success" label={t('supplier.scorecard.top5Percent')} size="sm" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            {t('supplier.scorecard.basis', { count: deliveries, period })}
                        </p>
                    </div>
                    <ProgressBar value={compositeScore} className="w-full sm:w-64 h-2" />
                </div>
            </div>

            <section>
                <h2 className="text-sm font-semibold text-foreground mb-3">
                    {t('supplier.scorecard.factorsTitle')}
                </h2>
                <div className="rounded-md border border-border bg-card shadow-xs overflow-x-auto">
                    <table className="w-full text-sm min-w-[560px]">
                        <caption className="sr-only">{t('supplier.scorecard.factorsTitle')}</caption>
                        <thead className="bg-muted/30 border-b border-border text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="py-2.5 px-4 text-left">{t('supplier.scorecard.factorCol')}</th>
                                <th className="py-2.5 px-4 text-right">{t('supplier.scorecard.weight')}</th>
                                <th className="py-2.5 px-4 text-left">{t('supplier.scorecard.score')}</th>
                                <th className="py-2.5 px-4 text-left">{t('supplier.scorecard.detail')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {FACTORS.map((f, idx) => (
                                <tr key={f.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="py-2.5 px-4 font-medium text-foreground">
                                        {idx + 1}. {t(`supplier.scorecard.factor.${f.id}`)}
                                    </td>
                                    <td className="py-2.5 px-4 text-right tabular-nums text-muted-foreground font-mono">
                                        {f.weight}%
                                    </td>
                                    <td className="py-2.5 px-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold tabular-nums text-foreground">
                                                {f.score}%
                                            </span>
                                            <div
                                                className="flex-1 max-w-[120px] h-1.5 bg-muted rounded-full overflow-hidden"
                                                role="progressbar"
                                                aria-valuenow={f.score}
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                >
                                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${f.score}%` }} />
                                            </div>
                                            {f.threshold > 0 && (
                                                <span className="text-xs text-muted-foreground">
                                                    {t('supplier.scorecard.threshold')}: {f.threshold}%
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-4 text-xs text-muted-foreground">
                                        {t(`supplier.scorecard.helper.${f.helper}`, { value: f.value })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

function ProgressBar({ value, className }: { value: number; className?: string }) {
    return (
        <div
            className={`bg-muted rounded-full overflow-hidden ${className ?? ''}`}
            role="progressbar"
            aria-valuenow={Math.round(value)}
            aria-valuemin={0}
            aria-valuemax={100}
        >
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${value}%` }} />
        </div>
    );
}

export default SupplierScorecardPage;