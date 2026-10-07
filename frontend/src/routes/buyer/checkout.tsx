import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { ChevronLeft, CheckCircle2, MapPin, Truck, CreditCard, FileCheck, ShieldCheck, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateOrderMutation } from '@/hooks/useScmQueries';
import { useCartStore } from '@/service/cart/cart-store';
import useEnvironmentStore from '@/service/env/environment-store';

export const Route = createFileRoute('/buyer/checkout')({
  component: BuyerCheckoutPage,
  staticData: {
    crumb: {
      label: 'Оформление заказа',
    },
  },
});

const CHECKOUT_STEPS = [
  { num: 1, label: 'Адрес доставки', icon: MapPin },
  { num: 2, label: 'Логистика и слоты', icon: Truck },
  { num: 3, label: 'Условия оплаты', icon: CreditCard },
  { num: 4, label: 'Проверка заказа', icon: FileCheck },
] as const;

function BuyerCheckoutPage() {
  const navigate = useNavigate();
  const { items, getVendorGroups, getTotalGross, getTotalNet, clearCart } = useCartStore();
  const createOrderMutation = useCreateOrderMutation();
  const { currentTenant } = useEnvironmentStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryWindow, setDeliveryWindow] = useState<'STANDARD' | 'MORNING' | 'AFTERNOON'>('STANDARD');
  const [needTailgateLift, setNeedTailgateLift] = useState<boolean>(false);
  const [incoterms, setIncoterms] = useState<'DAP' | 'EXW'>('DAP');
  const [paymentMethod, setPaymentMethod] = useState<'TRADE_CREDIT_NET30' | 'STRIPE_CARD' | 'SPLIT_30_70'>(
    'TRADE_CREDIT_NET30'
  );
  const [orderNotes, setOrderNotes] = useState<string>('');

  const vendorGroups = getVendorGroups();
  const totalGross = getTotalGross();
  const totalNet = getTotalNet();

  const handleCompleteOrder = async () => {
    try {
      await createOrderMutation.mutateAsync({
        customerName: currentTenant.name,
        deliveryCity: deliveryCity.trim(),
        deliveryAddress: deliveryAddress.trim(),
        notes: [
          `Доставка: ${incoterms}; интервал: ${deliveryWindow}; гидроборт: ${needTailgateLift ? 'нужен' : 'не нужен'}; пожелание по оплате: ${paymentMethod}`,
          orderNotes.trim(),
        ].filter(Boolean).join('\n'),
        totalAmount: totalGross,
        items: items.map((i) => ({
          sku: i.sku,
          name: i.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      });

      clearCart();
      navigate({ to: '/buyer/orders' });
    } catch {
      toast.error('Не удалось создать черновик заказа. Корзина сохранена — попробуйте ещё раз.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto text-center py-16">
        <Card className="p-8 border-dashed border-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
            <Truck className="h-8 w-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Корзина пуста
          </h2>
          <p className="text-sm text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
            Добавьте товары в каталоге, чтобы перейти к оформлению заказа.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild size="sm" className="bg-primary text-primary-foreground gap-2">
              <Link to="/buyer/catalog" search={{ q: '', category: 'ALL', brand: 'ALL', manufacturer: 'ALL', stock: 'ALL' }}>
                Перейти в каталог <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/buyer/cart"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Вернуться в корзину
        </Link>
      </div>

      {/* Stepper Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-muted/40 p-2 rounded-xl text-xs font-semibold border border-border">
        {CHECKOUT_STEPS.map((s) => {
          const Icon = s.icon;
          const isActive = step === s.num;
          const isCompleted = step > s.num;
          return (
            <button
              key={s.num}
              type="button"
              aria-current={isActive ? 'step' : undefined}
              onClick={() => s.num < step && setStep(s.num)}
              disabled={s.num > step}
              className={`flex items-center justify-center gap-2 py-2 px-2 sm:px-3 rounded-lg transition-all min-w-0 ${
                isActive
                  ? 'bg-card text-primary shadow-xs font-bold'
                  : isCompleted
                  ? 'text-foreground hover:text-primary'
                  : 'text-muted-foreground opacity-60 cursor-not-allowed'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-2xs font-bold shrink-0 ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : isCompleted
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
              </div>
              <span className="truncate">{s.num}. {s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Step Specific Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: Address */}
          {step === 1 && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> Куда доставить заказ?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="delivery-address">Адрес склада или точки приёмки</Label>
                    <Input id="delivery-address" autoComplete="street-address" required value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} placeholder="Улица, номер здания, индекс" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="delivery-city">Город</Label>
                    <Input id="delivery-city" autoComplete="address-level2" required value={deliveryCity} onChange={(event) => setDeliveryCity(event.target.value)} placeholder="Например, Warszawa" />
                  </div>
                  <p className="self-end text-xs text-muted-foreground">
                    Укажите фактический адрес приёмки: он будет передан в заказ.
                  </p>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    size="sm"
                    disabled={!deliveryAddress.trim() || !deliveryCity.trim()}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 w-full sm:w-auto"
                    onClick={() => setStep(2)}
                  >
                    Перейти к условиям доставки <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 2: Logistics & Slots */}
          {step === 2 && (
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" /> Условия доставки
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Условия поставки (Incoterms):
                  </Label>
                  <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Условия доставки">
                    <label
                      className={`relative block p-3 rounded-xl border cursor-pointer focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${
                        incoterms === 'DAP'
                          ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <input type="radio" name="incoterms" value="DAP" checked={incoterms === 'DAP'} onChange={() => setIncoterms('DAP')} className="sr-only" />
                      <div className="font-semibold text-sm">DAP — доставка до указанного места</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Поставщик организует перевозку до адреса доставки. Условие будет передано как пожелание.
                      </div>
                    </label>
                    <label
                      className={`relative block p-3 rounded-xl border cursor-pointer focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${
                        incoterms === 'EXW'
                          ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <input type="radio" name="incoterms" value="EXW" checked={incoterms === 'EXW'} onChange={() => setIncoterms('EXW')} className="sr-only" />
                      <div className="font-semibold text-sm">EXW — самовывоз со склада поставщика</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Покупатель организует перевозку со склада поставщика. Условие будет передано как пожелание.
                      </div>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Предпочтительное время приёмки:
                  </Label>
                  <div className="grid grid-cols-3 gap-3 text-xs" role="radiogroup" aria-label="Время доставки">
                    {[
                      { id: 'STANDARD', title: 'В течение дня · 08:00–18:00', desc: 'Обычная приёмка' },
                      { id: 'MORNING', title: 'Утром · 07:00–12:00', desc: 'Утренний интервал' },
                      { id: 'AFTERNOON', title: 'После обеда · 12:00–17:00', desc: 'Дневной интервал' },
                    ].map((w) => (
                      <label
                        key={w.id}
                        className={`relative block p-3 rounded-xl border cursor-pointer text-center focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${
                          deliveryWindow === w.id
                            ? 'border-emerald-600 bg-emerald-50/40 font-semibold text-emerald-800'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600'
                        }`}
                      >
                        <input type="radio" name="delivery-window" value={w.id} checked={deliveryWindow === w.id} onChange={() => setDeliveryWindow(w.id as typeof deliveryWindow)} className="sr-only" />
                        <div>{w.title}</div>
                        <div className="text-2xs text-slate-400 mt-1">{w.desc}</div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <input
                    id="tailgate-lift"
                    type="checkbox"
                    checked={needTailgateLift}
                    onChange={(e) => setNeedTailgateLift(e.target.checked)}
                    className="h-4 w-4 text-emerald-600 rounded"
                  />
                  <Label htmlFor="tailgate-lift" className="cursor-pointer">
                    <span className="block text-xs font-semibold">Нужен гидроборт</span>
                    <span className="block text-2xs text-muted-foreground">Отметьте, если на точке нет высокой погрузочной рампы</span>
                  </Label>
                </div>

                <div className="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-between gap-3">
                  <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                    Назад
                  </Button>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                    onClick={() => setStep(3)}
                  >
                    К условиям оплаты <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 3: Payment Terms */}
          {step === 3 && (
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-600" /> Пожелания по оплате
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3" role="radiogroup" aria-label="Способ оплаты">
                  {/* Option 1: B2B Trade Credit Net 30 */}
                  <label
                    className={`relative block p-4 rounded-xl border cursor-pointer focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${
                      paymentMethod === 'TRADE_CREDIT_NET30'
                        ? 'border-emerald-600 bg-emerald-50/30 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <input type="radio" name="payment-method" value="TRADE_CREDIT_NET30" checked={paymentMethod === 'TRADE_CREDIT_NET30'} onChange={() => setPaymentMethod('TRADE_CREDIT_NET30')} className="sr-only" />
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <span>Оплата по счёту · 30 дней</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Укажите это условие как пожелание поставщику. Заказ не резервирует кредитный лимит.
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Option 2: Split Payment 30/70 */}
                  <label
                    className={`relative block p-4 rounded-xl border cursor-pointer focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${
                      paymentMethod === 'SPLIT_30_70'
                        ? 'border-emerald-600 bg-emerald-50/30 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <input type="radio" name="payment-method" value="SPLIT_30_70" checked={paymentMethod === 'SPLIT_30_70'} onChange={() => setPaymentMethod('SPLIT_30_70')} className="sr-only" />
                    <div className="space-y-1">
                      <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                        Частичная оплата · 30% аванс / 70% после доставки
                      </div>
                      <p className="text-xs text-slate-500">
                        Условие будет передано поставщику. Списание аванса на этом шаге не выполняется.
                      </p>
                    </div>
                  </label>

                  {/* Option 3: Immediate Stripe Card / SEPA */}
                  <label
                    className={`relative block p-4 rounded-xl border cursor-pointer focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${
                      paymentMethod === 'STRIPE_CARD'
                        ? 'border-emerald-600 bg-emerald-50/30 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <input type="radio" name="payment-method" value="STRIPE_CARD" checked={paymentMethod === 'STRIPE_CARD'} onChange={() => setPaymentMethod('STRIPE_CARD')} className="sr-only" />
                    <div className="space-y-1">
                      <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                        Карта или банковский перевод
                      </div>
                      <p className="text-xs text-slate-500">
                        Выбор передаётся поставщику как пожелание. Платёж на этом шаге не выполняется.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-between gap-3">
                  <Button variant="outline" size="sm" onClick={() => setStep(2)}>
                    Назад
                  </Button>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                    onClick={() => setStep(4)}
                  >
                    Проверить заказ <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 4: Review & Final Confirmation */}
          {step === 4 && (
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-primary" /> Проверка заказа
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl space-y-3 text-xs">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Адрес доставки:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 text-right">
                      {deliveryAddress}, {deliveryCity}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Доставка и время:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {incoterms} · {{ STANDARD: 'в течение дня', MORNING: 'утром', AFTERNOON: 'после обеда' }[deliveryWindow]}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Пожелание по оплате:</span>
                    <span className="font-semibold text-emerald-600">
                      {paymentMethod === 'TRADE_CREDIT_NET30'
                        ? 'Оплата по счёту · 30 дней'
                        : paymentMethod === 'SPLIT_30_70'
                        ? 'Частичная оплата · 30/70'
                        : 'Карта или банковский перевод'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Комментарий водителю или складу (необязательно):</Label>
                  <Input
                    placeholder="Например: сообщить охране код ворот при въезде"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    Подтверждение создаст черновик заказа. Условия доставки будут переданы поставщику вместе с заказом.
                  </span>
                </div>

                <div className="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-between gap-3">
                  <Button variant="outline" size="sm" onClick={() => setStep(3)}>
                    Назад
                  </Button>
                  <Button
                    size="sm"
                    disabled={createOrderMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-bold shadow-sm"
                    onClick={handleCompleteOrder}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {createOrderMutation.isPending ? 'Создание…' : `Создать заказ · ${totalGross.toLocaleString()} PLN`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right 1 Col: Fixed Summary */}
        <div>
          <Card className="sticky top-6 border-slate-200 dark:border-slate-800 shadow-md">
            <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-3.5">
              <CardTitle className="text-sm font-semibold">Сводка заказа</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-3">
                {vendorGroups.map((g) => (
                  <div key={g.vendorId} className="border-b pb-2 text-xs">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{g.vendorName}</div>
                    <div className="text-slate-500">
                      {g.items.length} поз. · {(g.totalWeightKg / 1000).toFixed(2)} т
                    </div>
                    <div className="font-mono font-bold text-slate-900 dark:text-slate-100 text-right">
                      {g.grossAmount.toLocaleString()} PLN
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Без НДС:</span>
                  <span className="font-mono">{totalNet.toLocaleString()} PLN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">НДС:</span>
                  <span className="font-mono">{(totalGross - totalNet).toLocaleString()} PLN</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t font-bold text-sm text-slate-900 dark:text-slate-100">
                  <span>Итого:</span>
                  <span className="font-mono text-emerald-600">{totalGross.toLocaleString()} PLN</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
