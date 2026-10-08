import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import {
  ChevronLeft,
  CheckCircle2,
  MapPin,
  Truck,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  PackageCheck,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { MoneyDisplay } from '@/components/money-display';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocale } from '@/hooks/useLocale';
import { useCreateOrderMutation } from '@/hooks/useScmQueries';
import { useCartStore } from '@/service/cart/cart-store';
import useEnvironmentStore from '@/service/env/environment-store';

export const Route = createFileRoute('/buyer/checkout')({
  component: BuyerCheckoutPage,
  staticData: {
    crumb: {
      label: 'buyer.checkout.crumb',
    },
  },
});

type DeliveryWindow = 'STANDARD' | 'MORNING' | 'AFTERNOON';
type Incoterms = 'DAP' | 'EXW';
type PaymentMethod = 'TRADE_CREDIT_NET30' | 'STRIPE_CARD' | 'SPLIT_30_70';

function BuyerCheckoutPage() {
  const { t } = useLocale();
  const navigate = useNavigate();
  const { items, getVendorGroups, getTotalGross, getTotalNet, clearCart } = useCartStore();
  const createOrderMutation = useCreateOrderMutation();
  const { currentTenant } = useEnvironmentStore();

  // Form State — single page, no wizard
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryWindow, setDeliveryWindow] = useState<DeliveryWindow>('STANDARD');
  const [needTailgateLift, setNeedTailgateLift] = useState<boolean>(false);
  const [incoterms, setIncoterms] = useState<Incoterms>('DAP');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('TRADE_CREDIT_NET30');
  const [orderNotes, setOrderNotes] = useState<string>('');

  const vendorGroups = getVendorGroups();
  const totalGross = getTotalGross();
  const totalNet = getTotalNet();

  const deliveryWindows = useMemo(
    () => [
      { id: 'STANDARD' as DeliveryWindow, title: t('buyer.checkout.window.standard.title'), desc: t('buyer.checkout.window.standard.desc') },
      { id: 'MORNING' as DeliveryWindow, title: t('buyer.checkout.window.morning.title'), desc: t('buyer.checkout.window.morning.desc') },
      { id: 'AFTERNOON' as DeliveryWindow, title: t('buyer.checkout.window.afternoon.title'), desc: t('buyer.checkout.window.afternoon.desc') },
    ],
    [t]
  );

  const paymentOptions = useMemo(
    () => [
      { id: 'TRADE_CREDIT_NET30' as PaymentMethod, title: t('buyer.checkout.payment.net30.title'), desc: t('buyer.checkout.payment.net30.desc') },
      { id: 'SPLIT_30_70' as PaymentMethod, title: t('buyer.checkout.payment.split.title'), desc: t('buyer.checkout.payment.split.desc') },
      { id: 'STRIPE_CARD' as PaymentMethod, title: t('buyer.checkout.payment.card.title'), desc: t('buyer.checkout.payment.card.desc') },
    ],
    [t]
  );

  // Same gating the wizard applied before leaving the address step.
  const canPlaceOrder = deliveryAddress.trim().length > 0 && deliveryCity.trim().length > 0;

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
      toast.error(t('buyer.checkout.error'));
    }
  };

  if (items.length === 0) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto min-w-0 text-center py-16">
        <Card className="p-8 border-dashed border-2 border-border bg-card">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
            <Truck className="h-8 w-8" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            {t('buyer.cart.empty.title')}
          </h2>
          <p className="text-sm text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
            {t('buyer.cart.empty.description')}
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild size="sm" className="gap-2">
              <Link to="/buyer/catalog" search={{ q: '', category: 'ALL', brand: 'ALL', manufacturer: 'ALL', stock: 'ALL' }}>
                {t('buyer.cart.empty.goToCatalog')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto min-w-0">
      <div>
        <Link
          to="/buyer/cart"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          {t('buyer.checkout.backToCart')}
        </Link>
      </div>

      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <PackageCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            {t('buyer.checkout.title')}
          </span>
        }
        subtitle={t('buyer.checkout.subtitle')}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Delivery address, logistics conditions, payment preference */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery address */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                {t('buyer.checkout.address.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="delivery-address">{t('buyer.checkout.address.streetLabel')}</Label>
                  <Input
                    id="delivery-address"
                    autoComplete="street-address"
                    required
                    value={deliveryAddress}
                    onChange={(event) => setDeliveryAddress(event.target.value)}
                    placeholder={t('buyer.checkout.address.streetPlaceholder')}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="delivery-city">{t('buyer.checkout.address.cityLabel')}</Label>
                  <Input
                    id="delivery-city"
                    autoComplete="address-level2"
                    required
                    value={deliveryCity}
                    onChange={(event) => setDeliveryCity(event.target.value)}
                    placeholder={t('buyer.checkout.address.cityPlaceholder')}
                  />
                </div>
                <p className="self-end text-xs text-muted-foreground">
                  {t('buyer.checkout.address.hint')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Logistics conditions */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" aria-hidden="true" />
                {t('buyer.checkout.logistics.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  {t('buyer.checkout.logistics.incotermsLabel')}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label={t('buyer.checkout.logistics.incotermsAria')}>
                  {([
                    { id: 'DAP' as Incoterms, title: t('buyer.checkout.incoterms.dap.title'), desc: t('buyer.checkout.incoterms.dap.desc') },
                    { id: 'EXW' as Incoterms, title: t('buyer.checkout.incoterms.exw.title'), desc: t('buyer.checkout.incoterms.exw.desc') },
                  ]).map((opt) => (
                    <label
                      key={opt.id}
                      className={`relative block p-3 rounded-lg border cursor-pointer focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-colors ${
                        incoterms === opt.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-card hover:border-primary/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="incoterms"
                        value={opt.id}
                        checked={incoterms === opt.id}
                        onChange={() => setIncoterms(opt.id)}
                        className="sr-only"
                      />
                      <div className="font-semibold text-sm text-foreground">{opt.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{opt.desc}</div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  {t('buyer.checkout.logistics.windowLabel')}
                </span>
                <div className="grid grid-cols-3 gap-3 text-xs" role="radiogroup" aria-label={t('buyer.checkout.logistics.windowAria')}>
                  {deliveryWindows.map((w) => (
                    <label
                      key={w.id}
                      className={`relative block p-3 rounded-lg border cursor-pointer text-center focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-colors ${
                        deliveryWindow === w.id
                          ? 'border-primary bg-primary/5 font-semibold text-foreground'
                          : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery-window"
                        value={w.id}
                        checked={deliveryWindow === w.id}
                        onChange={() => setDeliveryWindow(w.id)}
                        className="sr-only"
                      />
                      <div>{w.title}</div>
                      <div className="text-[11px] text-muted-foreground mt-1 font-normal">{w.desc}</div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 p-3.5 bg-muted/40 rounded-lg border border-border">
                <input
                  id="tailgate-lift"
                  type="checkbox"
                  checked={needTailgateLift}
                  onChange={(e) => setNeedTailgateLift(e.target.checked)}
                  className="h-4 w-4 rounded text-primary focus:ring-ring"
                />
                <Label htmlFor="tailgate-lift" className="cursor-pointer flex-1">
                  <span className="block text-xs font-semibold text-foreground">{t('buyer.checkout.tailgate.label')}</span>
                  <span className="block text-[11px] text-muted-foreground font-normal">{t('buyer.checkout.tailgate.hint')}</span>
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Payment preference */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" aria-hidden="true" />
                {t('buyer.checkout.payment.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3" role="radiogroup" aria-label={t('buyer.checkout.payment.ariaLabel')}>
                {paymentOptions.map((opt) => (
                  <label
                    key={opt.id}
                    className={`relative block p-4 rounded-lg border cursor-pointer focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-colors ${
                      paymentMethod === opt.id
                        ? 'border-primary bg-primary/5 shadow-xs'
                        : 'border-border bg-card hover:border-primary/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment-method"
                      value={opt.id}
                      checked={paymentMethod === opt.id}
                      onChange={() => setPaymentMethod(opt.id)}
                      className="sr-only"
                    />
                    <div className="font-semibold text-sm text-foreground">{opt.title}</div>
                    <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
                  </label>
                ))}
              </div>

              <div className="space-y-1.5 pt-2">
                <Label htmlFor="order-notes" className="text-xs">
                  {t('buyer.checkout.notes.label')}
                </Label>
                <Input
                  id="order-notes"
                  placeholder={t('buyer.checkout.notes.placeholder')}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="p-3.5 bg-primary/5 border border-primary/25 rounded-lg text-xs text-muted-foreground flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-primary" aria-hidden="true" />
                <span>{t('buyer.checkout.draftNotice')}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Sticky order summary with per-vendor shipment grouping */}
        <div>
          <Card className="lg:sticky lg:top-6 border-border bg-card shadow-xs">
            <CardHeader className="bg-muted/30 border-b border-border py-3.5">
              <CardTitle className="text-sm font-semibold">{t('buyer.checkout.summary.title')}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  {t('buyer.checkout.summary.shipmentsHeading')}
                </span>
                {vendorGroups.map((g) => (
                  <div key={g.vendorId} className="rounded-lg border border-border p-3 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground min-w-0">
                        <Truck className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
                        <span className="truncate">{g.vendorName}</span>
                      </span>
                      <MoneyDisplay amount={g.grossAmount} variant="inline" emphasize className="text-xs" />
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {t('buyer.checkout.group.itemsCount', { count: g.items.length })}
                      {' · '}
                      {t('buyer.checkout.group.weight', { tons: (g.totalWeightKg / 1000).toFixed(2) })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-muted/30 p-3 rounded-lg text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('buyer.cart.summary.net')}</span>
                  <MoneyDisplay amount={totalNet} variant="inline" className="text-xs" />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('buyer.cart.summary.vat')}</span>
                  <MoneyDisplay amount={totalGross - totalNet} variant="inline" className="text-xs" />
                </div>
                <div className="flex justify-between pt-1.5 border-t border-border font-bold text-sm text-foreground">
                  <span>{t('buyer.cart.summary.total')}</span>
                  <MoneyDisplay amount={totalGross} variant="inline" emphasize className="text-sm" />
                </div>
              </div>

              <Button
                size="sm"
                disabled={!canPlaceOrder || createOrderMutation.isPending}
                onClick={handleCompleteOrder}
                className="hidden lg:inline-flex w-full gap-2 font-bold shadow-xs"
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                {createOrderMutation.isPending ? t('buyer.checkout.submitting') : t('buyer.checkout.placeOrder')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sticky place-order bar — always visible on mobile */}
      <div className="lg:hidden sticky bottom-0 z-30 -mx-3 sm:-mx-5 px-3 sm:px-5 py-3 bg-background/95 backdrop-blur border-t border-border flex items-center justify-between gap-3">
        <span aria-label={t('buyer.checkout.totalAria')}>
          <MoneyDisplay amount={totalGross} variant="inline" emphasize className="text-sm" />
        </span>
        <Button
          size="sm"
          disabled={!canPlaceOrder || createOrderMutation.isPending}
          onClick={handleCompleteOrder}
          className="gap-2 font-bold shadow-xs"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          {createOrderMutation.isPending ? t('buyer.checkout.submitting') : t('buyer.checkout.placeOrder')}
        </Button>
      </div>
    </div>
  );
}

export default BuyerCheckoutPage;
