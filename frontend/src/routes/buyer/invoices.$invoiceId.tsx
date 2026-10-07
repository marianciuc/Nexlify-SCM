import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronLeft, Printer } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInvoicesQuery } from '@/hooks/useScmQueries';

export const Route = createFileRoute('/buyer/invoices/$invoiceId')({
  component: InvoiceDetailPage,
  staticData: {
    crumb: { label: 'Счёт-фактура' },
  },
});

function InvoiceDetailPage() {
  const { invoiceId } = Route.useParams();
  const { data: invoices = [], isLoading, isError } = useInvoicesQuery();
  const invoice = invoices.find((item) => item.id === invoiceId || item.invoiceNumber === invoiceId);

  if (isLoading) return <div role="status" className="p-6 text-sm text-muted-foreground">Загружаем счёт…</div>;
  if (isError) return <div role="alert" className="p-6 text-sm text-destructive">Не удалось загрузить счёт. Попробуйте обновить страницу.</div>;
  if (!invoice) {
    return <div role="alert" className="p-6 text-sm text-muted-foreground">Счёт не найден. Вернитесь к реестру и выберите доступный счёт.</div>;
  }

  const isPaid = invoice.paymentStatus === 'PAID';
  const formatAmount = (amount: number) => new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: invoice.currency || 'PLN',
  }).format(amount);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/buyer/invoices" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" /> К счетам
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Счёт-фактура {invoice.invoiceNumber}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Заказ {invoice.orderNumber}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isPaid ? 'default' : 'secondary'}>{isPaid ? 'Оплачен' : invoice.paymentStatus === 'OVERDUE' ? 'Просрочен' : 'К оплате'}</Badge>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5">
            <Printer className="h-4 w-4" /> Печать / сохранить PDF
          </Button>
        </div>
      </div>

      {!isPaid && (
        <p role="status" className="border-l-2 border-amber-500 pl-3 py-1 text-sm text-muted-foreground">
          Онлайн-оплата пока недоступна. Статус счёта изменится после подтверждения платёжной системой.
        </p>
      )}

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Данные счёта</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-5">
          <dl className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Покупатель</dt>
              <dd className="mt-1 font-medium">{invoice.buyerName || '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">NIP покупателя</dt>
              <dd className="mt-1 font-mono">{invoice.buyerNip || '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Выставлен</dt>
              <dd className="mt-1">{invoice.issueDate || '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Срок оплаты</dt>
              <dd className="mt-1">{invoice.dueDate || '—'}</dd>
            </div>
          </dl>

          <div className="border-t pt-4">
            <dl className="ml-auto max-w-sm space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Сумма без НДС</dt>
                <dd className="font-mono tabular-nums">{formatAmount(invoice.netAmount)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">НДС</dt>
                <dd className="font-mono tabular-nums">{formatAmount(invoice.vatAmount)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t pt-3 text-base font-semibold">
                <dt>Итого</dt>
                <dd className="font-mono tabular-nums">{formatAmount(invoice.grossAmount)}</dd>
              </div>
            </dl>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default InvoiceDetailPage;
