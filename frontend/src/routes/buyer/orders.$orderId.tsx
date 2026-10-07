import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronLeft, Package, Truck, CheckCircle2, Clock, MapPin, FileText, Download, AlertTriangle, Building2, Radio, ShieldAlert, ShieldCheck, Zap } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { FormFieldSelect, FormFieldNumber, FormFieldInput } from '@/components/forms/common';
import { InteractiveLogisticsMap } from '@/components/logistics/InteractiveLogisticsMap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useOrdersQuery, INITIAL_ORDERS, useUpdateOrderStatusMutation, useCreateClaimMutation } from '@/hooks/useScmQueries';
import type { OrderStatus, IncotermsCode } from '@/types/scm-domain';

export const Route = createFileRoute('/buyer/orders/$orderId')({
  component: OrderDetailPage,
  staticData: {
    crumb: {
      label: 'Детали заказа и жизненный цикл',
    },
  },
});

// All 13 Order Lifecycle FSM Statuses in Domain Order
export const ALL_ORDER_STATUSES: {
  status: OrderStatus;
  label: string;
  category: 'HAPPY_PATH' | 'EXCEPTION' | 'TERMINAL';
  desc: string;
}[] = [
  { status: 'DRAFT', label: '1. Черновик', category: 'HAPPY_PATH', desc: 'Корзина B2B сформирована' },
  { status: 'SUBMITTED', label: '2. Отправлен', category: 'HAPPY_PATH', desc: 'Передан на исполнение в систему' },
  { status: 'RESERVED', label: '3. Зарезервирован', category: 'HAPPY_PATH', desc: 'Товар зарезервирован на складе' },
  { status: 'AWAITING_PAYMENT', label: '4. Ожидает оплаты', category: 'HAPPY_PATH', desc: 'Проверка кредитного лимита / KSeF' },
  { status: 'PAID', label: '5. Оплачен', category: 'HAPPY_PATH', desc: 'Платеж подтвержден / Лимит Net 30' },
  { status: 'IN_PROCESSING', label: '6. Комплектация', category: 'HAPPY_PATH', desc: 'Сборка и паллетирование в WMS' },
  { status: 'SHIPPED', label: '7. В пути', category: 'HAPPY_PATH', desc: 'Оформлен e-CMR, рейс отправлен' },
  { status: 'DELIVERED', label: '8. Доставлен', category: 'HAPPY_PATH', desc: 'Прибыл на разгрузочную рампу' },
  { status: 'COMPLETED', label: '9. Завершен', category: 'HAPPY_PATH', desc: 'Подписан e-CMR на стекле / закрыт' },
  // Exceptions & Alternate Branches
  { status: 'CANCELLED_OUT_OF_STOCK', label: 'Нет остатка', category: 'EXCEPTION', desc: 'Дефицит товара на складе' },
  { status: 'PAYMENT_FAILED', label: 'Ошибка оплаты', category: 'EXCEPTION', desc: 'Отклонение банковской авторизации' },
  { status: 'DISPUTED', label: 'Рекламация (RMA)', category: 'EXCEPTION', desc: 'Акт расхождений / спор покупателя' },
  { status: 'CANCELLED', label: 'Отменен', category: 'TERMINAL', desc: 'Заказ аннулирован' },
];

const HAPPY_PATH_ORDER: OrderStatus[] = [
  'DRAFT',
  'SUBMITTED',
  'RESERVED',
  'AWAITING_PAYMENT',
  'PAID',
  'IN_PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'COMPLETED',
];

const rmaSchema = z.object({
  rmaReason: z.string().min(1, 'Укажите причину рекламации'),
  rmaItemSku: z.string().min(1, 'Выберите артикул'),
  rmaQty: z.number().int().min(1, 'Количество должно быть не менее 1'),
  rmaNotes: z.string().optional(),
});

type RmaFormData = z.infer<typeof rmaSchema>;

const rmaReasonOptions = [
  { value: 'DAMAGED_CARGO', label: 'Повреждение груза / бой при транспортировке' },
  { value: 'SHORTAGE', label: 'Недостача (фактически меньше, чем в e-CMR)' },
  { value: 'WRONG_SKU', label: 'Пересортица / несоответствие артикула' },
];

function OrderDetailPage() {
  const { orderId } = Route.useParams();
  const { data: orders = INITIAL_ORDERS } = useOrdersQuery();

  const [currentSimulatedStatus, setCurrentSimulatedStatus] = useState<OrderStatus | null>(null);
  const [showRmaDialog, setShowRmaDialog] = useState(false);

  const rawOrder = useMemo(() => {
    return (
      orders.find((o) => o.id === orderId || o.orderNumber === orderId) || {
        id: orderId,
        orderNumber: 'ORD-2026-0891',
        customerName: 'Baltic Retail Group Sp. z o.o.',
        status: 'SHIPPED' as OrderStatus,
        totalAmount: 28450.0,
        currency: 'PLN',
        itemsCount: 140,
        deliveryCity: 'Warszawa',
        deliveryAddress: 'ul. Magazynowa 14, Rampa 4',
        deliveryPostalCode: '05-090 Raszyn',
        incoterms: 'DAP' as IncotermsCode,
        slaTargetDate: '2026-09-26 14:00 CEST',
        slaMaxTransitHours: 24,
        guaranteedOtifPercent: 99.2,
        createdAt: '2026-09-24 10:15',
        items: [
          { sku: 'SKU-PAL-01', name: 'EPAL Euro-Pallet Standard (Pine Wood)', quantity: 100, unitPrice: 120.0 },
          { sku: 'SKU-STR-05', name: 'Industrial Stretch Film 23mic', quantity: 40, unitPrice: 411.25 },
        ],
      }
    );
  }, [orders, orderId]);

  const activeStatus: OrderStatus = currentSimulatedStatus || rawOrder.status;

  const currentStepIndex = HAPPY_PATH_ORDER.indexOf(activeStatus);
  const isHappyPath = currentStepIndex !== -1;

  const handleDownloadDoc = (docType: string) => {
    toast.success(`Сформирован документ ${docType} для заказа ${rawOrder.orderNumber}`);
  };

  const rmaForm = useForm<RmaFormData>({
    resolver: zodResolver(rmaSchema),
    defaultValues: {
      rmaReason: 'DAMAGED_CARGO',
      rmaItemSku: '',
      rmaQty: 1,
      rmaNotes: '',
    },
  });

  const createClaimMutation = useCreateClaimMutation();
  const updateStatusMutation = useUpdateOrderStatusMutation();

  const onFileRma = async (data: RmaFormData) => {
    await createClaimMutation.mutateAsync({
      orderNumber: rawOrder.orderNumber,
      supplierName: 'PlastChem Industrial Sp. k.',
      reason: `${data.rmaReason}: ${data.rmaNotes || 'Дефект груза при приемке'}`,
      claimAmountPln: data.rmaQty * 120,
    });
    await updateStatusMutation.mutateAsync({
      orderId: rawOrder.id,
      nextStatus: 'DISPUTED',
    });
    setCurrentSimulatedStatus('DISPUTED');
    setShowRmaDialog(false);
    rmaForm.reset();
  };

  const handleSimulateNextStep = async () => {
    if (isHappyPath && currentStepIndex < HAPPY_PATH_ORDER.length - 1) {
      const nextStatus = HAPPY_PATH_ORDER[currentStepIndex + 1]!;
      await updateStatusMutation.mutateAsync({
        orderId: rawOrder.id,
        nextStatus,
      });
      setCurrentSimulatedStatus(nextStatus);
    } else {
      await updateStatusMutation.mutateAsync({
        orderId: rawOrder.id,
        nextStatus: 'SUBMITTED',
      });
      setCurrentSimulatedStatus('SUBMITTED');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto min-w-0">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/buyer/orders"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Назад к заказам
          </Link>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">
              {rawOrder.orderNumber}
            </h1>
            <Badge
              className={`text-xs font-bold px-3 py-1 ${
                activeStatus === 'COMPLETED'
                  ? 'bg-emerald-600 text-white'
                  : activeStatus === 'DISPUTED' || activeStatus === 'CANCELLED' || activeStatus === 'CANCELLED_OUT_OF_STOCK'
                  ? 'bg-rose-600 text-white'
                  : 'bg-primary text-primary-foreground'
              }`}
            >
              Статус: {activeStatus}
            </Badge>

            <Badge variant="outline" className="text-xs font-mono border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10">
              Incoterms 2020: {rawOrder.incoterms || 'DAP'}
            </Badge>

            <Badge variant="outline" className="text-xs border-blue-500/40 text-blue-700 dark:text-blue-300 bg-blue-500/10">
              SLA OTIF: {rawOrder.guaranteedOtifPercent || 99.2}%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Покупатель: <strong>{rawOrder.customerName}</strong> • Назначение: {rawOrder.deliveryCity} ({rawOrder.deliveryAddress || 'DC-01 Депо'})
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 flex-1 sm:flex-none justify-center"
            onClick={handleSimulateNextStep}
          >
            <Zap className="h-3.5 w-3.5 text-primary" />
            Перевести статус
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="border-amber-500/40 text-amber-700 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 gap-1.5 flex-1 sm:flex-none justify-center"
            onClick={() => setShowRmaDialog(true)}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Подать рекламацию (RMA)
          </Button>

          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 flex-1 sm:flex-none justify-center"
            onClick={() => handleDownloadDoc('Счет-фактура VAT PDF')}
          >
            <Download className="h-3.5 w-3.5" />
            Счет-фактура (VAT)
          </Button>
        </div>
      </div>

      {/* Visual Stepper: Lifecycle States */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="py-3 px-5 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Жизненный цикл заказа (FSM)
              </span>
              <p className="text-xs text-muted-foreground mt-0.5">
                Контроль контрольных точек поставки, резервирования запасов и валидации отгрузки.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Сменить этап:</span>
              <select
                value={activeStatus}
                onChange={(e) => setCurrentSimulatedStatus(e.target.value as OrderStatus)}
                className="h-8 text-xs bg-background border border-input rounded-md px-2.5 font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {ALL_ORDER_STATUSES.map((s) => (
                  <option key={s.status} value={s.status}>
                    {s.label} ({s.category})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {/* Main Happy Path Timeline */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-9 gap-2.5">
            {HAPPY_PATH_ORDER.map((stepStatus, idx) => {
              const meta = ALL_ORDER_STATUSES.find((s) => s.status === stepStatus)!;
              const isPast = isHappyPath && idx <= currentStepIndex;
              const isCurrent = activeStatus === stepStatus;

              return (
                <div
                  key={stepStatus}
                  onClick={() => setCurrentSimulatedStatus(stepStatus)}
                  className={`flex flex-col items-start p-2.5 rounded-lg border cursor-pointer min-w-0 transition-all ${
                    isCurrent
                      ? 'bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500'
                      : 'border-border/60 hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5 w-full min-w-0">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-3xs font-bold shrink-0 transition-colors ${
                        isCurrent
                          ? 'bg-emerald-600 text-white shadow-xs animate-pulse'
                          : isPast
                          ? 'bg-emerald-600 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isPast && !isCurrent ? <CheckCircle2 className="h-3 w-3" /> : idx + 1}
                    </div>
                    <span
                      className={`text-2xs font-bold leading-tight truncate ${
                        isCurrent
                          ? 'text-emerald-700 dark:text-emerald-300 font-extrabold'
                          : isPast
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {meta.label.replace(/^\d+\.\s*/, '')}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 leading-tight">{meta.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Alternate Branches & Exceptions Bar */}
          <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Исключения и рекламации:
            </span>
            {ALL_ORDER_STATUSES.filter((s) => s.category !== 'HAPPY_PATH').map((s) => {
              const isCurrent = activeStatus === s.status;
              return (
                <button
                  key={s.status}
                  onClick={() => setCurrentSimulatedStatus(s.status)}
                  className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-colors ${
                    isCurrent
                      ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                      : 'bg-background text-muted-foreground border-border hover:bg-muted/40'
                  }`}
                >
                  {s.label} ({s.desc.split(':')[0]})
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Delivery & B2B Logistics Compliance Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardHeader className="py-2.5 px-4">
            <CardTitle className="text-xs uppercase text-muted-foreground font-semibold flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-primary" /> Incoterms 2020
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0">
            <div className="text-xl font-bold font-mono text-foreground">
              {rawOrder.incoterms || 'DAP'} Warszawa
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Поставка в место назначения (риски на продавце)</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="py-2.5 px-4">
            <CardTitle className="text-xs uppercase text-muted-foreground font-semibold flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-rose-600" /> Адрес доставки
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0">
            <div className="text-sm font-bold text-foreground truncate">
              {rawOrder.deliveryAddress || 'ul. Magazynowa 14, Rampa 4'}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {rawOrder.deliveryPostalCode || '05-090'} {rawOrder.deliveryCity}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="py-2.5 px-4">
            <CardTitle className="text-xs uppercase text-muted-foreground font-semibold flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-600" /> Гарантированный SLA
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0">
            <div className="text-sm font-bold text-foreground">
              План: {rawOrder.slaTargetDate || '2026-09-26 14:00'}
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
              Лимит в пути: {rawOrder.slaMaxTransitHours || 24}ч • OTIF: {rawOrder.guaranteedOtifPercent || 99.2}%
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="py-2.5 px-4">
            <CardTitle className="text-xs uppercase text-muted-foreground font-semibold flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Протокол e-CMR
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0">
            <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">CMR-PL-2026-9912</div>
            <p className="text-xs text-muted-foreground mt-0.5">Цифровая подпись e-CMR верифицирована</p>
          </CardContent>
        </Card>
      </div>

      {/* Real Interactive Leaflet OpenStreetMap Map */}
      <Card className="border-border bg-card overflow-hidden shadow-xs">
        <CardHeader className="py-3 px-5 border-b border-border bg-muted/30 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Truck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Телематика рейса и маршрут доставки
          </CardTitle>
          <Badge className="bg-emerald-600 text-white text-xs gap-1">
            <Radio className="h-3 w-3 animate-pulse" /> Телематика онлайн
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <InteractiveLogisticsMap
            height="380px"
            origin={{
              name: 'Warszawa Central Hub (DC-01)',
              lat: 52.2297,
              lng: 21.0122,
              type: 'ORIGIN',
            }}
            destination={{
              name: `${rawOrder.deliveryCity} Депо приемки грузов`,
              lat: 54.352,
              lng: 18.6466,
              type: 'DESTINATION',
              eta: '45 мин',
            }}
            telematics={{
              driverName: 'Tomasz Lewandowski',
              vehiclePlate: 'WI 49102 (Scania R450)',
              temperatureCelsius: 4.2,
              etaRemaining: '45 мин',
              glecCo2Kg: 38.4,
            }}
          />
        </CardContent>
      </Card>

      {/* Line Items & Commercial Documentation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="py-3 px-5 border-b border-border">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Спецификация и товарные позиции
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[620px]">
                <thead className="bg-muted/30 border-b border-border text-muted-foreground">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Артикул / Наименование</th>
                    <th className="py-3 px-4 font-semibold">Бренд и производитель</th>
                    <th className="py-3 px-4 font-semibold">Габариты</th>
                    <th className="py-3 px-4 font-semibold">Количество</th>
                    <th className="py-3 px-4 font-semibold">Цена нетто</th>
                    <th className="py-3 px-4 font-semibold">НДС (23%)</th>
                    <th className="py-3 px-4 text-right font-semibold">Итого брутто</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rawOrder.items?.map((item) => {
                    const lineNet = item.unitPrice * item.quantity;
                    const lineVat = lineNet * 0.23;
                    const lineGross = lineNet + lineVat;
                    return (
                      <tr key={item.sku} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-foreground">{item.name}</div>
                          <div className="font-mono text-2xs text-muted-foreground">{item.sku}</div>
                        </td>
                        <td className="py-3 px-4">
                          {item.brand ? (
                            <div className="space-y-1">
                              <Badge variant="outline" className="text-2xs font-semibold gap-1 max-w-[160px] truncate">
                                {item.brandCode || item.brand}
                              </Badge>
                              {item.manufacturer && (
                                <div className="text-2xs text-muted-foreground leading-tight flex items-center gap-1 max-w-[160px] truncate">
                                  <Building2 className="h-2.5 w-2.5 flex-shrink-0 text-muted-foreground" />
                                  <span className="truncate">{item.manufacturer}</span>
                                  {item.manufacturerCountry && (
                                    <span className="font-mono text-muted-foreground">({item.manufacturerCountry})</span>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-2xs">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {item.dimensions ? (
                            <div className="space-y-0.5">
                              <div className="font-mono text-2xs text-foreground">{item.dimensions}</div>
                              {item.weightKg && (
                                <div className="text-2xs text-muted-foreground">{item.weightKg} кг/ед.</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-2xs">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium">
                          {item.quantity} {item.unit || 'ед.'}
                        </td>
                        <td className="py-3 px-4 font-mono">{item.unitPrice.toFixed(2)} PLN</td>
                        <td className="py-3 px-4 font-mono">{lineVat.toFixed(2)} PLN</td>
                        <td className="py-3 px-4 font-mono font-bold text-right">
                          {lineGross.toFixed(2)} PLN
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="p-4 bg-muted/30 border-t border-border flex justify-between items-center text-sm font-bold">
                <span>Итого брутто по заказу:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">{rawOrder.totalAmount.toLocaleString('ru-RU')} PLN</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="py-3 px-5 border-b border-border">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Коммерческие документы
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {[
                { name: 'Транспортная накладная (e-CMR)', type: 'PDF / XML', desc: 'Цифровая подпись на стекле' },
                { name: 'Счет-фактура (Faktura VAT)', type: 'PDF (KSeF ready)', desc: 'Срок платежа: Net 30' },
                { name: 'Упаковочный лист склада', type: 'PDF', desc: 'Коды верификации сканирования' },
                { name: 'Сертификат происхождения и ISPM-15', type: 'PDF', desc: 'Фитосанитарный штамп HT' },
              ].map((doc, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-border flex items-center justify-between text-xs hover:bg-muted/40 transition-colors"
                >
                  <div>
                    <div className="font-semibold text-foreground">{doc.name}</div>
                    <div className="text-2xs text-muted-foreground">{doc.desc}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-1 text-emerald-600 hover:text-emerald-700"
                    onClick={() => handleDownloadDoc(doc.name)}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* RMA Claim Dialog Modal */}
      <Dialog open={showRmaDialog} onOpenChange={setShowRmaDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base text-amber-700 dark:text-amber-400">
              <ShieldAlert className="h-5 w-5" /> Оформление рекламации (RMA) / Акт расхождений
            </DialogTitle>
          </DialogHeader>
          <Form {...rmaForm}>
            <form onSubmit={rmaForm.handleSubmit(onFileRma)} className="space-y-4 text-xs">
              <FormFieldSelect
                control={rmaForm.control}
                name="rmaReason"
                label="Причина рекламации:"
                options={rmaReasonOptions}
              />

              <FormFieldSelect
                control={rmaForm.control}
                name="rmaItemSku"
                label="Артикул с расхождением:"
                placeholder="Выберите артикул из заказа..."
                options={(rawOrder.items || []).map((i) => ({
                  value: i.sku,
                  label: `${i.sku} - ${i.name}`,
                }))}
              />

              <FormFieldNumber
                control={rmaForm.control}
                name="rmaQty"
                label="Количество с расхождением:"
                min={1}
                step={1}
              />

              <FormFieldInput
                control={rmaForm.control}
                name="rmaNotes"
                label="Описание расхождения и ссылки на фото:"
                placeholder="Опишите повреждение упаковки или пломбы..."
              />

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowRmaDialog(false)}>
                  Отмена
                </Button>
                <Button type="submit" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white cursor-pointer">
                  Отправить рекламацию в арбитраж
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OrderDetailPage;
