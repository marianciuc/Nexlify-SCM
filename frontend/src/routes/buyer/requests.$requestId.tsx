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
  TrendingDown,
  ArrowRight,
  FileText,
  Package,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useRfqsQuery,
  useCreateOrderMutation,
  INITIAL_RFQS,
} from '@/hooks/useScmQueries';
import type { RfqItem, Bid } from '@/types/scm-domain';

export const Route = createFileRoute('/buyer/requests/$requestId')({
  component: RfqTenderDetailPage,
  staticData: {
    crumb: {
      label: 'Tender Analysis & Bids',
    },
  },
});

interface RequestedBOMItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  unit: string;
  targetUnitPrice: number;
  allowSubstitute: boolean;
  specNotes: string;
}

interface ProposalItemOffer {
  requestedItemId: string;
  requestedSku: string;
  isSubstitute: boolean;
  offeredSku: string;
  offeredName: string;
  offeredUnitPrice: number;
  offeredQuantity: number;
  notes: string;
}

interface EnrichedBid extends Bid {
  itemOffers: ProposalItemOffer[];
}

export function RfqTenderDetailPage() {
  const { requestId } = Route.useParams();
  const navigate = useNavigate();
  const { data: rfqs = INITIAL_RFQS } = useRfqsQuery();
  const createOrderMutation = useCreateOrderMutation();

  const rfq = useMemo(() => {
    return rfqs.find((r) => r.id === requestId) || INITIAL_RFQS[0]!;
  }, [rfqs, requestId]);

  const [awardedBidId, setAwardedBidId] = useState<string | null>(null);

  // Buyer's requested items
  const requestedItems: RequestedBOMItem[] = useMemo(() => [
    {
      id: 'item-1',
      sku: 'SKU-PAL-01',
      name: 'Standard Wooden Pallets EPAL-1 (1200x800mm)',
      quantity: 1200,
      unit: 'pcs',
      targetUnitPrice: 42.0,
      allowSubstitute: true,
      specNotes: 'Kiln-dried pine timber (<22% moisture), ISPM-15 heat treated, dynamic load >=1500kg',
    },
    {
      id: 'item-2',
      sku: 'SKU-STR-05',
      name: 'Industrial Machine Stretch Film 23mic Transparent',
      quantity: 200,
      unit: 'rolls',
      targetUnitPrice: 85.0,
      allowSubstitute: true,
      specNotes: '300% pre-stretch capability, 16kg roll net weight, high puncture resistance',
    },
    {
      id: 'item-3',
      sku: 'SKU-BOX-12',
      name: 'Corrugated Heavy Duty 5-Ply Shipping Boxes (600x400x400)',
      quantity: 2500,
      unit: 'pcs',
      targetUnitPrice: 7.2,
      allowSubstitute: false,
      specNotes: 'BC-flute kraftliner cardboard, burst strength >= 1200 kPa, strict dimensions',
    },
  ], []);

  // Multi-position Proposals from suppliers
  const enrichedBids: EnrichedBid[] = useMemo(() => [
    {
      id: 'bid-1',
      rfqId: rfq.id,
      supplierName: 'Drewnex Palety & Packaging Sp. z o.o.',
      supplierNip: '5271928374',
      bidAmount: 79800,
      currency: 'PLN',
      leadTimeDays: 3,
      warrantyTerms: '24 Months EPAL Standard Quality Guarantee',
      status: 'PENDING',
      notes: 'Kiln-dried pine timber (<18% moisture). Offering our EcoDry Pine alternative for Item #1 at 37.50 PLN with higher load bearing capacity (1800kg).',
      submittedAt: '2 hours ago',
      itemOffers: [
        {
          requestedItemId: 'item-1',
          requestedSku: 'SKU-PAL-01',
          isSubstitute: true,
          offeredSku: 'SKU-PAL-02-ECO',
          offeredName: 'Drewnex EcoDry KD Pine Pallet EPAL/UIC Equivalent',
          offeredUnitPrice: 37.5,
          offeredQuantity: 1200,
          notes: 'Higher dynamic load capacity (1800kg vs 1500kg spec). Saves 5,400 PLN.',
        },
        {
          requestedItemId: 'item-2',
          requestedSku: 'SKU-STR-05',
          isSubstitute: false,
          offeredSku: 'SKU-STR-05',
          offeredName: 'Industrial Machine Stretch Film 23mic Transparent',
          offeredUnitPrice: 79.0,
          offeredQuantity: 200,
          notes: 'Exact OEM match from Central Warehouse Katowice.',
        },
        {
          requestedItemId: 'item-3',
          requestedSku: 'SKU-BOX-12',
          isSubstitute: false,
          offeredSku: 'SKU-BOX-12',
          offeredName: 'Corrugated Heavy Duty 5-Ply Shipping Boxes',
          offeredUnitPrice: 6.8,
          offeredQuantity: 2500,
          notes: 'Exact spec match. Palletized with protective top sheet.',
        },
      ],
    },
    {
      id: 'bid-2',
      rfqId: rfq.id,
      supplierName: 'Pomerania Industrial Supplies S.A.',
      supplierNip: '5832918471',
      bidAmount: 83400,
      currency: 'PLN',
      leadTimeDays: 5,
      warrantyTerms: '12 Months Factory Warranty',
      status: 'PENDING',
      notes: 'Quoting exact OEM specification items for all 3 positions with direct dispatch from Gdynia port terminal.',
      submittedAt: '5 hours ago',
      itemOffers: [
        {
          requestedItemId: 'item-1',
          requestedSku: 'SKU-PAL-01',
          isSubstitute: false,
          offeredSku: 'SKU-PAL-01',
          offeredName: 'Standard Wooden Pallets EPAL-1 (1200x800mm)',
          offeredUnitPrice: 40.5,
          offeredQuantity: 1200,
          notes: 'Exact spec match, brand new EPAL certified.',
        },
        {
          requestedItemId: 'item-2',
          requestedSku: 'SKU-STR-05',
          isSubstitute: false,
          offeredSku: 'SKU-STR-05',
          offeredName: 'Industrial Machine Stretch Film 23mic Transparent',
          offeredUnitPrice: 81.0,
          offeredQuantity: 200,
          notes: 'Exact OEM match, 16.0kg roll net weight.',
        },
        {
          requestedItemId: 'item-3',
          requestedSku: 'SKU-BOX-12',
          isSubstitute: false,
          offeredSku: 'SKU-BOX-12',
          offeredName: 'Corrugated Heavy Duty 5-Ply Shipping Boxes',
          offeredUnitPrice: 7.0,
          offeredQuantity: 2500,
          notes: 'Exact 600x400x400 dimensions.',
        },
      ],
    },
  ], [rfq]);

  const targetBudgetCalculated = useMemo(() => {
    return requestedItems.reduce((acc, i) => acc + i.quantity * i.targetUnitPrice, 0);
  }, [requestedItems]);

  const isAwarded = rfq.status === 'AWARDED' || awardedBidId !== null;

  const handleAcceptBid = async (bid: EnrichedBid) => {
    try {
      setAwardedBidId(bid.id);
      await createOrderMutation.mutateAsync({
        customerName: 'Baltic Retail Group Sp. z o.o.',
        deliveryCity: rfq.deliveryLocation.split('(')[0]?.trim() || 'Warszawa',
        totalAmount: bid.bidAmount,
        items: bid.itemOffers.map((offer) => ({
          sku: offer.offeredSku,
          name: `${offer.offeredName} (Tender Award: ${bid.supplierName})`,
          quantity: offer.offeredQuantity,
          unitPrice: offer.offeredUnitPrice,
        })),
      });

      toast.success(
        `Bid by ${bid.supplierName} accepted! Converted ${bid.itemOffers.length} line items into PO Order in Order Service (Kafka: RfqBidAcceptedEvent).`
      );
      navigate({ to: '/buyer/orders' });
    } catch {
      toast.error('Failed to convert bid to order');
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/buyer/requests"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back to RFQ List
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {rfq.title}
            </h1>
            <Badge
              variant={isAwarded ? 'default' : 'secondary'}
              className={
                isAwarded
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }
            >
              {isAwarded ? 'AWARDED & CONVERTED' : `${enrichedBids.length} BIDS RECEIVED`}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ref: <span className="font-mono">{rfq.rfqNumber}</span> • Category: {rfq.category} • Target Budget: {targetBudgetCalculated.toLocaleString()} PLN
          </p>
        </div>

        <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">
          Screen P20: Multi-Position Bid & Substitute Matrix
        </Badge>
      </div>

      {/* Target Parameters Summary */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-2xs">
        <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Target Budget Limit:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
              {targetBudgetCalculated.toLocaleString()} PLN
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Delivery Location:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{rfq.deliveryLocation}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Bidding Deadline:</span>
            <span className="font-semibold text-amber-600 font-mono">{rfq.deadline}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Substitution Clause:</span>
            <span className="font-semibold text-emerald-600 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Equivalents Allowed (allow_substitutes=true)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 3-Tabs: BOM Scope, Proposal Comparison & Substitutes Analysis */}
      <Tabs defaultValue="scoring" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl bg-slate-100 dark:bg-slate-800 p-1">
          <TabsTrigger value="scoring" className="text-xs gap-1.5 font-bold">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Tabela Oceny i Skoringu
          </TabsTrigger>
          <TabsTrigger value="bids" className="text-xs gap-1.5">
            <Trophy className="h-3.5 w-3.5" /> Oferty ({enrichedBids.length})
          </TabsTrigger>
          <TabsTrigger value="bom" className="text-xs gap-1.5">
            <Package className="h-3.5 w-3.5" /> Pozycje BOM ({requestedItems.length})
          </TabsTrigger>
          <TabsTrigger value="substitutes" className="text-xs gap-1.5">
            <Layers className="h-3.5 w-3.5" /> Zamienniki
          </TabsTrigger>
        </TabsList>

        {/* TAB 0: Multi-Criteria Scoring & Ranking Matrix */}
        <TabsContent value="scoring" className="space-y-4 pt-4">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="py-3 px-5 border-b bg-slate-50 dark:bg-slate-900/60 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Wielokryterialna Tabela Porównania i Skoringu Ofert (B2B Evaluation Matrix)
                </CardTitle>
                <p className="text-2xs text-slate-500 mt-0.5">
                  Wagi kryteriów: Cena (50%), Czas realizacji (25%), Certyfikaty i jakość (15%), Warunki płatności MPP (10%).
                </p>
              </div>
              <Badge className="bg-emerald-600 text-white text-xs gap-1">
                <CheckCircle2 className="h-3 w-3" /> Algorytm AHP
              </Badge>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b text-slate-600 dark:text-slate-400 font-semibold uppercase text-2xs">
                  <tr>
                    <th className="py-3 px-4">Pozycja / Dostawca</th>
                    <th className="py-3 px-4 text-right">Cena (Waga 50%)</th>
                    <th className="py-3 px-4 text-right">Lead Time (Waga 25%)</th>
                    <th className="py-3 px-4 text-right">Jakość & ESG (Waga 15%)</th>
                    <th className="py-3 px-4 text-right">Płatność (Waga 10%)</th>
                    <th className="py-3 px-4 text-right font-bold">Wynik Łączny</th>
                    <th className="py-3 px-4 text-right">Decyzja / Akcja</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {enrichedBids.map((bid, idx) => {
                    const isLeader = idx === 0;
                    const priceScore = isLeader ? 48.0 : 43.5;
                    const leadScore = isLeader ? 24.5 : 19.0;
                    const qualScore = isLeader ? 15.0 : 14.0;
                    const termsScore = isLeader ? 10.0 : 9.5;
                    const totalScore = (priceScore + leadScore + qualScore + termsScore).toFixed(1);
                    const isWinning = isAwarded && (bid.id === awardedBidId || bid.status === 'ACCEPTED');

                    return (
                      <tr
                        key={bid.id}
                        className={`transition-colors ${
                          isWinning
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20'
                            : isLeader
                            ? 'bg-amber-50/30 dark:bg-amber-950/10'
                            : 'hover:bg-slate-50/50'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-400">#{idx + 1}</span>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                {bid.supplierName}
                                {isLeader && (
                                  <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px]">
                                    👑 Rekomendacja AI
                                  </Badge>
                                )}
                              </div>
                              <div className="font-mono text-2xs text-slate-500">NIP: {bid.supplierNip}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          <div className="font-bold text-slate-900 dark:text-slate-100">
                            {bid.bidAmount.toLocaleString()} PLN
                          </div>
                          <div className="text-2xs text-emerald-600">{priceScore.toFixed(1)} / 50 pkt</div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          <div className="font-semibold">{bid.leadTimeDays} dni robocze</div>
                          <div className="text-2xs text-slate-500">{leadScore.toFixed(1)} / 25 pkt</div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          <div className="font-semibold">ISO & UIC 435-2</div>
                          <div className="text-2xs text-slate-500">{qualScore.toFixed(1)} / 15 pkt</div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          <div className="font-semibold">Net 30 (MPP)</div>
                          <div className="text-2xs text-slate-500">{termsScore.toFixed(1)} / 10 pkt</div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          <div className="text-sm font-extrabold text-emerald-600">
                            {totalScore} <span className="text-2xs font-normal text-slate-400">/ 100</span>
                          </div>
                          <div className="w-20 ml-auto bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                            <div
                              className="bg-emerald-500 h-full rounded-full"
                              style={{ width: `${totalScore}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {!isAwarded ? (
                            <Button
                              size="sm"
                              onClick={() => handleAcceptBid(bid)}
                              className={`h-7 text-xs font-bold gap-1 text-white shadow-xs ${
                                isLeader
                                  ? 'bg-emerald-600 hover:bg-emerald-700'
                                  : 'bg-slate-700 hover:bg-slate-800'
                              }`}
                            >
                              <Trophy className="h-3 w-3" />
                              Zaakceptuj Ofertę (Award)
                            </Button>
                          ) : isWinning ? (
                            <Badge className="bg-emerald-600 text-white text-xs gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Wybrana Oferta
                            </Badge>
                          ) : (
                            <span className="text-2xs text-slate-400">Odrzucona</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 1: Requested BOM Positions */}
        <TabsContent value="bom" className="space-y-4 pt-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-600" />
                Procurement Bill of Materials Announced by Buyer
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-400">
                  <tr>
                    <th className="py-2.5 px-3 w-12">#</th>
                    <th className="py-2.5 px-3">Item Description & Specifications</th>
                    <th className="py-2.5 px-3 w-28">SKU</th>
                    <th className="py-2.5 px-3 w-28">Quantity</th>
                    <th className="py-2.5 px-3 w-32">Target Unit Price</th>
                    <th className="py-2.5 px-3 text-right w-32">Target Cap</th>
                    <th className="py-2.5 px-3 text-center w-28">Sub Allowed?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {requestedItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-mono font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</div>
                        <div className="text-2xs text-slate-500 mt-0.5">{item.specNotes}</div>
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {item.sku}
                      </td>
                      <td className="py-3 px-3 font-bold">
                        {item.quantity.toLocaleString()} {item.unit}
                      </td>
                      <td className="py-3 px-3 font-mono">
                        {item.targetUnitPrice.toFixed(2)} PLN
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                        {(item.quantity * item.targetUnitPrice).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
                      </td>
                      <td className="py-3 px-3 text-center">
                        {item.allowSubstitute ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-2xs">
                            Yes
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-2xs text-slate-400">
                            Strict
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 1: Bids Comparison Matrix */}
        <TabsContent value="bids" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrichedBids.map((bid, idx) => {
              const savingsAmount = targetBudgetCalculated - bid.bidAmount;
              const savingsPercent = Math.round((savingsAmount / targetBudgetCalculated) * 100);
              const isWinning = isAwarded && (bid.id === awardedBidId || bid.status === 'ACCEPTED');

              return (
                <Card
                  key={bid.id}
                  className={`border transition-all flex flex-col justify-between ${
                    isWinning
                      ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-500'
                      : 'border-slate-200 dark:border-slate-800 hover:shadow-md'
                  }`}
                >
                  <div>
                    <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-emerald-600" />
                          <div>
                            <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                              {bid.supplierName}
                            </div>
                            <div className="font-mono text-2xs text-slate-500">NIP: {bid.supplierNip}</div>
                          </div>
                        </div>

                        {isWinning ? (
                          <Badge className="bg-emerald-600 text-white text-xs gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Winning Offer
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Proposal #{idx + 1}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 space-y-4 text-xs">
                      {/* Pricing Block */}
                      <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                        <div className="flex items-baseline justify-between">
                          <span className="text-slate-500">Total Proposed Bid:</span>
                          <span className="text-xl font-mono font-extrabold text-slate-900 dark:text-slate-100">
                            {bid.bidAmount.toLocaleString()} {bid.currency}
                          </span>
                        </div>
                        <div className="flex justify-between text-emerald-600 font-semibold">
                          <span className="flex items-center gap-1">
                            <TrendingDown className="h-3.5 w-3.5" /> Total Buyer Savings:
                          </span>
                          <span>
                            {savingsAmount.toLocaleString()} {bid.currency} ({savingsPercent}% below budget)
                          </span>
                        </div>
                      </div>

                      {/* Line-by-Line Item Breakdown */}
                      <div className="space-y-2">
                        <div className="text-2xs font-bold uppercase tracking-wider text-slate-500">
                          Itemized Offers & Substitutes ({bid.itemOffers.length}):
                        </div>

                        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                          {bid.itemOffers.map((offer, offerIdx) => (
                            <div key={offerIdx} className="p-2.5 space-y-1 bg-white dark:bg-slate-950">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-900 dark:text-slate-100">
                                  {offer.offeredName}
                                </span>
                                {offer.isSubstitute ? (
                                  <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-2xs gap-1">
                                    <RefreshCw className="h-3 w-3" /> Substitute
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-2xs text-slate-500">
                                    Exact Match
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center justify-between text-2xs text-slate-500 font-mono">
                                <span>
                                  Replaces: <strong>{offer.requestedSku}</strong> ➔ Quoting <strong>{offer.offeredSku}</strong>
                                </span>
                                <span className="font-bold text-slate-900 dark:text-slate-100">
                                  {offer.offeredQuantity} units @ {offer.offeredUnitPrice.toFixed(2)} PLN
                                </span>
                              </div>
                              <p className="text-2xs text-slate-400 italic">
                                {offer.notes}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery & Warranty Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2.5 rounded-lg border bg-white dark:bg-slate-950">
                          <span className="text-slate-500 block">Lead Time:</span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {bid.leadTimeDays} business days
                          </span>
                        </div>
                        <div className="p-2.5 rounded-lg border bg-white dark:bg-slate-950">
                          <span className="text-slate-500 block">Warranty:</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
                            {bid.warrantyTerms}
                          </span>
                        </div>
                      </div>

                      {/* Supplier Comments */}
                      <p className="text-slate-600 dark:text-slate-300 italic bg-slate-50/50 dark:bg-slate-900/50 p-2.5 rounded-lg border">
                        "{bid.notes}"
                      </p>
                    </CardContent>
                  </div>

                  {/* Accept Bid Button Footer */}
                  <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 mt-2">
                    {!isAwarded ? (
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-bold shadow-xs text-xs"
                        onClick={() => handleAcceptBid(bid)}
                      >
                        <Trophy className="h-3.5 w-3.5" />
                        🏆 Accept Winning Bid & Create PO Order
                      </Button>
                    ) : isWinning ? (
                      <div className="text-center py-2 text-xs font-semibold text-emerald-600 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" /> Order Created in Order Service
                      </div>
                    ) : (
                      <div className="text-center py-2 text-xs text-slate-400">Proposal not selected</div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* TAB 2: Substitute Analysis */}
        <TabsContent value="substitutes" className="space-y-4 pt-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-600" />
                Technical Product Equivalence & Substitute Pairing Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl space-y-2">
                <div className="font-bold text-sm text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  Detailed Substitute Evaluation: Drewnex EcoDry KD Pine (SKU-PAL-02-ECO) vs Original EPAL-1
                </div>
                <p className="text-emerald-800 dark:text-emerald-200">
                  Supplier Drewnex Palety proposed an equivalent kiln-dried pine specification conforming strictly to UIC 435-2. Heat treatment certificate ISPM-15 provided, saving 5,400 PLN on Item #1 while reducing moisture content to &lt;18% for superior pharmaceutical & food warehouse safety.
                </p>
              </div>

              <table className="w-full text-left text-xs border rounded-xl overflow-hidden">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Technical Parameter</th>
                    <th className="py-2.5 px-4 font-semibold">Requested in Tender</th>
                    <th className="py-2.5 px-4 font-semibold text-emerald-600">Proposed by Drewnex (Substitute)</th>
                    <th className="py-2.5 px-4 font-semibold">Compliance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-2.5 px-4 font-medium">Physical Dimensions</td>
                    <td className="py-2.5 px-4 font-mono">1200 x 800 x 144 mm</td>
                    <td className="py-2.5 px-4 font-mono">1200 x 800 x 144 mm</td>
                    <td className="py-2.5 px-4"><Badge className="bg-emerald-100 text-emerald-800 text-2xs">100% Match</Badge></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium">Dynamic Load Capacity</td>
                    <td className="py-2.5 px-4 font-mono">1,500 kg</td>
                    <td className="py-2.5 px-4 font-mono">1,800 kg (Reinforced)</td>
                    <td className="py-2.5 px-4"><Badge className="bg-emerald-100 text-emerald-800 text-2xs">+20% Superior</Badge></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium">Wood Moisture Content</td>
                    <td className="py-2.5 px-4 font-mono">&lt; 22%</td>
                    <td className="py-2.5 px-4 font-mono">&lt; 18% (Kiln-Dried KD)</td>
                    <td className="py-2.5 px-4"><Badge className="bg-emerald-100 text-emerald-800 text-2xs">Better than Spec</Badge></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium">Unit Price Comparison</td>
                    <td className="py-2.5 px-4 font-mono">42.00 PLN cap</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-emerald-600">37.50 PLN (-10.7%)</td>
                    <td className="py-2.5 px-4"><Badge className="bg-emerald-100 text-emerald-800 text-2xs">5,400 PLN Savings</Badge></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium">Phytosanitary Certification</td>
                    <td className="py-2.5 px-4">ISPM-15 Required</td>
                    <td className="py-2.5 px-4 font-mono">ISPM-15 HT Certified (PL-32/094)</td>
                    <td className="py-2.5 px-4"><Badge className="bg-emerald-100 text-emerald-800 text-2xs">Certified</Badge></td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default RfqTenderDetailPage;
