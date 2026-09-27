import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState } from 'react';
import {
  ChevronLeft,
  CheckCircle2,
  MapPin,
  Truck,
  CreditCard,
  FileCheck,
  ShieldCheck,
  Building2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCartStore } from '@/service/cart/cart-store';
import { useCreateOrderMutation } from '@/hooks/useScmQueries';

export const Route = createFileRoute('/buyer/checkout')({
  component: BuyerCheckoutPage,
  staticData: {
    crumb: {
      label: 'Checkout',
    },
  },
});

const PRESET_ADDRESSES = [
  {
    id: 'addr-waw-01',
    name: 'Warszawa Central Hub (Gate 4)',
    address: 'ul. Magazynowa 14, 05-090 Raszyn / Warszawa',
    city: 'Warszawa',
    contactPerson: 'Marek Wiśniewski (+48 22 819 40 21)',
    hasRamp: true,
  },
  {
    id: 'addr-wro-02',
    name: 'Wrocław Distribution Park (Building B)',
    address: 'ul. Logistyczna 8, 55-040 Kobierzyce / Wrocław',
    city: 'Wrocław',
    contactPerson: 'Karol Dąbrowski (+48 71 391 12 00)',
    hasRamp: true,
  },
  {
    id: 'addr-gda-03',
    name: 'Baltic Logistics Terminal Gdańsk',
    address: 'ul. Sucharskiego 70, 80-601 Gdańsk Port',
    city: 'Gdańsk',
    contactPerson: 'Anna Kowalska (+48 58 721 99 44)',
    hasRamp: false,
  },
];

function BuyerCheckoutPage() {
  const navigate = useNavigate();
  const { items, getVendorGroups, getTotalGross, getTotalNet, clearCart } = useCartStore();
  const createOrderMutation = useCreateOrderMutation();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [selectedAddressId, setSelectedAddressId] = useState<string>('addr-waw-01');
  const [deliveryWindow, setDeliveryWindow] = useState<'STANDARD' | 'MORNING' | 'AFTERNOON'>('STANDARD');
  const [needTailgateLift, setNeedTailgateLift] = useState<boolean>(true);
  const [incoterms, setIncoterms] = useState<'DAP' | 'EXW'>('DAP');
  const [paymentMethod, setPaymentMethod] = useState<'TRADE_CREDIT_NET30' | 'STRIPE_CARD' | 'SPLIT_30_70'>(
    'TRADE_CREDIT_NET30'
  );
  const [orderNotes, setOrderNotes] = useState<string>('');

  const selectedAddress = PRESET_ADDRESSES.find((a) => a.id === selectedAddressId) || PRESET_ADDRESSES[0]!;
  const vendorGroups = getVendorGroups();
  const totalGross = getTotalGross();
  const totalNet = getTotalNet();

  const handleCompleteOrder = async () => {
    try {
      await createOrderMutation.mutateAsync({
        customerName: 'Baltic Retail Group Sp. z o.o.',
        deliveryCity: selectedAddress.city,
        totalAmount: totalGross,
        items: items.map((i) => ({
          sku: i.sku,
          name: i.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      });

      clearCart();
      toast.success('B2B Multi-Vendor Order successfully confirmed! Kafka Saga initiated.');
      navigate({ to: '/buyer/orders' });
    } catch {
      toast.error('Failed to create order');
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/buyer/cart"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Return to Cart
        </Link>
        <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">
          Screen P05B: 4-Step B2B Checkout
        </Badge>
      </div>

      {/* Stepper Header */}
      <div className="grid grid-cols-4 gap-2 bg-slate-100 dark:bg-slate-900 p-2 rounded-xl text-xs font-semibold">
        {[
          { num: 1, label: 'Delivery Address', icon: MapPin },
          { num: 2, label: 'Logistics & Slots', icon: Truck },
          { num: 3, label: 'Payment Terms', icon: CreditCard },
          { num: 4, label: 'Review & Sign', icon: FileCheck },
        ].map((s) => {
          const Icon = s.icon;
          const isActive = step === s.num;
          const isCompleted = step > s.num;
          return (
            <button
              key={s.num}
              onClick={() => s.num < step && setStep(s.num as any)}
              disabled={s.num > step}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-xs'
                  : isCompleted
                  ? 'text-slate-700 dark:text-slate-300 hover:text-emerald-600'
                  : 'text-slate-400 opacity-60 cursor-not-allowed'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-2xs font-bold ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : isCompleted
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : s.num}
              </div>
              <span className="hidden sm:inline">{s.label}</span>
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
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-600" /> Select Delivery Hub & Unloading Ramp
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {PRESET_ADDRESSES.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedAddressId === addr.id
                          ? 'border-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                            {addr.name}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {addr.address}
                          </div>
                          <div className="text-2xs text-slate-500 mt-1">Contact: {addr.contactPerson}</div>
                        </div>
                        <Badge variant={addr.hasRamp ? 'default' : 'secondary'} className="text-xs">
                          {addr.hasRamp ? 'Dock Ramp Available' : 'Ground Level'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                    onClick={() => setStep(2)}
                  >
                    Continue to Logistics Terms <ArrowRight className="h-4 w-4" />
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
                  <Truck className="h-4 w-4 text-emerald-600" /> Logistics, Incoterms & Delivery Windows
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Incoterms Commercial Rule:
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => setIncoterms('DAP')}
                      className={`p-3 rounded-xl border cursor-pointer ${
                        incoterms === 'DAP'
                          ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="font-semibold text-sm">DAP (Delivered at Place)</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Supplier arranges freight and bears all transport risks until destination.
                      </div>
                    </div>
                    <div
                      onClick={() => setIncoterms('EXW')}
                      className={`p-3 rounded-xl border cursor-pointer ${
                        incoterms === 'EXW'
                          ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="font-semibold text-sm">EXW (Ex-Works / Self-Pickup)</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Buyer dispatches own carrier to supplier distribution warehouse.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Preferred Unloading Time Window:
                  </Label>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    {[
                      { id: 'STANDARD', title: 'Anytime (08:00 - 18:00)', desc: 'Standard delivery' },
                      { id: 'MORNING', title: 'Morning (07:00 - 12:00)', desc: 'Priority morning slot' },
                      { id: 'AFTERNOON', title: 'Afternoon (12:00 - 17:00)', desc: 'Afternoon cross-dock' },
                    ].map((w) => (
                      <div
                        key={w.id}
                        onClick={() => setDeliveryWindow(w.id as any)}
                        className={`p-3 rounded-xl border cursor-pointer text-center ${
                          deliveryWindow === w.id
                            ? 'border-emerald-600 bg-emerald-50/40 font-semibold text-emerald-800'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600'
                        }`}
                      >
                        <div>{w.title}</div>
                        <div className="text-2xs text-slate-400 mt-1">{w.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="text-xs font-semibold">Hydraulic Tailgate Lift Required</div>
                    <div className="text-2xs text-slate-500">Enable if unloading facility lacks high dock</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={needTailgateLift}
                    onChange={(e) => setNeedTailgateLift(e.target.checked)}
                    className="h-4 w-4 text-emerald-600 rounded"
                  />
                </div>

                <div className="pt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                    onClick={() => setStep(3)}
                  >
                    Continue to Payment Terms <ArrowRight className="h-4 w-4" />
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
                  <CreditCard className="h-4 w-4 text-emerald-600" /> B2B Payment & Trade Credit Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {/* Option 1: B2B Trade Credit Net 30 */}
                  <div
                    onClick={() => setPaymentMethod('TRADE_CREDIT_NET30')}
                    className={`p-4 rounded-xl border cursor-pointer ${
                      paymentMethod === 'TRADE_CREDIT_NET30'
                        ? 'border-emerald-600 bg-emerald-50/30 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <span>B2B Trade Credit (Net 30 Days Deferred Payment)</span>
                          <Badge className="bg-emerald-600 text-white text-2xs">Recommended</Badge>
                        </div>
                        <p className="text-xs text-slate-500">
                          Invoice will be issued upon dispatch with 30-day payment term. Approved platform credit limit available: <strong>150,000 PLN</strong>.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Option 2: Split Payment 30/70 */}
                  <div
                    onClick={() => setPaymentMethod('SPLIT_30_70')}
                    className={`p-4 rounded-xl border cursor-pointer ${
                      paymentMethod === 'SPLIT_30_70'
                        ? 'border-emerald-600 bg-emerald-50/30 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                        Milestone Split Payment (30% Advance / 70% Upon e-CMR Delivery)
                      </div>
                      <p className="text-xs text-slate-500">
                        30% advance required to initiate warehouse picking; remaining 70% triggered automatically upon driver digital sign-on-glass.
                      </p>
                    </div>
                  </div>

                  {/* Option 3: Immediate Stripe Card / SEPA */}
                  <div
                    onClick={() => setPaymentMethod('STRIPE_CARD')}
                    className={`p-4 rounded-xl border cursor-pointer ${
                      paymentMethod === 'STRIPE_CARD'
                        ? 'border-emerald-600 bg-emerald-50/30 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                        Instant Online Card / SEPA B2B Transfer (Stripe)
                      </div>
                      <p className="text-xs text-slate-500">
                        Secure instant clearing. Qualifies for immediate 2% dynamic prepayment discount.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                    onClick={() => setStep(4)}
                  >
                    Review Final Order <ArrowRight className="h-4 w-4" />
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
                  <FileCheck className="h-4 w-4 text-emerald-600" /> Final Order Confirmation & Saga Dispatch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl space-y-3 text-xs">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Delivery Address:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 text-right">
                      {selectedAddress.name} ({selectedAddress.address})
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Incoterms & Window:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {incoterms} • {deliveryWindow} Window
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Terms:</span>
                    <span className="font-semibold text-emerald-600">
                      {paymentMethod === 'TRADE_CREDIT_NET30'
                        ? 'B2B Trade Credit (Net 30 Days)'
                        : paymentMethod === 'SPLIT_30_70'
                        ? 'Split Payment 30/70'
                        : 'Stripe Instant Online'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Driver & Dock Notes (Optional):</Label>
                  <Input
                    placeholder="E.g. Check in at security booth with gate code..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    By confirming, you execute a legally binding B2B sales contract under Polish commercial law. The order will initiate an asynchronous <strong>Apache Kafka Saga (scm.orders.order.events.v1)</strong> to reserve inventory and allocate TMS carrier transport.
                  </span>
                </div>

                <div className="pt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(3)}>
                    Back
                  </Button>
                  <Button
                    size="lg"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-bold shadow-sm"
                    onClick={handleCompleteOrder}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Confirm & Execute Order ({totalGross.toLocaleString()} PLN)
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
              <CardTitle className="text-sm font-semibold">Purchase Package Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-3">
                {vendorGroups.map((g) => (
                  <div key={g.vendorId} className="border-b pb-2 text-xs">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{g.vendorName}</div>
                    <div className="text-slate-500">
                      {g.items.length} items • {(g.totalWeightKg / 1000).toFixed(2)} tons
                    </div>
                    <div className="font-mono font-bold text-slate-900 dark:text-slate-100 text-right">
                      {g.grossAmount.toLocaleString()} PLN
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Net Total:</span>
                  <span className="font-mono">{totalNet.toLocaleString()} PLN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">VAT (23%):</span>
                  <span className="font-mono">{(totalGross - totalNet).toLocaleString()} PLN</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t font-bold text-sm text-slate-900 dark:text-slate-100">
                  <span>Grand Total:</span>
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
