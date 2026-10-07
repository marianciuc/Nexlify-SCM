import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, Check, LoaderCircle, Trophy } from 'lucide-react';
import { useState } from 'react';

import { MoneyDisplay } from '@/components/money-display';
import { StatusBadge } from '@/components/status-badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';
import { useAwardBidMutation, useRfqDetailQuery } from '@/hooks/useScmQueries';

const RFQ_STATUS_META = {
    DRAFT:      { tone: 'neutral' as const, labelKey: 'buyer.requests.status.DRAFT' },
    OPEN:       { tone: 'success' as const, labelKey: 'buyer.requests.status.OPEN' },
    EVALUATION: { tone: 'info'    as const, labelKey: 'buyer.requests.status.EVALUATION' },
    AWARDED:    { tone: 'success' as const, labelKey: 'buyer.requests.status.AWARDED' },
    CLOSED:     { tone: 'neutral' as const, labelKey: 'buyer.requests.status.CLOSED' },
};

const BID_STATUS_META = {
    PENDING:    { tone: 'warning' as const, labelKey: 'buyer.requests.bidStatus.PENDING' },
    ACCEPTED:   { tone: 'success' as const, labelKey: 'buyer.requests.bidStatus.ACCEPTED' },
    REJECTED:   { tone: 'danger'  as const, labelKey: 'buyer.requests.bidStatus.REJECTED' },
};

export const Route = createFileRoute('/buyer/requests/$requestId')({
    component: RfqTenderDetailPage,
    staticData: { crumb: { label: 'buyer.requests.detail.crumb' } },
});

function RfqTenderDetailPage() {
    const { t } = useLocale();
    const { requestId } = Route.useParams();
    const { data: rfq, isLoading, isError } = useRfqDetailQuery(requestId);
    const awardMutation = useAwardBidMutation();
    const [bidToAward, setBidToAward] = useState<string | null>(null);

    if (isLoading)
        return (
            <main className="mx-auto max-w-6xl p-6 text-sm text-muted-foreground" role="status">
                {t('buyer.requests.loading')}
            </main>
        );
    if (isError)
        return (
            <main className="mx-auto max-w-6xl p-6" role="alert">
                <h1 className="text-lg font-semibold">{t('buyer.requests.errorTitle')}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{t('buyer.requests.errorDesc')}</p>
                <Button className="mt-4" onClick={() => window.location.reload()}>
                    {t('buyer.requests.retry')}
                </Button>
            </main>
        );
    if (!rfq)
        return (
            <main className="mx-auto max-w-6xl p-6">
                <h1 className="text-lg font-semibold">{t('buyer.requests.detail.notFound')}</h1>
                <Link
                    className="mt-3 inline-flex text-sm text-primary underline"
                    to="/buyer/requests"
                >
                    {t('buyer.requests.detail.backToList')}
                </Link>
            </main>
        );

    const canAward = rfq.status === 'OPEN' || rfq.status === 'EVALUATION';
    const bid = rfq.bids.find((item) => item.id === bidToAward);
    const rfqMeta = RFQ_STATUS_META[rfq.status as keyof typeof RFQ_STATUS_META] ?? RFQ_STATUS_META.DRAFT;
    const locale = document.documentElement.lang === 'ru' ? 'ru-RU' : 'en-GB';
    const qty = (n: number, unit: string) => `${new Intl.NumberFormat(locale).format(n)}${unit ? ' ' + unit : ''}`;
    const supplierLabel = (name?: string) => name?.trim() || t('buyer.requests.detail.supplierFallback');

    return (
        <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 min-w-0">
            <Link
                to="/buyer/requests"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="h-4 w-4" />
                {t('buyer.requests.detail.backToList')}
            </Link>

            <header className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-semibold tracking-tight">{rfq.title}</h1>
                    <StatusBadge tone={rfqMeta.tone} label={t(rfqMeta.labelKey as any)} />
                </div>
                <p className="text-sm text-muted-foreground">
                    {rfq.rfqNumber} · {rfq.category || t('buyer.requests.detail.noCategory')} ·{' '}
                    {t('buyer.requests.detail.bidsCount', { count: rfq.bids.length })}
                </p>
                {rfq.description && <p className="max-w-3xl text-sm">{rfq.description}</p>}
            </header>

            <section
                aria-labelledby="rfq-summary"
                className="grid gap-4 border-y py-4 text-sm sm:grid-cols-3"
            >
                <h2 id="rfq-summary" className="sr-only">
                    {t('buyer.requests.detail.summaryHeading')}
                </h2>
                <div>
                    <div className="text-muted-foreground">{t('buyer.requests.detail.budget')}</div>
                    <div className="mt-1 font-medium">
                        {rfq.targetBudget > 0 ? (
                            <MoneyDisplay amount={rfq.targetBudget} variant="currency" emphasize />
                        ) : (
                            t('common.cancel') === t('common.cancel')
                                ? t('buyer.requests.detail.notSpecified')
                                : t('buyer.requests.detail.notSpecified')
                        )}
                    </div>
                </div>
                <div>
                    <div className="text-muted-foreground">{t('buyer.requests.detail.deliveryAddress')}</div>
                    <div className="mt-1 font-medium">
                        {rfq.deliveryLocation || t('buyer.requests.detail.notSpecified')}
                    </div>
                </div>
                <div>
                    <div className="text-muted-foreground">{t('buyer.requests.detail.deadline')}</div>
                    <div className="mt-1 font-medium">
                        {rfq.deadline
                            ? new Date(rfq.deadline).toLocaleString(locale)
                            : t('buyer.requests.detail.notSpecified')}
                    </div>
                </div>
            </section>

            <section aria-labelledby="items-heading" className="space-y-3">
                <h2 id="items-heading" className="text-base font-semibold">
                    {t('buyer.requests.detail.itemsHeading', { count: rfq.items?.length ?? 0 })}
                </h2>
                {!rfq.items?.length ? (
                    <p className="text-sm text-muted-foreground">{t('buyer.requests.detail.noSpec')}</p>
                ) : (
                    <div className="overflow-x-auto rounded-md border">
                        <table className="w-full min-w-[640px] text-left text-sm">
                            <caption className="sr-only">
                                {t('buyer.requests.detail.itemsHeading', { count: rfq.items.length })}
                            </caption>
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="px-3 py-2 font-medium">{t('buyer.requests.detail.itemCol')}</th>
                                    <th className="px-3 py-2 font-medium">SKU</th>
                                    <th className="px-3 py-2 text-right font-medium">
                                        {t('buyer.requests.detail.qtyCol')}
                                    </th>
                                    <th className="px-3 py-2 font-medium">
                                        {t('buyer.requests.detail.substitutesCol')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {rfq.items.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-3 py-3">
                                            <div className="font-medium">{item.name}</div>
                                            {item.description && (
                                                <div className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">
                                                    {item.description}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-3 py-3 font-mono text-xs">{item.sku || '—'}</td>
                                        <td className="px-3 py-3 text-right tabular-nums">
                                            {qty(item.quantity, item.unit)}
                                        </td>
                                        <td className="px-3 py-3">
                                            {item.allowSubstitute
                                                ? t('buyer.requests.detail.substitutesAllowed')
                                                : t('buyer.requests.detail.substitutesNotAllowed')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section aria-labelledby="bids-heading" className="space-y-3">
                <h2 id="bids-heading" className="text-base font-semibold">
                    {t('buyer.requests.detail.bidsHeading', { count: rfq.bids.length })}
                </h2>
                {rfq.bids.length === 0 ? (
                    <p className="border-y py-8 text-center text-sm text-muted-foreground">
                        {t('buyer.requests.detail.noBidsYet')}
                    </p>
                ) : (
                    <div className="overflow-x-auto rounded-md border">
                        <table className="w-full min-w-[640px] text-left text-sm">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="px-3 py-2 font-medium">{t('buyer.requests.detail.supplierCol')}</th>
                                    <th className="px-3 py-2 text-right font-medium">
                                        {t('buyer.requests.detail.amountCol')}
                                    </th>
                                    <th className="px-3 py-2 font-medium">{t('buyer.requests.detail.leadTimeCol')}</th>
                                    <th className="px-3 py-2 font-medium">
                                        {t('buyer.requests.detail.paymentTermsCol')}
                                    </th>
                                    <th className="px-3 py-2 font-medium">{t('buyer.requests.detail.statusCol')}</th>
                                    <th className="px-3 py-2" />
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {rfq.bids.map((item) => {
                                    const meta = BID_STATUS_META[item.status as keyof typeof BID_STATUS_META];
                                    return (
                                        <tr key={item.id}>
                                            <td className="px-3 py-3">
                                                <div className="font-medium">{supplierLabel(item.supplierName)}</div>
                                                {item.notes && (
                                                    <p className="mt-1 max-w-sm whitespace-pre-wrap text-xs text-muted-foreground">
                                                        {item.notes}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                <MoneyDisplay amount={item.bidAmount} variant="currency" emphasize />
                                            </td>
                                            <td className="px-3 py-3">
                                                {item.leadTimeDays
                                                    ? t('buyer.requests.detail.leadTimeDays', { days: item.leadTimeDays })
                                                    : '—'}
                                            </td>
                                            <td className="px-3 py-3">{item.warrantyTerms || '—'}</td>
                                            <td className="px-3 py-3">
                                                {meta ? (
                                                    <StatusBadge
                                                        tone={meta.tone}
                                                        label={t(meta.labelKey as any)}
                                                        size="sm"
                                                    />
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">{item.status}</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                {canAward && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setBidToAward(item.id)}
                                                        disabled={awardMutation.isPending}
                                                    >
                                                        <Trophy className="mr-1.5 h-4 w-4" />
                                                        {t('buyer.requests.detail.award')}
                                                    </Button>
                                                )}
                                                {rfq.status === 'AWARDED' && item.status === 'ACCEPTED' && (
                                                    <span className="inline-flex items-center gap-1 text-emerald-700">
                                                        <Check className="h-4 w-4" />
                                                        {t('buyer.requests.detail.awarded')}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section aria-labelledby="bid-lines-heading" className="space-y-3">
                <h2 id="bid-lines-heading" className="text-base font-semibold">
                    {t('buyer.requests.detail.pricesByItem')}
                </h2>
                {rfq.bids.map((proposal) => (
                    <div key={proposal.id} className="rounded-md border p-3">
                        <h3 className="font-medium">{supplierLabel(proposal.supplierName)}</h3>
                        {proposal.items?.length ? (
                            <div className="mt-2 divide-y">
                                {proposal.items.map((line) => (
                                    <div
                                        key={line.id}
                                        className="flex flex-wrap justify-between gap-2 py-2 text-sm"
                                    >
                                        <span>
                                            {line.productName ||
                                                line.offeredSku ||
                                                t('buyer.requests.detail.itemFallback')}
                                            {line.isAlternative
                                                ? ` · ${t('buyer.requests.detail.alternative')}`
                                                : ''}
                                        </span>
                                        <span className="tabular-nums">
                                            {qty(Number(line.quantity), '')} ×{' '}
                                            <MoneyDisplay
                                                amount={Number(line.unitPrice)}
                                                variant="currency"
                                            />
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-1 text-sm text-muted-foreground">
                                {t('buyer.requests.detail.noLineBreakdown')}
                            </p>
                        )}
                    </div>
                ))}
            </section>

            <AlertDialog open={Boolean(bidToAward)} onOpenChange={(open) => !open && setBidToAward(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('buyer.requests.detail.awardConfirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('buyer.requests.detail.awardConfirmDesc', {
                                supplier: supplierLabel(bid?.supplierName),
                                amount: bid ? bid.bidAmount.toLocaleString(locale, { minimumFractionDigits: 2 }) : '',
                                currency: bid?.currency ?? '',
                            })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={awardMutation.isPending}>
                            {t('common.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={awardMutation.isPending}
                            onClick={(event) => {
                                event.preventDefault();
                                if (!bidToAward) return;
                                awardMutation.mutate(
                                    { rfqId: rfq.id, bidId: bidToAward },
                                    { onSuccess: () => setBidToAward(null) }
                                );
                            }}
                        >
                            {awardMutation.isPending && (
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {t('buyer.requests.detail.awardConfirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {awardMutation.isError && (
                <p role="alert" className="text-sm text-destructive">
                    {t('buyer.requests.detail.awardError')} {awardMutation.error.message}
                </p>
            )}
        </main>
    );
}

export default RfqTenderDetailPage;