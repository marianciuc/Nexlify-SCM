import { createFileRoute, Link } from '@tanstack/react-router';
import { Receipt } from 'lucide-react';

import { MoneyDisplay } from '@/components/money-display';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/hooks/useLocale';
import { useInvoicesQuery } from '@/hooks/useScmQueries';

export const Route = createFileRoute('/buyer/invoices/')({
    component: BillingPage,
});

type InvoicePaymentStatus = 'PAID' | 'UNPAID' | 'OVERDUE' | 'UNKNOWN';

const PAYMENT_TONE: Record<InvoicePaymentStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
    PAID: 'success',
    UNPAID: 'warning',
    OVERDUE: 'danger',
    UNKNOWN: 'neutral',
};

const PAYMENT_LABEL_KEY: Record<InvoicePaymentStatus, string> = {
    PAID: 'buyer.invoices.paid',
    UNPAID: 'buyer.invoices.unpaid',
    OVERDUE: 'buyer.invoices.overdue',
    UNKNOWN: 'buyer.invoices.unknown',
};

function BillingPage() {
    const { t } = useLocale();
    const { data: invoices = [], isLoading, isError } = useInvoicesQuery();

    const totalNet = invoices.reduce((acc, inv) => acc + inv.netAmount, 0);
    const totalGross = invoices.reduce((acc, inv) => acc + inv.grossAmount, 0);
    const totalVat = invoices.reduce((acc, inv) => acc + inv.vatAmount, 0);

    return (
        <div className="space-y-6 max-w-7xl mx-auto min-w-0">
            <PageHeader
                title={
                    <span className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-primary" />
                        {t('buyer.pageTitle.invoices')}
                    </span>
                }
                subtitle={t('buyer.pageTitle.invoicesSubtitle')}
            />

            <div className="grid gap-4 md:grid-cols-3">
                <KpiCard
                    title={t('buyer.invoices.netAmount')}
                    hint={t('buyer.invoices.netHint')}
                    amount={totalNet}
                    tone="default"
                />
                <KpiCard
                    title={t('buyer.invoices.vatAmount')}
                    hint={t('buyer.invoices.vatHint')}
                    amount={totalVat}
                    tone="success"
                />
                <KpiCard
                    title={t('buyer.invoices.grossDebt')}
                    hint={t('buyer.invoices.grossHint')}
                    amount={totalGross}
                    tone="primary"
                />
            </div>

            <Card className="border-border shadow-2xs bg-card overflow-hidden">
                <CardHeader className="pb-3 border-b border-border">
                    <CardTitle className="text-base font-bold">
                        {t('buyer.invoices.issuedInvoices')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-xs text-left min-w-[750px] whitespace-nowrap">
                        <caption className="sr-only">{t('buyer.invoices.issuedInvoices')}</caption>
                        <thead className="text-[11px] uppercase bg-muted/40 text-muted-foreground font-semibold border-b border-border tracking-wider">
                            <tr>
                                <th className="px-4 py-3 font-semibold">{t('buyer.invoices.table.number')}</th>
                                <th className="px-4 py-3 font-semibold">{t('buyer.invoices.table.buyer')}</th>
                                <th className="px-4 py-3 font-semibold text-right">{t('buyer.invoices.table.net')}</th>
                                <th className="px-4 py-3 font-semibold text-right">{t('buyer.invoices.table.vat')}</th>
                                <th className="px-4 py-3 font-semibold text-right">{t('buyer.invoices.table.gross')}</th>
                                <th className="px-4 py-3 font-semibold">{t('buyer.invoices.table.dueDate')}</th>
                                <th className="px-4 py-3 font-semibold">{t('buyer.invoices.table.status')}</th>
                                <th className="px-4 py-3 font-semibold text-right">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground" role="status">
                                        {t('common.loading')}
                                    </td>
                                </tr>
                            ) : isError ? (
                                <tr>
                                    <td colSpan={8} role="alert" className="px-4 py-10 text-center text-destructive">
                                        {t('common.error')}
                                    </td>
                                </tr>
                            ) : invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                                        {t('buyer.invoices.empty')}
                                    </td>
                                </tr>
                            ) : (
                                invoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3 font-mono font-bold text-xs">
                                            <Link
                                                to="/buyer/invoices/$invoiceId"
                                                params={{ invoiceId: inv.id }}
                                                className="hover:underline text-primary"
                                            >
                                                {inv.invoiceNumber}
                                            </Link>
                                            <div className="text-[10px] text-muted-foreground font-normal font-sans">
                                                {inv.orderNumber}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-foreground">
                                            {inv.buyerName}
                                            <div className="text-xs text-muted-foreground font-mono">NIP: {inv.buyerNip}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <MoneyDisplay amount={inv.netAmount} variant="inline" className="text-foreground font-medium" />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <MoneyDisplay amount={inv.vatAmount} variant="inline" className="text-muted-foreground" />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <MoneyDisplay amount={inv.grossAmount} variant="inline" emphasize />
                                        </td>
                                        <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                                            {inv.dueDate}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge
                                                tone={PAYMENT_TONE[inv.paymentStatus as InvoicePaymentStatus] ?? 'neutral'}
                                                label={t((PAYMENT_LABEL_KEY[inv.paymentStatus as InvoicePaymentStatus] ?? 'buyer.invoices.unknown') as any)}
                                                size="sm"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button asChild variant="ghost" size="sm">
                                                <Link to="/buyer/invoices/$invoiceId" params={{ invoiceId: inv.id }}>
                                                    {t('common.details')}
                                                </Link>
                                            </Button>
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

function KpiCard({
    title,
    hint,
    amount,
    tone,
}: {
    title: string;
    hint: string;
    amount: number;
    tone: 'default' | 'success' | 'primary';
}) {
    const toneClass =
        tone === 'success'
            ? 'text-emerald-600 dark:text-emerald-400'
            : tone === 'primary'
                ? 'text-primary'
                : 'text-foreground';
    return (
        <Card className="border-border shadow-2xs bg-card">
            <CardHeader className="pb-2">
                <CardTitle className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <MoneyDisplay
                    amount={amount}
                    variant="currency"
                    emphasize
                    className={`text-2xl ${toneClass}`}
                />
                <p className="text-xs text-muted-foreground mt-1">{hint}</p>
            </CardContent>
        </Card>
    );
}

export default BillingPage;