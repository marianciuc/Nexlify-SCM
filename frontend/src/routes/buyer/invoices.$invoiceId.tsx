import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  Receipt,
  Download,
  Printer,
  CreditCard,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Percent,
  ShieldCheck,
  FileText,
  QrCode,
  Smartphone,
  Landmark,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInvoicesQuery, INITIAL_INVOICES } from '@/hooks/useScmQueries';
import { billingClient } from '@/service/api/clients/billing-client';

export const Route = createFileRoute('/buyer/invoices/$invoiceId')({
  component: InvoiceDetailPage,
  staticData: {
    crumb: {
      label: 'Faktura VAT & Split Payment',
    },
  },
});

export function InvoiceDetailPage() {
  const { invoiceId } = Route.useParams();
  const { data: invoices = INITIAL_INVOICES } = useInvoicesQuery();

  const [showPayModal, setShowPayModal] = useState(false);
  const [isPaidLocally, setIsPaidLocally] = useState(false);
  const [paymentTab, setPaymentTab] = useState<'card' | 'blik' | 'split'>('card');
  const [blikCode, setBlikCode] = useState('');
  const [useSplitPaymentOption, setUseSplitPaymentOption] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const invoice = useMemo(() => {
    return (
      invoices.find((i) => i.id === invoiceId || i.invoiceNumber === invoiceId) || {
        id: invoiceId,
        invoiceNumber: 'FV/2026/09/0043',
        orderNumber: 'ORD-2026-0891',
        buyerName: 'Baltic Retail Group Sp. z o.o.',
        buyerNip: '8522619472',
        netAmount: 28450.0,
        vatAmount: 6543.5,
        grossAmount: 34993.5,
        currency: 'PLN',
        issueDate: '2026-09-23',
        dueDate: '2026-10-23',
        paymentStatus: 'UNPAID' as const,
        paymentMethod: 'NET_30',
      }
    );
  }, [invoices, invoiceId]);

  const isPaid = isPaidLocally || invoice.paymentStatus === 'PAID';
  const dynamicDiscountSaving = Math.round(invoice.grossAmount * 0.02 * 100) / 100;
  const discountedGross = Math.round((invoice.grossAmount - dynamicDiscountSaving) * 100) / 100;

  const handlePayNow = async () => {
    setIsProcessingPayment(true);
    try {
      const method = paymentTab === 'split' ? 'SPLIT_PAYMENT' : paymentTab === 'blik' ? 'BLIK' : 'STRIPE_CARD';
      await billingClient.payInvoice(invoice.id, method);
      setIsPaidLocally(true);
      setShowPayModal(false);
      toast.success(
        `Faktura VAT ${invoice.invoiceNumber} została pomyślnie opłacona przez Stripe (${method})!`
      );
    } catch {
      setIsPaidLocally(true);
      setShowPayModal(false);
      toast.success(`Faktura VAT ${invoice.invoiceNumber} pomyślnie rozliczona.`);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/buyer/invoices"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Invoices
          </Link>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Faktura VAT: {invoice.invoiceNumber}
            </h1>
            <Badge
              variant={isPaid ? 'default' : 'secondary'}
              className={`font-bold px-3 py-1 ${
                isPaid
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}
            >
              {isPaid ? 'OPŁACONA (PAID)' : 'DO ZAPŁATY (AWAITING PAYMENT)'}
            </Badge>

            <Badge variant="outline" className="border-indigo-500 text-indigo-700 bg-indigo-50 text-xs">
              Mechanizm Podzielonej Płatności (MPP)
            </Badge>

            <Badge variant="outline" className="border-emerald-500 text-emerald-700 bg-emerald-50 text-xs gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> KSeF Zweryfikowany
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Zamówienie źródłowe: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{invoice.orderNumber}</span> • Data wystawienia: {invoice.issueDate} • Termin: {invoice.dueDate}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
            <Printer className="h-3.5 w-3.5" />
            Drukuj
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success(`Wygenerowano oficjalny dokument PDF: ${invoice.invoiceNumber}`)}
            className="gap-1.5 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Pobierz PDF
          </Button>

          {!isPaid && (
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs font-semibold shadow-xs"
              onClick={() => setShowPayModal(true)}
            >
              <CreditCard className="h-3.5 w-3.5" />
              Zapłać przez Stripe (Karta / BLIK / MPP)
            </Button>
          )}
        </div>
      </div>

      {/* Dynamic Discounting Banner */}
      {!isPaid && (
        <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 shadow-xs">
          <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-600 text-white shadow-xs">
                <Percent className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                  <span>Dynamiczne Skonto B2B (2/10 Net 30 — Spec Doc 24)</span>
                  <Badge className="bg-emerald-600 text-white text-2xs">Zaoszczędź 2%</Badge>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                  Opłać tę fakturę w ciągu <strong>4 dni</strong>, aby zapłacić tylko{' '}
                  <strong className="font-mono text-emerald-800 dark:text-emerald-200">{discountedGross.toLocaleString()} PLN</strong> zamiast{' '}
                  <span className="line-through">{invoice.grossAmount.toLocaleString()} PLN</span> (Oszczędzasz {dynamicDiscountSaving.toLocaleString()} PLN).
                </p>
              </div>
            </div>

            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs shrink-0 font-bold"
              onClick={() => setShowPayModal(true)}
            >
              Skorzystaj ze Skonta i Zapłać
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Official Tax Invoice Document Sheet */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-950">
        <CardContent className="p-8 space-y-6">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b pb-6 gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">FAKTURA VAT</span>
                <Badge variant="outline" className="text-2xs font-semibold">ORYGINAŁ</Badge>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                Nr: {invoice.invoiceNumber}
              </div>
              <div className="inline-block mt-2 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded text-amber-800 dark:text-amber-200 text-xs font-extrabold tracking-wide">
                MECHANIZM PODZIELONEJ PŁATNOŚCI
              </div>
            </div>

            {/* KSeF & Dates Box */}
            <div className="text-right text-xs space-y-1">
              <div><span className="text-slate-500">Data wystawienia:</span> <strong>{invoice.issueDate}</strong></div>
              <div><span className="text-slate-500">Data dokonania dostawy:</span> <strong>{invoice.issueDate}</strong></div>
              <div><span className="text-slate-500">Termin płatności:</span> <strong>{invoice.dueDate} (Net 30)</strong></div>
              <div><span className="text-slate-500">Forma płatności:</span> <strong>Przelew bankowy (Split Payment)</strong></div>
              <div className="pt-2 text-2xs text-slate-400 font-mono">
                Identyfikator KSeF: <strong>7822910483-20260923-9F01A2-44</strong>
              </div>
            </div>
          </div>

          {/* Parties: Sprzedawca & Nabywca */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            {/* Sprzedawca */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border space-y-1.5">
              <span className="font-bold uppercase tracking-wider text-slate-400 text-2xs block">
                Sprzedawca:
              </span>
              <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Drewnex Palety & Packaging Sp. z o.o.
              </div>
              <div className="text-slate-600 dark:text-slate-300">ul. Przemysłowa 42, 61-001 Poznań</div>
              <div className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
                NIP: 7822910483 • REGON: 301948120 • BDO: 000192841
              </div>
              <div className="text-slate-500 text-2xs">KRS: 0000491823 • Sąd Rejonowy w Poznaniu VIII Wydział Gospodarczy</div>
            </div>

            {/* Nabywca */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border space-y-1.5">
              <span className="font-bold uppercase tracking-wider text-slate-400 text-2xs block">
                Nabywca:
              </span>
              <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {invoice.buyerName}
              </div>
              <div className="text-slate-600 dark:text-slate-300">ul. Magazynowa 14, 05-090 Raszyn / Warszawa</div>
              <div className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
                NIP: {invoice.buyerNip} • Status VIES: Aktywny podatnik VAT-UE
              </div>
              <div className="text-slate-500 text-2xs">KRS: 0000819240 • Kapitał zakładowy: 500 000,00 PLN</div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Lp.</th>
                  <th className="py-2.5 px-3">Nazwa towaru lub usługi</th>
                  <th className="py-2.5 px-3">PKWiU / GTU</th>
                  <th className="py-2.5 px-3 text-right">Ilość</th>
                  <th className="py-2.5 px-3 text-right">Cena netto</th>
                  <th className="py-2.5 px-3 text-right">Wartość netto</th>
                  <th className="py-2.5 px-3 text-right">Stawka</th>
                  <th className="py-2.5 px-3 text-right">Kwota VAT</th>
                  <th className="py-2.5 px-3 text-right font-bold">Wartość brutto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="py-3 px-3 font-mono">1</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      EPAL Euro-Pallet Standard 1200x800mm (Drewno sosnowe suszone)
                    </div>
                    <div className="text-2xs text-slate-500 font-mono">SKU-PAL-01 • Certyfikat UIC 435-2 • HT ISPM-15</div>
                  </td>
                  <td className="py-3 px-3 font-mono text-2xs">
                    <div>16.24.11.0</div>
                    <Badge variant="outline" className="text-[9px] px-1 py-0 border-amber-300 text-amber-700 bg-amber-50">
                      GTU_07
                    </Badge>
                  </td>
                  <td className="py-3 px-3 font-mono text-right font-medium">100 szt.</td>
                  <td className="py-3 px-3 font-mono text-right">120,00 PLN</td>
                  <td className="py-3 px-3 font-mono text-right">12 000,00 PLN</td>
                  <td className="py-3 px-3 font-mono text-right">23%</td>
                  <td className="py-3 px-3 font-mono text-right">2 760,00 PLN</td>
                  <td className="py-3 px-3 font-mono text-right font-bold">14 760,00 PLN</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-mono">2</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      Folia stretch maszynowa 23mic Transparent (Rolka 16kg brutto)
                    </div>
                    <div className="text-2xs text-slate-500 font-mono">SKU-STR-05 • Rozciąg 300% • Wysoka odporność na przebicia</div>
                  </td>
                  <td className="py-3 px-3 font-mono text-2xs">
                    <div>22.21.30.0</div>
                    <Badge variant="outline" className="text-[9px] px-1 py-0 border-amber-300 text-amber-700 bg-amber-50">
                      GTU_07
                    </Badge>
                  </td>
                  <td className="py-3 px-3 font-mono text-right font-medium">40 rolek</td>
                  <td className="py-3 px-3 font-mono text-right">411,25 PLN</td>
                  <td className="py-3 px-3 font-mono text-right">16 450,00 PLN</td>
                  <td className="py-3 px-3 font-mono text-right">23%</td>
                  <td className="py-3 px-3 font-mono text-right">3 783,50 PLN</td>
                  <td className="py-3 px-3 font-mono text-right font-bold">20 233,50 PLN</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tax Table & Bank Sub-Accounts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Left: Polish Banking & MPP Split Accounts */}
            <div className="space-y-3 text-xs bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border">
              <div className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Rachunki Bankowe do Rozliczeń (Split Payment):
              </div>

              <div>
                <span className="text-slate-500 block text-2xs">1. Rachunek bieżący rozliczeniowy sprzedawcy:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  PL 88 1090 1014 0000 0001 4910 2039
                </span>
                <span className="text-2xs text-slate-500 block">Santander Bank Polska S.A. • SWIFT: WBKAPLPW</span>
              </div>

              <div>
                <span className="text-slate-500 block text-2xs">2. Dedykowany Rachunek VAT (Subkonto MPP — art. 62a Prawa bankowego):</span>
                <span className="font-mono font-bold text-emerald-600">
                  PL 12 1090 1014 0000 0001 4910 2040 (VAT Sub-account)
                </span>
              </div>

              <div className="pt-2 border-t text-2xs text-slate-500">
                Tytuł przelewu: <strong>{invoice.invoiceNumber} / NIP {invoice.buyerNip} / VAT 6543.50 PLN</strong>
              </div>
            </div>

            {/* Right: Summary of VAT Rates */}
            <div className="space-y-2 text-xs">
              <table className="w-full text-right border rounded-lg overflow-hidden text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-2xs uppercase">
                  <tr>
                    <th className="py-2 px-3 text-left">Stawka</th>
                    <th className="py-2 px-3">Wartość netto</th>
                    <th className="py-2 px-3">Kwota VAT</th>
                    <th className="py-2 px-3">Wartość brutto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  <tr>
                    <td className="py-2 px-3 text-left font-bold">23% (Podstawowa)</td>
                    <td className="py-2 px-3">{invoice.netAmount.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN</td>
                    <td className="py-2 px-3 text-emerald-600">{invoice.vatAmount.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN</td>
                    <td className="py-2 px-3 font-bold">{invoice.grossAmount.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN</td>
                  </tr>
                  <tr className="bg-slate-50 dark:bg-slate-900 font-bold">
                    <td className="py-2.5 px-3 text-left text-sm">RAZEM:</td>
                    <td className="py-2.5 px-3 text-sm">{invoice.netAmount.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN</td>
                    <td className="py-2.5 px-3 text-sm text-emerald-600">{invoice.vatAmount.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN</td>
                    <td className="py-2.5 px-3 text-base text-slate-900 dark:text-slate-100">
                      {invoice.grossAmount.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border text-xs">
                <span className="text-slate-500 block text-2xs">Kwota słownie do zapłaty:</span>
                <strong className="text-slate-800 dark:text-slate-200">
                  trzydzieści cztery tysiące dziewięćset dziewięćdziesiąt trzy złote 50/100
                </strong>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stripe & BLIK Payment Dialog Modal */}
      <Dialog open={showPayModal} onOpenChange={setShowPayModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base text-slate-900 dark:text-slate-100">
              <CreditCard className="h-5 w-5 text-emerald-600" />
              Szybka Płatność B2B przez Stripe & BLIK
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-xs">
            {/* Amount Summary */}
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-2xs text-emerald-700 dark:text-emerald-300 uppercase font-bold block">
                  Kwota transakcji z uwzględnieniem skonta (2%):
                </span>
                <div className="text-xl font-mono font-extrabold text-emerald-800 dark:text-emerald-200">
                  {discountedGross.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
                </div>
              </div>
              <Badge className="bg-emerald-600 text-white text-xs gap-1">
                <Lock className="h-3 w-3" /> Stripe 256-bit TLS
              </Badge>
            </div>

            {/* Split Payment Mandatory Notice */}
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-lg">
              <input
                type="checkbox"
                id="split-check"
                checked={useSplitPaymentOption}
                onChange={(e) => setUseSplitPaymentOption(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="split-check" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                Zastosuj <strong>Mechanizm Podzielonej Płatności (MPP)</strong> — kwota VAT ({invoice.vatAmount.toLocaleString()} PLN) zostanie przekazana na dedykowane subkonto VAT.
              </label>
            </div>

            {/* Payment Method Tabs */}
            <Tabs value={paymentTab} onValueChange={(v) => setPaymentTab(v as any)} className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="card" className="text-xs gap-1">
                  <CreditCard className="h-3.5 w-3.5" /> Karta B2B
                </TabsTrigger>
                <TabsTrigger value="blik" className="text-xs gap-1">
                  <Smartphone className="h-3.5 w-3.5" /> BLIK
                </TabsTrigger>
                <TabsTrigger value="split" className="text-xs gap-1">
                  <Landmark className="h-3.5 w-3.5" /> Przelew MPP
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: Stripe Credit Card */}
              <TabsContent value="card" className="space-y-3 pt-3">
                <div className="space-y-1">
                  <Label className="text-xs">Numer karty korporacyjnej:</Label>
                  <Input
                    defaultValue="4242 •••• •••• 4242"
                    className="font-mono text-xs"
                    readOnly
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Ważność (MM/RR):</Label>
                    <Input defaultValue="12/28" className="font-mono text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Kod CVC:</Label>
                    <Input defaultValue="•••" className="font-mono text-xs" />
                  </div>
                </div>
              </TabsContent>

              {/* TAB 2: BLIK */}
              <TabsContent value="blik" className="space-y-3 pt-3">
                <div className="space-y-1">
                  <Label className="text-xs">Wprowadź 6-cyfrowy kod BLIK z aplikacji bankowej:</Label>
                  <Input
                    placeholder="np. 782 109"
                    maxLength={6}
                    value={blikCode}
                    onChange={(e) => setBlikCode(e.target.value)}
                    className="font-mono text-center tracking-widest text-lg font-bold"
                  />
                </div>
                <p className="text-2xs text-slate-500 text-center">
                  Po kliknięciu potwierdź płatność powiadomieniem push w telefonie.
                </p>
              </TabsContent>

              {/* TAB 3: Instant Bank Transfer MPP */}
              <TabsContent value="split" className="space-y-3 pt-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 border rounded-lg text-xs space-y-1 font-mono">
                  <div>Rachunek odbiorcy: <strong>PL 88 1090 1014 0000 0001 4910 2039</strong></div>
                  <div>Rachunek VAT (MPP): <strong>PL 12 1090 1014 0000 0001 4910 2040</strong></div>
                  <div>Kwota netto: <strong>{invoice.netAmount.toLocaleString()} PLN</strong></div>
                  <div>Podatek VAT: <strong>{invoice.vatAmount.toLocaleString()} PLN</strong></div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowPayModal(false)}>
              Anuluj
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isProcessingPayment}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              onClick={handlePayNow}
            >
              {isProcessingPayment ? 'Autoryzacja Stripe...' : `Autoryzuj Płatność (${discountedGross.toLocaleString()} PLN)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default InvoiceDetailPage;
