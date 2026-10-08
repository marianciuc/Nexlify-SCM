import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import {
  ChevronLeft,
  Trophy,
  Layers,
  TrendingDown,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { FormFieldInput, FormFieldNumber } from '@/components/forms/common';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import rfqClient from '@/service/api/clients/rfq-client';
import type { RfqItem } from '@/types/scm-domain';

export const Route = createFileRoute('/supplier/bids/$rfqId/submit')({
  component: SubmitRfqBidPage,
  staticData: {
    crumb: {
      label: 'Подача предложения на тендер',
    },
  },
});

interface BuyerRequestedItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  unit: string;
  targetUnitPrice: number;
  allowSubstitute: boolean;
}

const supplierItemBidSchema = z.object({
  itemId: z.string(),
  isSubstitute: z.boolean(),
  offeredSku: z.string().min(1, 'Артикул обязателен'),
  offeredName: z.string().min(1, 'Наименование обязательно'),
  offeredUnitPrice: z.number().positive('Цена должна быть положительной'),
  offeredQuantity: z.number().positive('Количество должно быть положительным'),
  technicalJustification: z.string().optional(),
  complianceNotes: z.string().optional(),
});

const submitBidSchema = z.object({
  bids: z.record(supplierItemBidSchema),
  leadTimeDays: z.number().int().min(1, 'Срок поставки должен быть не менее 1 дня'),
  warrantyTerms: z.string().min(1, 'Укажите условия гарантии'),
  supplierNotes: z.string().optional(),
});

type SubmitBidFormData = z.infer<typeof submitBidSchema>;

export function SubmitRfqBidPage() {
  const { rfqId } = Route.useParams();
  const navigate = useNavigate();
  const { data: rfq, isLoading, isError } = useQuery<RfqItem>({
    queryKey: ['rfq', rfqId],
    queryFn: async () => {
      const data = await rfqClient.getRfqById(rfqId);
      return {
        id: data.id,
        rfqNumber: data.rfqNumber || data.id,
        title: data.title,
        category: data.category || '',
        description: data.description || '',
        issuerName: data.issuerName || '',
        deliveryLocation: [data.deliveryAddress, data.deliveryCity].filter(Boolean).join(', '),
        deadline: data.deadline || '',
        targetBudget: Number(data.budgetAmount || 0),
        currency: data.currency || 'PLN',
        status: data.status,
        requiredQuantity: (data.items || []).reduce((sum: number, line: any) => sum + Number(line.quantity || 0), 0),
        unitOfMeasure: data.items?.[0]?.unitOfMeasure || '',
        createdAt: data.createdAt || '',
        bids: data.bids || [],
        items: (data.items || []).map((line: any) => ({
          id: line.id,
          sku: line.sku || '',
          name: line.productName || line.name || '',
          quantity: Number(line.quantity || 0),
          unit: line.unitOfMeasure || 'pcs',
          description: line.description || '',
          allowSubstitute: Boolean(line.allowAlternatives),
        })),
      } as RfqItem;
    },
  });

  // Buyer requested items specification
  const requestedItems: BuyerRequestedItem[] = useMemo(() => (rfq?.items || []).map((item) => ({
    id: item.id,
    sku: item.sku,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    targetUnitPrice: item.targetUnitPrice || 0,
    allowSubstitute: item.allowSubstitute,
  })), [rfq]);

  const form = useForm<SubmitBidFormData>({
    resolver: zodResolver(submitBidSchema),
    defaultValues: {
      bids: {},
      leadTimeDays: 4,
      warrantyTerms: '',
      supplierNotes: '',
    },
  });

  useEffect(() => {
    if (!rfq) return;
    form.reset({
      bids: Object.fromEntries(requestedItems.map((item) => [item.id, {
        itemId: item.id,
        isSubstitute: false,
        offeredSku: item.sku,
        offeredName: item.name,
        offeredUnitPrice: item.targetUnitPrice,
        offeredQuantity: item.quantity,
        technicalJustification: '',
        complianceNotes: '',
      }])),
      leadTimeDays: 1,
      warrantyTerms: '',
      supplierNotes: '',
    });
  }, [form, rfq, requestedItems]);

  const watchedBids = form.watch('bids') || {};

  // Totals Calculation
  const totalOfferedAmount = useMemo(() => {
    return Object.values(watchedBids).reduce(
      (acc, bid) =>
        acc + (Number(bid?.offeredUnitPrice) || 0) * (Number(bid?.offeredQuantity) || 0),
      0
    );
  }, [watchedBids]);

  const targetBudgetTotal = rfq?.targetBudget || 0;

  const totalSavings = targetBudgetTotal - totalOfferedAmount;
  const savingsPercent =
    targetBudgetTotal > 0 ? Math.round((totalSavings / targetBudgetTotal) * 100) : 0;

  const onSubmit = async (data: SubmitBidFormData) => {
    try {
      await rfqClient.submitBid(rfqId, {
        totalPrice: totalOfferedAmount,
        currency: rfq?.currency || 'PLN',
        notes: [data.warrantyTerms, data.supplierNotes].filter(Boolean).join('\n'),
        items: requestedItems.map((item) => {
          const bid = data.bids[item.id]!;
          return {
            rfqItemId: item.id,
            offeredSku: bid.offeredSku,
            productName: bid.offeredName,
            quantity: bid.offeredQuantity,
            unitPrice: bid.offeredUnitPrice,
            isAlternative: bid.isSubstitute,
            alternativeReason: [bid.technicalJustification, bid.complianceNotes].filter(Boolean).join('\n'),
            leadTimeDays: data.leadTimeDays,
          };
        }),
      });
      toast.success('Предложение отправлено заказчику');
      navigate({ to: '/supplier/bids/board' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось отправить предложение');
    }
  };

  if (isLoading) return <div role="status" className="p-6 text-sm text-muted-foreground">Загружаем запрос…</div>;
  if (isError || !rfq) return <div role="alert" className="p-6 text-sm text-destructive">Не удалось загрузить этот запрос. Вернитесь на доску тендеров и обновите список.</div>;
  if (requestedItems.length === 0) return <div role="alert" className="p-6 text-sm text-muted-foreground">В запросе нет спецификации позиций для предложения.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/supplier/bids/board"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Назад к тендерной доске
        </Link>
      </div>

      {/* Target RFQ Summary Card */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="py-3 px-5 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground">
              {rfq.rfqNumber}
            </span>
            <span className="text-xs text-muted-foreground">{rfq.category}</span>
          </div>
          <CardTitle className="text-base font-semibold mt-1">{rfq.title}</CardTitle>
          <p className="text-xs text-muted-foreground">{rfq.description}</p>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-muted-foreground block">Целевой бюджет заказчика:</span>
            <span className="font-mono font-bold text-foreground">
              {targetBudgetTotal.toLocaleString('ru-RU')} {rfq.currency}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Требуемые позиции:</span>
            <span className="font-bold text-foreground">
              {requestedItems.length} поз. в спецификации
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Пункт назначения:</span>
            <span className="font-medium text-foreground">
              {rfq.deliveryLocation}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Срок подачи:</span>
            <span className="font-medium text-amber-600 dark:text-amber-400 font-mono">
              {rfq.deadline ? new Date(rfq.deadline).toLocaleDateString('ru-RU') : '—'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Form for Itemized Quotation */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  Попозиционное предложение и сопоставление аналогов
                </h2>
                <p className="text-xs text-muted-foreground">
                  Для каждой позиции спецификации укажите предложение по оригинальному артикулу или сертифицированный аналог.
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                Модуль комплексного предложения
              </Badge>
            </div>

            {/* Itemized Cards */}
            <div className="space-y-4">
              {requestedItems.map((req, idx) => {
                const currentBid = watchedBids[req.id] || {
                  itemId: req.id,
                  isSubstitute: false,
                  offeredSku: req.sku,
                  offeredName: req.name,
                  offeredUnitPrice: req.targetUnitPrice,
                  offeredQuantity: req.quantity,
                  technicalJustification: '',
                  complianceNotes: '',
                };

                const lineTotal =
                  (Number(currentBid.offeredUnitPrice) || 0) * (Number(currentBid.offeredQuantity) || 0);
                const targetLineTotal = req.quantity * req.targetUnitPrice;
                const lineSavings = targetLineTotal - lineTotal;
                const lineSavingsPercent =
                  targetLineTotal > 0 ? Math.round((lineSavings / targetLineTotal) * 100) : 0;

                return (
                  <Card
                    key={req.id}
                    className={`border transition-all ${
                      currentBid.isSubstitute
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-border bg-card'
                    }`}
                  >
                    <CardHeader className="py-3 px-4 bg-muted/30 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-foreground">
                          Позиция #{idx + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-xs text-foreground">
                            {req.name}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                          Запрос: {req.quantity} {req.unit}{req.targetUnitPrice > 0 ? ` · ориентир ${req.targetUnitPrice.toFixed(2)} PLN/${req.unit}` : ''}
                          </div>
                        </div>
                      </div>

                      {/* Proposal Type Selector */}
                      <div className="flex items-center gap-2">
                        {req.allowSubstitute ? (
                          <div className="inline-flex rounded-md border border-border p-0.5 bg-background text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                form.setValue(`bids.${req.id}.isSubstitute`, false);
                                form.setValue(`bids.${req.id}.offeredSku`, req.sku);
                                form.setValue(`bids.${req.id}.offeredName`, req.name);
                              }}
                              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                                !currentBid.isSubstitute
                                  ? 'bg-primary text-primary-foreground shadow-xs'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              Точное совпадение
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                form.setValue(`bids.${req.id}.isSubstitute`, true);
                                form.setValue(`bids.${req.id}.offeredSku`, `${req.sku}-SUB`);
                                form.setValue(`bids.${req.id}.offeredName`, `Аналог сертифицированный ${req.name}`);
                              }}
                              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                                currentBid.isSubstitute
                                  ? 'bg-primary text-primary-foreground shadow-xs'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              <RefreshCw className="h-3 w-3" />
                              <span>Предложить аналог</span>
                            </button>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            Только точный оригинал
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 space-y-3 text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2 space-y-1">
                          <FormLabel className="text-xs font-semibold">
                            {currentBid.isSubstitute ? 'Наименование предлагаемого аналога:' : 'Наименование товара:'}
                          </FormLabel>
                          <Input
                            {...form.register(`bids.${req.id}.offeredName`)}
                            aria-label={`Наименование товара для позиции ${idx + 1}`}
                            className="h-8 text-xs font-semibold bg-background"
                          />
                        </div>

                        <div className="space-y-1">
                          <FormLabel className="text-xs font-semibold">Артикул поставщика (SKU):</FormLabel>
                          <Input
                            {...form.register(`bids.${req.id}.offeredSku`)}
                            aria-label={`Артикул SKU для позиции ${idx + 1}`}
                            className="h-8 text-xs font-mono tabular-nums bg-background"
                          />
                        </div>

                        <div className="space-y-1">
                          <FormLabel className="text-xs font-semibold">Цена за единицу (PLN):</FormLabel>
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              step={0.1}
                              min={0.1}
                              aria-label={`Отпускная цена за единицу PLN для позиции ${idx + 1}`}
                              value={currentBid.offeredUnitPrice}
                              onChange={(e) =>
                                form.setValue(
                                  `bids.${req.id}.offeredUnitPrice`,
                                  Number(e.target.value)
                                )
                              }
                              className="h-8 text-xs font-mono tabular-nums font-bold text-right bg-background"
                            />
                            <span className="text-xs font-mono text-muted-foreground">PLN</span>
                          </div>
                        </div>
                      </div>

                      {/* If Substitute is selected: show technical justification inputs */}
                      {currentBid.isSubstitute && (
                        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
                          <div className="flex items-center gap-1.5 text-foreground font-bold text-xs uppercase">
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                            Эквивалентность аналога и техническое обоснование:
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <Input
                              {...form.register(`bids.${req.id}.technicalJustification`)}
                              aria-label={`Техническое обоснование эквивалентности для позиции ${idx + 1}`}
                              placeholder="Марка сырья, пределы влажности, допуски..."
                              className="h-7 text-xs bg-background"
                            />
                            <Input
                              {...form.register(`bids.${req.id}.complianceNotes`)}
                              aria-label={`Сертификаты и стандарты соответствия для позиции ${idx + 1}`}
                              placeholder="Сертификаты соответствия, фитосанитарный штамп HT..."
                              className="h-7 text-xs bg-background"
                            />
                          </div>
                        </div>
                      )}

                      {/* Position Summary Bar */}
                      <div className="flex flex-wrap items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
                        <div>
                          Объем: <strong>{currentBid.offeredQuantity} {req.unit}</strong> @ {Number(currentBid.offeredUnitPrice).toFixed(2)} PLN/ед.
                        </div>
                        <div className="flex items-center gap-3">
                          {req.targetUnitPrice > 0 && lineSavings > 0 ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                              <TrendingDown className="h-3 w-3" />
                              Экономия заказчика: {lineSavings.toLocaleString('ru-RU')} PLN ({lineSavingsPercent}%)
                            </span>
                          ) : req.targetUnitPrice > 0 ? (
                            <span className="text-muted-foreground">Базовое рыночное предложение</span>
                          ) : null}
                          <span className="font-mono font-bold text-sm text-foreground">
                            {lineTotal.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} PLN
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Global Commercial Terms */}
          <Card className="border-border bg-card">
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-xs uppercase font-bold text-muted-foreground">
                Коммерческие условия, SLA и сроки поставки
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <FormFieldNumber
                control={form.control}
                name="leadTimeDays"
                label="Гарантированный срок отгрузки (раб. дни):"
                min={1}
                step={1}
                className="h-8 font-bold"
              />

              <FormFieldInput
                control={form.control}
                name="warrantyTerms"
                label="Гарантийные обязательства и условия SLA:"
                className="h-8"
              />

              <FormFieldInput
                control={form.control}
                name="supplierNotes"
                label="Примечания к предложению и условия логистики:"
                containerClassName="sm:col-span-2"
                className="h-8"
              />
            </CardContent>
          </Card>

          {/* Final Financial Summary Bar */}
          <div className="p-4 bg-muted/40 border border-border text-foreground rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block">
                Итоговая сумма коммерческого предложения:
              </span>
              <div className="text-2xl font-mono font-extrabold text-foreground">
                {totalOfferedAmount.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} PLN
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {targetBudgetTotal > 0 ? `Разница с бюджетом: ${totalSavings.toLocaleString('ru-RU')} PLN (${savingsPercent}%)` : 'Бюджет заказчиком не указан'}
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate({ to: '/supplier/bids/board' })}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={form.formState.isSubmitting}
                className="gap-2 font-bold shadow-xs cursor-pointer"
              >
                <Trophy className="h-4 w-4" />
                {form.formState.isSubmitting ? 'Отправляем…' : 'Отправить предложение заказчику'}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default SubmitRfqBidPage;
