import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  Trophy,
  Building2,
  Calendar,
  Layers,
  CheckCircle2,
  ShieldCheck,
  FileQuestion,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Package,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRfqsQuery, INITIAL_RFQS } from '@/hooks/useScmQueries';

export const Route = createFileRoute('/supplier/bids/$rfqId/submit')({
  component: SubmitRfqBidPage,
  staticData: {
    crumb: {
      label: 'Submit Tender Bid',
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

interface SupplierItemBid {
  itemId: string;
  isSubstitute: boolean;
  offeredSku: string;
  offeredName: string;
  offeredUnitPrice: number;
  offeredQuantity: number;
  technicalJustification: string;
  complianceNotes: string;
}

export function SubmitRfqBidPage() {
  const { rfqId } = Route.useParams();
  const navigate = useNavigate();
  const { data: rfqs = INITIAL_RFQS } = useRfqsQuery();

  const rfq = useMemo(() => {
    return rfqs.find((r) => r.id === rfqId) || INITIAL_RFQS[0]!;
  }, [rfqs, rfqId]);

  // Buyer requested items specification
  const requestedItems: BuyerRequestedItem[] = useMemo(() => [
    {
      id: 'item-1',
      sku: 'SKU-PAL-01',
      name: 'Standard Wooden Pallets EPAL-1 (1200x800mm)',
      quantity: 1200,
      unit: 'pcs',
      targetUnitPrice: 42.0,
      allowSubstitute: true,
    },
    {
      id: 'item-2',
      sku: 'SKU-STR-05',
      name: 'Industrial Machine Stretch Film 23mic Transparent',
      quantity: 200,
      unit: 'rolls',
      targetUnitPrice: 85.0,
      allowSubstitute: true,
    },
    {
      id: 'item-3',
      sku: 'SKU-BOX-12',
      name: 'Corrugated Heavy Duty 5-Ply Shipping Boxes (600x400x400)',
      quantity: 2500,
      unit: 'pcs',
      targetUnitPrice: 7.2,
      allowSubstitute: false,
    },
  ], []);

  // Supplier's line-by-line bid configuration
  const [bidsByItem, setBidsByItem] = useState<Record<string, SupplierItemBid>>({
    'item-1': {
      itemId: 'item-1',
      isSubstitute: true,
      offeredSku: 'SKU-PAL-02-ECO',
      offeredName: 'Drewnex EcoDry KD Pine Pallet EPAL/UIC Equivalent',
      offeredUnitPrice: 37.5,
      offeredQuantity: 1200,
      technicalJustification:
        'Kiln-dried pine timber (<18% moisture vs requested <22%). Heat treated per ISPM-15. Certified UIC 435-2.',
      complianceNotes: 'Higher dynamic load capacity (1800kg vs 1500kg spec)',
    },
    'item-2': {
      itemId: 'item-2',
      isSubstitute: false,
      offeredSku: 'SKU-STR-05',
      offeredName: 'Industrial Machine Stretch Film 23mic Transparent',
      offeredUnitPrice: 79.0,
      offeredQuantity: 200,
      technicalJustification: 'Exact factory OEM match from stock in Central Warehouse Katowice.',
      complianceNotes: 'Guaranteed 300% elongation, 16.2kg gross roll weight',
    },
    'item-3': {
      itemId: 'item-3',
      isSubstitute: false,
      offeredSku: 'SKU-BOX-12',
      offeredName: 'Corrugated Heavy Duty 5-Ply Shipping Boxes (600x400x400)',
      offeredUnitPrice: 6.8,
      offeredQuantity: 2500,
      technicalJustification: 'Exact spec match. Palletized on EPAL with protective top sheet.',
      complianceNotes: 'Strict dimensions guaranteed, burst strength 1280 kPa',
    },
  });

  const [leadTimeDays, setLeadTimeDays] = useState(4);
  const [warrantyTerms, setWarrantyTerms] = useState('24 Months Comprehensive B2B Warranty');
  const [supplierNotes, setSupplierNotes] = useState(
    'All items available for unified dispatch from our Katowice logistics terminal. Transport via certified Euro-6 fleet.'
  );

  // Totals Calculation
  const totalOfferedAmount = useMemo(() => {
    return Object.values(bidsByItem).reduce(
      (acc, bid) => acc + bid.offeredUnitPrice * bid.offeredQuantity,
      0
    );
  }, [bidsByItem]);

  const targetBudgetTotal = useMemo(() => {
    return requestedItems.reduce((acc, item) => acc + item.quantity * item.targetUnitPrice, 0);
  }, [requestedItems]);

  const totalSavings = targetBudgetTotal - totalOfferedAmount;
  const savingsPercent = Math.round((totalSavings / targetBudgetTotal) * 100);

  const handleUpdateItemBid = (itemId: string, field: keyof SupplierItemBid, value: any) => {
    setBidsByItem((prev) => {
      const current = prev[itemId] || {
        itemId,
        isSubstitute: false,
        offeredSku: '',
        offeredName: '',
        offeredUnitPrice: 0,
        offeredQuantity: 0,
        technicalJustification: '',
        complianceNotes: '',
      };
      return {
        ...prev,
        [itemId]: { ...current, [field]: value },
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(
      `Commercial Proposal of ${totalOfferedAmount.toLocaleString()} PLN submitted to buyer! (Savings: ${savingsPercent}%, Kafka: RfqBidSubmittedEvent)`
    );
    navigate({ to: '/supplier/bids/board' });
  };

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/supplier/bids/board"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Tender Board
        </Link>
        <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">
          Screen P19: Itemized Commercial Quotation & Substitute Pairing
        </Badge>
      </div>

      {/* Target RFQ Summary Card */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-2xs">
        <CardHeader className="py-3 px-5 border-b bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {rfq.rfqNumber}
            </span>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
              Substitutes Allowed
            </Badge>
          </div>
          <CardTitle className="text-base font-semibold mt-1">{rfq.title}</CardTitle>
          <p className="text-xs text-slate-500">{rfq.description}</p>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Buyer Target Budget:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
              {targetBudgetTotal.toLocaleString()} {rfq.currency}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Required Positions:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {requestedItems.length} distinct line items
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Delivery Destination:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {rfq.deliveryLocation}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Deadline:</span>
            <span className="font-medium text-amber-600 dark:text-amber-400 font-mono">
              {rfq.deadline}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Form for Itemized Quotation */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Layers className="h-4 w-4 text-amber-600" />
                Line-by-Line Item Pricing & Substitute Pairing
              </h2>
              <p className="text-2xs text-slate-500">
                For each requested position, specify whether you quote the original SKU or offer a certified alternative substitute product.
              </p>
            </div>
            <Badge variant="outline" className="text-2xs text-slate-600">
              Multi-Position Bidding Engine
            </Badge>
          </div>

          {/* Itemized Cards */}
          <div className="space-y-4">
            {requestedItems.map((req, idx) => {
              const currentBid = bidsByItem[req.id] || {
                itemId: req.id,
                isSubstitute: false,
                offeredSku: req.sku,
                offeredName: req.name,
                offeredUnitPrice: req.targetUnitPrice * 0.95,
                offeredQuantity: req.quantity,
                technicalJustification: '',
                complianceNotes: '',
              };

              const lineTotal = currentBid.offeredUnitPrice * currentBid.offeredQuantity;
              const targetLineTotal = req.quantity * req.targetUnitPrice;
              const lineSavings = targetLineTotal - lineTotal;
              const lineSavingsPercent = Math.round((lineSavings / targetLineTotal) * 100);

              return (
                <Card
                  key={req.id}
                  className={`border transition-all ${
                    currentBid.isSubstitute
                      ? 'border-indigo-300 dark:border-indigo-800 bg-indigo-50/10'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <CardHeader className="py-3 px-4 bg-slate-50/80 dark:bg-slate-900/60 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-2xs font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        Item #{idx + 1}
                      </span>
                      <div>
                        <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                          {req.name}
                        </div>
                        <div className="text-2xs text-slate-500 font-mono">
                          Target: {req.quantity} {req.unit} @ {req.targetUnitPrice.toFixed(2)} PLN (Budget: {targetLineTotal.toLocaleString()} PLN)
                        </div>
                      </div>
                    </div>

                    {/* Proposal Type Selector */}
                    <div className="flex items-center gap-2">
                      {req.allowSubstitute ? (
                        <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-white dark:bg-slate-950 text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              handleUpdateItemBid(req.id, 'isSubstitute', false);
                              handleUpdateItemBid(req.id, 'offeredSku', req.sku);
                              handleUpdateItemBid(req.id, 'offeredName', req.name);
                            }}
                            className={`px-2.5 py-1 rounded-md text-2xs font-semibold transition-all ${
                              !currentBid.isSubstitute
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Exact Match
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleUpdateItemBid(req.id, 'isSubstitute', true);
                              handleUpdateItemBid(req.id, 'offeredSku', `${req.sku}-SUB`);
                              handleUpdateItemBid(req.id, 'offeredName', `Alternative Certified ${req.name}`);
                            }}
                            className={`px-2.5 py-1 rounded-md text-2xs font-semibold transition-all flex items-center gap-1 ${
                              currentBid.isSubstitute
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <RefreshCw className="h-3 w-3" />
                            <span>Offer Substitute</span>
                          </button>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-2xs text-slate-500">
                          Substitutes Not Allowed (Exact Only)
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 space-y-3 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="md:col-span-2 space-y-1">
                        <Label className="text-2xs font-semibold">
                          {currentBid.isSubstitute ? 'Proposed Substitute Product Name:' : 'Product Description:'}
                        </Label>
                        <Input
                          value={currentBid.offeredName}
                          aria-label={`Наименование товара для позиции ${idx + 1}`}
                          onChange={(e) => handleUpdateItemBid(req.id, 'offeredName', e.target.value)}
                          className="h-8 text-xs font-semibold"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-2xs font-semibold">Supplier Offered SKU:</Label>
                        <Input
                          value={currentBid.offeredSku}
                          aria-label={`Артикул SKU для позиции ${idx + 1}`}
                          onChange={(e) => handleUpdateItemBid(req.id, 'offeredSku', e.target.value)}
                          className="h-8 text-xs font-mono tabular-nums"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-2xs font-semibold">Offered Unit Price (PLN):</Label>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            step={0.1}
                            min={0.1}
                            value={currentBid.offeredUnitPrice}
                            aria-label={`Отпускная цена за единицу PLN для позиции ${idx + 1}`}
                            onChange={(e) =>
                              handleUpdateItemBid(req.id, 'offeredUnitPrice', Number(e.target.value))
                            }
                            className="h-8 text-xs font-mono tabular-nums font-bold text-right"
                            required
                          />
                          <span className="text-2xs font-mono text-slate-400">PLN</span>
                        </div>
                      </div>
                    </div>

                    {/* If Substitute is selected: show technical justification inputs */}
                    {currentBid.isSubstitute && (
                      <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/50 rounded-lg space-y-2">
                        <div className="flex items-center gap-1.5 text-indigo-900 dark:text-indigo-200 font-bold text-2xs uppercase">
                          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                          Substitute Equivalence & Technical Justification:
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <Input
                            value={currentBid.technicalJustification}
                            aria-label={`Техническое обоснование эквивалентности для позиции ${idx + 1}`}
                            onChange={(e) =>
                              handleUpdateItemBid(req.id, 'technicalJustification', e.target.value)
                            }
                            placeholder="E.g. Material grade, humidity limits, certified standards..."
                            className="h-7 text-xs bg-white dark:bg-slate-900"
                            required
                          />
                          <Input
                            value={currentBid.complianceNotes}
                            aria-label={`Сертификаты и стандарты соответствия для позиции ${idx + 1}`}
                            onChange={(e) =>
                              handleUpdateItemBid(req.id, 'complianceNotes', e.target.value)
                            }
                            placeholder="E.g. Load capacity advantage (+15%), ISPM-15 phytosanitary cert attached..."
                            className="h-7 text-xs bg-white dark:bg-slate-900"
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* Position Summary Bar */}
                    <div className="flex flex-wrap items-center justify-between pt-2 border-t text-2xs text-slate-500">
                      <div>
                        Quoting <strong>{currentBid.offeredQuantity} {req.unit}</strong> @ {currentBid.offeredUnitPrice.toFixed(2)} PLN/unit
                      </div>
                      <div className="flex items-center gap-3">
                        {lineSavings > 0 ? (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <TrendingDown className="h-3 w-3" />
                            Saves {lineSavings.toLocaleString()} PLN ({lineSavingsPercent}% vs target)
                          </span>
                        ) : (
                          <span className="text-slate-500">Standard market quotation</span>
                        )}
                        <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                          {lineTotal.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
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
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="py-3 px-4 border-b">
            <CardTitle className="text-xs uppercase font-bold text-slate-500">
              Commercial Terms, SLA & Lead Time
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Guaranteed Lead Time (Business Days):</Label>
              <Input
                type="number"
                min={1}
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                className="h-8 font-mono text-xs font-bold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Warranty & SLA Conditions:</Label>
              <Input
                value={warrantyTerms}
                onChange={(e) => setWarrantyTerms(e.target.value)}
                className="h-8 text-xs"
                required
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold">Proposal Remarks & Logistics Dispatch Notes:</Label>
              <Input
                value={supplierNotes}
                onChange={(e) => setSupplierNotes(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Final Financial Summary Bar */}
        <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div>
            <span className="text-2xs uppercase tracking-wider text-slate-400 font-semibold block">
              Total Proposed Commercial Quotation:
            </span>
            <div className="text-2xl font-mono font-extrabold text-white">
              {totalOfferedAmount.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
            </div>
            <div className="text-2xs text-emerald-400 flex items-center gap-1 mt-0.5">
              <TrendingDown className="h-3.5 w-3.5" />
              <span>
                Total Buyer Savings: {totalSavings.toLocaleString()} PLN ({savingsPercent}% below target budget)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: '/supplier/bids/board' })}
              className="bg-transparent text-white border-slate-700 hover:bg-slate-800 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-amber-600 hover:bg-amber-700 text-white gap-2 font-bold text-xs shadow-md"
            >
              <Trophy className="h-4 w-4" />
              Submit Commercial Offer to Buyer
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default SubmitRfqBidPage;
