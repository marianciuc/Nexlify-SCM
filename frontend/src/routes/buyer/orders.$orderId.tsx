import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  FileText,
  Download,
  AlertTriangle,
  Building2,
  Calendar,
  Radio,
  User,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOrdersQuery, INITIAL_ORDERS } from '@/hooks/useScmQueries';
import type { OrderStatus, IncotermsCode } from '@/types/scm-domain';

export const Route = createFileRoute('/buyer/orders/$orderId')({
  component: OrderDetailPage,
  staticData: {
    crumb: {
      label: 'Order Details & Lifecycle',
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
  { status: 'DRAFT', label: '1. Draft', category: 'HAPPY_PATH', desc: 'Koszyk B2B skompletowany' },
  { status: 'SUBMITTED', label: '2. Submitted', category: 'HAPPY_PATH', desc: 'Złożone do Sagi Kafka (order-events)' },
  { status: 'RESERVED', label: '3. Reserved', category: 'HAPPY_PATH', desc: 'Redisson soft-lock w magazynie WMS' },
  { status: 'AWAITING_PAYMENT', label: '4. Awaiting Payment', category: 'HAPPY_PATH', desc: 'Weryfikacja limitu kupieckiego / MPP' },
  { status: 'PAID', label: '5. Paid / Verified', category: 'HAPPY_PATH', desc: 'Płatność potwierdzona / Kredyt Net 30' },
  { status: 'IN_PROCESSING', label: '6. In Processing', category: 'HAPPY_PATH', desc: 'Kompletacja i pakowanie palet w WMS' },
  { status: 'SHIPPED', label: '7. In Transit', category: 'HAPPY_PATH', desc: 'Wydanie TMS (e-CMR) i transport drogowy' },
  { status: 'DELIVERED', label: '8. Delivered', category: 'HAPPY_PATH', desc: 'Dostarczono do rampy rozładunkowej' },
  { status: 'COMPLETED', label: '9. Completed', category: 'HAPPY_PATH', desc: 'Podpisano e-CMR na szkle / Zamknięto' },
  // Exceptions & Alternate Branches
  { status: 'CANCELLED_OUT_OF_STOCK', label: 'Out of Stock', category: 'EXCEPTION', desc: 'Kompensacja Sagi: brak zapasów' },
  { status: 'PAYMENT_FAILED', label: 'Payment Failed', category: 'EXCEPTION', desc: 'Odrzucenie autoryzacji płatności' },
  { status: 'DISPUTED', label: 'Disputed (RMA)', category: 'EXCEPTION', desc: 'Protokół szkody / Reklamacja kupca' },
  { status: 'CANCELLED', label: 'Cancelled', category: 'TERMINAL', desc: 'Zamówienie anulowane' },
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

function OrderDetailPage() {
  const { orderId } = Route.useParams();
  const { data: orders = INITIAL_ORDERS } = useOrdersQuery();

  const [currentSimulatedStatus, setCurrentSimulatedStatus] = useState<OrderStatus | null>(null);
  const [showRmaDialog, setShowRmaDialog] = useState(false);
  const [rmaReason, setRmaReason] = useState('DAMAGED_CARGO');
  const [rmaItemSku, setRmaItemSku] = useState('');
  const [rmaQty, setRmaQty] = useState(1);
  const [rmaNotes, setRmaNotes] = useState('');

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
    toast.success(`Generated official ${docType} for order ${rawOrder.orderNumber}`);
  };

  const handleFileRma = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentSimulatedStatus('DISPUTED');
    toast.success(`RMA Claim filed. Order moved to DISPUTED status in Arbitration queue.`);
    setShowRmaDialog(false);
    setRmaNotes('');
  };

  const handleSimulateNextStep = () => {
    if (isHappyPath && currentStepIndex < HAPPY_PATH_ORDER.length - 1) {
      const nextStatus = HAPPY_PATH_ORDER[currentStepIndex + 1]!;
      setCurrentSimulatedStatus(nextStatus);
      toast.info(`Saga Orchestrator Transition: ➔ ${nextStatus}`);
    } else {
      setCurrentSimulatedStatus('SUBMITTED');
      toast.info(`Saga Reset: ➔ SUBMITTED`);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/buyer/orders"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Orders
          </Link>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {rawOrder.orderNumber}
            </h1>
            <Badge
              className={`text-xs font-bold px-3 py-1 ${
                activeStatus === 'COMPLETED'
                  ? 'bg-emerald-600 text-white'
                  : activeStatus === 'DISPUTED' || activeStatus === 'CANCELLED' || activeStatus === 'CANCELLED_OUT_OF_STOCK'
                  ? 'bg-rose-600 text-white'
                  : 'bg-indigo-600 text-white'
              }`}
            >
              Status: {activeStatus}
            </Badge>

            <Badge variant="outline" className="text-xs font-mono border-emerald-500 text-emerald-700 bg-emerald-50">
              Incoterms 2020: {rawOrder.incoterms || 'DAP'}
            </Badge>

            <Badge variant="outline" className="text-xs border-blue-500 text-blue-700 bg-blue-50">
              SLA OTIF: {rawOrder.guaranteedOtifPercent || 99.2}%
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Buyer: <strong>{rawOrder.customerName}</strong> • Target: {rawOrder.deliveryCity} ({rawOrder.deliveryAddress || 'DC-01 Depot'})
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            className="text-xs border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 gap-1.5"
            onClick={handleSimulateNextStep}
          >
            <Zap className="h-3.5 w-3.5 text-indigo-600" />
            Simulate Next Saga Step
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-xs border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 gap-1.5"
            onClick={() => setShowRmaDialog(true)}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            File RMA Claim
          </Button>

          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
            onClick={() => handleDownloadDoc('Faktura VAT PDF')}
          >
            <Download className="h-3.5 w-3.5" />
            Faktura VAT
          </Button>
        </div>
      </div>

      {/* Visual Stepper: 13 FSM Lifecycle States */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Order Lifecycle Saga Stepper (13 Domain FSM States)
              </span>
              <p className="text-2xs text-slate-500 mt-0.5">
                Complies with Spec Doc 06 & Spring Boot OrderFsm. Orchestrated via Kafka KRaft order-events.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xs font-medium text-slate-500">Jump to State:</span>
              <select
                value={activeStatus}
                onChange={(e) => setCurrentSimulatedStatus(e.target.value as OrderStatus)}
                className="text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 font-mono font-medium"
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
        <CardContent className="p-6">
          {/* Main Happy Path Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-9 gap-3 relative">
            {HAPPY_PATH_ORDER.map((stepStatus, idx) => {
              const meta = ALL_ORDER_STATUSES.find((s) => s.status === stepStatus)!;
              const isPast = isHappyPath && idx <= currentStepIndex;
              const isCurrent = activeStatus === stepStatus;

              return (
                <div
                  key={stepStatus}
                  onClick={() => setCurrentSimulatedStatus(stepStatus)}
                  className={`flex flex-col items-start p-2 rounded-lg cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-400 ring-1 ring-emerald-400'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-2xs font-bold transition-colors ${
                        isCurrent
                          ? 'bg-emerald-600 text-white shadow-md animate-pulse'
                          : isPast
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isPast && !isCurrent ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                    </div>
                    <span
                      className={`text-2xs font-bold leading-tight ${
                        isCurrent
                          ? 'text-emerald-700 dark:text-emerald-300 font-extrabold'
                          : isPast
                          ? 'text-slate-900 dark:text-slate-100'
                          : 'text-slate-400'
                      }`}
                    >
                      {meta.label.replace(/^\d+\.\s*/, '')}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{meta.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Alternate Branches & Exceptions Bar */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">
              Alternate & Dispute States:
            </span>
            {ALL_ORDER_STATUSES.filter((s) => s.category !== 'HAPPY_PATH').map((s) => {
              const isCurrent = activeStatus === s.status;
              return (
                <button
                  key={s.status}
                  onClick={() => setCurrentSimulatedStatus(s.status)}
                  className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-colors ${
                    isCurrent
                      ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
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
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="py-2.5 px-4">
            <CardTitle className="text-xs uppercase text-slate-500 font-semibold flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-indigo-600" /> Incoterms 2020
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0">
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {rawOrder.incoterms || 'DAP'} Warszawa
            </div>
            <p className="text-2xs text-slate-500 mt-0.5">Delivered at Place (Seller covers transport & risk)</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="py-2.5 px-4">
            <CardTitle className="text-xs uppercase text-slate-500 font-semibold flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-rose-600" /> Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0">
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
              {rawOrder.deliveryAddress || 'ul. Magazynowa 14, Rampa 4'}
            </div>
            <p className="text-2xs text-slate-500 mt-0.5">
              {rawOrder.deliveryPostalCode || '05-090'} {rawOrder.deliveryCity}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="py-2.5 px-4">
            <CardTitle className="text-xs uppercase text-slate-500 font-semibold flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-600" /> Guaranteed SLA
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0">
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Target: {rawOrder.slaTargetDate || '2026-09-26 14:00'}
            </div>
            <p className="text-2xs text-emerald-600 font-medium mt-0.5">
              Max Transit: {rawOrder.slaMaxTransitHours || 24}h • OTIF: {rawOrder.guaranteedOtifPercent || 99.2}%
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="py-2.5 px-4">
            <CardTitle className="text-xs uppercase text-slate-500 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> e-CMR Protocol
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0">
            <div className="text-sm font-bold font-mono text-emerald-600">CMR-PL-2026-9912</div>
            <p className="text-2xs text-slate-500 mt-0.5">Digital Sign-on-Glass Validated</p>
          </CardContent>
        </Card>
      </div>

      {/* Real Interactive Leaflet OpenStreetMap Map */}
      <Card className="border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Truck className="h-4 w-4 text-emerald-600" /> Live Interactive Leaflet TMS Map (GraphHopper 9.x)
          </CardTitle>
          <Badge className="bg-emerald-600 text-white text-xs gap-1">
            <Radio className="h-3 w-3 animate-pulse" /> Live Telematics Stream
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
              name: `${rawOrder.deliveryCity} Commercial Receiving Depot`,
              lat: 54.352,
              lng: 18.6466,
              type: 'DESTINATION',
              eta: '45 min',
            }}
            telematics={{
              driverName: 'Tomasz Lewandowski',
              vehiclePlate: 'WI 49102 (Scania R450)',
              temperatureCelsius: 4.2,
              etaRemaining: '45 min',
              glecCo2Kg: 38.4,
            }}
          />
        </CardContent>
      </Card>

      {/* Line Items & Commercial Documentation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-600" /> Order Specification & Line Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b text-slate-600 dark:text-slate-400">
                  <tr>
                    <th className="py-3 px-4">SKU / Item</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4">Unit Net</th>
                    <th className="py-3 px-4">VAT (23%)</th>
                    <th className="py-3 px-4 text-right">Total Gross</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rawOrder.items?.map((item) => {
                    const lineNet = item.unitPrice * item.quantity;
                    const lineVat = lineNet * 0.23;
                    const lineGross = lineNet + lineVat;
                    return (
                      <tr key={item.sku}>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</div>
                          <div className="font-mono text-2xs text-slate-500">{item.sku}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-medium">{item.quantity} units</td>
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

              <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t flex justify-between items-center text-sm font-bold">
                <span>Grand Total Gross:</span>
                <span className="font-mono text-emerald-600">{rawOrder.totalAmount.toLocaleString()} PLN</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-600" /> B2B Commercial Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {[
                { name: 'Electronic Consignment Note (e-CMR)', type: 'PDF / XML', desc: 'Legally signed on glass' },
                { name: 'Faktura VAT (Invoice)', type: 'PDF (KSeF ready)', desc: 'Due date: Net 30 days' },
                { name: 'Warehouse Packing Slip', type: 'PDF', desc: 'Scan verification codes' },
                { name: 'Certificate of Origin & ISPM-15', type: 'PDF', desc: 'Phytosanitary HT stamp' },
              ].map((doc, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{doc.name}</div>
                    <div className="text-2xs text-slate-500">{doc.desc}</div>
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
            <DialogTitle className="flex items-center gap-2 text-base text-amber-700">
              <ShieldAlert className="h-5 w-5" /> File RMA Claim / Cargo Discrepancy
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFileRma} className="space-y-4 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Claim Reason:</Label>
              <select
                value={rmaReason}
                onChange={(e) => setRmaReason(e.target.value)}
                className="w-full p-2 border rounded-md bg-white dark:bg-slate-900"
              >
                <option value="DAMAGED_CARGO">Damaged Cargo / Transport Fracture</option>
                <option value="SHORTAGE">Quantity Shortage (Delivered less than e-CMR)</option>
                <option value="WRONG_SKU">Wrong Item / Warehouse Picking Discrepancy</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Affected Item SKU:</Label>
              <select
                value={rmaItemSku}
                onChange={(e) => setRmaItemSku(e.target.value)}
                className="w-full p-2 border rounded-md bg-white dark:bg-slate-900"
              >
                <option value="">Select SKU from order...</option>
                {rawOrder.items?.map((i) => (
                  <option key={i.sku} value={i.sku}>
                    {i.sku} - {i.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Discrepancy Quantity:</Label>
              <Input
                type="number"
                min="1"
                value={rmaQty}
                onChange={(e) => setRmaQty(Number(e.target.value))}
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Detailed Incident Report & Photos:</Label>
              <Input
                placeholder="Describe carton damage or missing pallet seal..."
                value={rmaNotes}
                onChange={(e) => setRmaNotes(e.target.value)}
                className="text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowRmaDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                Submit Claim to Arbitration
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OrderDetailPage;
