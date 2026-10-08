import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronLeft, Printer, Receipt } from 'lucide-react';

import { MoneyDisplay } from '@/components/money-display';
import { PageHeader } from '@/components/page-header';
import { StatusBadge, type StatusTone } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocale } from '@/hooks/useLocale';
import { useInvoicesQuery } from '@/hooks/useScmQueries';
import { type TranslationPath } from '@/types/generated-locale';
import type { PaymentStatus } from '@/types/scm-domain';

export const Route = createFileRoute('/buyer/invoices/$invoiceId')({
  component: InvoiceDetailPage,
  staticData: {
    crumb: { label: 'nav.buyer.invoices' },
  },
});

const PAYMENT_TONE: Record<PaymentStatus, StatusTone> = {
  PAID: 'success',
  UNPAID: 'warning',
  OVERDUE: 'danger',
  UNKNOWN: 'neutral',
};

const PAYMENT_LABEL_KEY: Record<PaymentStatus, TranslationPath> = {
  PAID: 'buyer.invoices.paid',
  UNPAID: 'buyer.invoices.unpaid',
  OVERDUE: 'buyer.invoices.overdue',
  UNKNOWN: 'buyer.invoices.unknown',
};

function InvoiceDetailPage() {
  const { t } = useLocale();
  const { invoiceId } = Route.useParams();
  const { data: invoices = [], isLoading, isError } = useInvoicesQuery();
  const invoice = invoices.find((item) => item.id === invoiceId || item.invoiceNumber === invoiceId);

  if (isLoading) {
    return (
      <div role="status" className="p-6 text-sm text-muted-foreground">
        {t('buyer.invoiceDetail.loading')}
      </div>
    );
  }
  if (isError) {
    return (
      <div role="alert" className="p-6 text-sm text-destructive">
        {t('buyer.invoiceDetail.error')}
      </div>
    );
  }
  if (!invoice) {
    return (
      <div role="alert" className="p-6 text-sm text-muted-foreground">
        {t('buyer.invoiceDetail.notFound')}
      </div>
    );
  }

  const isPaid = invoice.paymentStatus === 'PAID';

  return (
    <div className="mx-auto max-w-4xl space-y-5 min-w-0">
      <div>
        <Link
          to="/buyer/invoices"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          {t('buyer.invoiceDetail.backToInvoices')}
        </Link>
      </div>

      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" aria-hidden="true" />
            {invoice.invoiceNumber}
          </span>
        }
        subtitle={t('buyer.invoiceDetail.orderRef', { number: invoice.orderNumber })}
        actions={
          <>
            <StatusBadge tone={PAYMENT_TONE[invoice.paymentStatus]} label={t(PAYMENT_LABEL_KEY[invoice.paymentStatus])} />
            <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 font-medium">
              <Printer className="h-4 w-4" aria-hidden="true" />
              {t('buyer.invoiceDetail.print')}
            </Button>
          </>
        }
      />

      {!isPaid && (
        <p
          role="status"
          className="border-l-2 border-border bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground"
        >
          {t('buyer.invoiceDetail.unpaidNotice')}
        </p>
      )}

      <Card className="border-border bg-card shadow-xs">
        <CardContent className="p-5 space-y-5">
          <span className="text-sm font-semibold text-foreground block">
            {t('buyer.invoiceDetail.detailsTitle')}
          </span>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div className="min-w-0">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                {t('buyer.invoiceDetail.buyer')}
              </dt>
              <dd className="mt-1 font-medium text-foreground truncate">{invoice.buyerName || '—'}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                {t('buyer.invoiceDetail.buyerNip')}
              </dt>
              <dd className="mt-1 font-mono text-foreground">{invoice.buyerNip || '—'}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                {t('buyer.invoiceDetail.issueDate')}
              </dt>
              <dd className="mt-1 font-mono text-foreground">{invoice.issueDate || '—'}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                {t('buyer.invoiceDetail.dueDate')}
              </dt>
              <dd className="mt-1 font-mono text-foreground">{invoice.dueDate || '—'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-xs overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[420px]">
            <caption className="sr-only">{t('buyer.invoiceDetail.amountsTitle')}</caption>
            <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-5">{t('buyer.invoiceDetail.amountsTitle')}</th>
                <th className="py-3 px-5 text-right">{t('buyer.invoiceDetail.amount')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="py-3 px-5 text-muted-foreground">{t('buyer.invoiceDetail.net')}</td>
                <td className="py-3 px-5 text-right">
                  <MoneyDisplay amount={invoice.netAmount} variant="inline" />
                </td>
              </tr>
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="py-3 px-5 text-muted-foreground">{t('buyer.invoiceDetail.vat')}</td>
                <td className="py-3 px-5 text-right">
                  <MoneyDisplay amount={invoice.vatAmount} variant="inline" />
                </td>
              </tr>
              <tr className="bg-muted/30 border-t border-border">
                <td className="py-3 px-5 font-bold text-foreground">{t('buyer.invoiceDetail.gross')}</td>
                <td className="py-3 px-5 text-right">
                  <MoneyDisplay amount={invoice.grossAmount} variant="inline" emphasize />
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default InvoiceDetailPage;
