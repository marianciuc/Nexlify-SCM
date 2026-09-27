import { createFileRoute, Link, Outlet, useChildMatches } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Tag,
  Plus,
  Percent,
  Building2,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit,
  ArrowRight,
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

export const Route = createFileRoute('/supplier/pricing')({
  component: SupplierPricingPage,
  staticData: {
    crumb: {
      label: 'B2B Pricing Contracts',
    },
  },
});

interface PricingContract {
  id: string;
  contractNo: string;
  buyerName: string;
  buyerNip: string;
  sku: string;
  productName: string;
  basePrice: number;
  contractPrice: number;
  discountPercent: number;
  validUntil: string;
  status: 'ACTIVE' | 'EXPIRED';
}

const INITIAL_CONTRACTS: PricingContract[] = [
  {
    id: 'prc-01',
    contractNo: 'PRC-2026-0081',
    buyerName: 'Baltic Retail Group Sp. z o.o.',
    buyerNip: '8522619472',
    sku: 'SKU-PAL-01',
    productName: 'EPAL Euro-Pallet Standard (Pine Wood)',
    basePrice: 120.0,
    contractPrice: 102.0,
    discountPercent: 15.0,
    validUntil: '2026-12-31',
    status: 'ACTIVE',
  },
  {
    id: 'prc-02',
    contractNo: 'PRC-2026-0094',
    buyerName: 'Pomerania Foods Sp. k.',
    buyerNip: '5832918471',
    sku: 'SKU-COL-09',
    productName: 'Insulated Thermobox 60L Pharma/Food Grade',
    basePrice: 224.33,
    contractPrice: 195.0,
    discountPercent: 13.1,
    validUntil: '2026-11-30',
    status: 'ACTIVE',
  },
  {
    id: 'prc-03',
    contractNo: 'PRC-2026-0042',
    buyerName: 'Silesia Freight & Logistics S.A.',
    buyerNip: '6342819401',
    sku: 'SKU-STR-05',
    productName: 'Industrial Stretch Film 23mic',
    basePrice: 411.25,
    contractPrice: 360.0,
    discountPercent: 12.5,
    validUntil: '2026-10-15',
    status: 'ACTIVE',
  },
];

function SupplierPricingPage() {
  const childMatches = useChildMatches();
  if (childMatches.length > 0) {
    return <Outlet />;
  }
  return <SupplierPricingContent />;
}

function SupplierPricingContent() {
  const [contracts, setContracts] = useState<PricingContract[]>(INITIAL_CONTRACTS);
  const [showModal, setShowModal] = useState(false);

  const [buyerName, setBuyerName] = useState('');
  const [buyerNip, setBuyerNip] = useState('');
  const [sku, setSku] = useState('SKU-PAL-01');
  const [discountPercent, setDiscountPercent] = useState(10);
  const [validUntil, setValidUntil] = useState('2026-12-31');

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !buyerNip) {
      toast.error('Please enter buyer details');
      return;
    }

    const basePrice = sku === 'SKU-PAL-01' ? 120.0 : 411.25;
    const contractPrice = Math.round((basePrice * (1 - discountPercent / 100)) * 100) / 100;

    const newContract: PricingContract = {
      id: 'prc-' + Math.random().toString(36).substring(2, 7),
      contractNo: `PRC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      buyerName,
      buyerNip,
      sku,
      productName: sku === 'SKU-PAL-01' ? 'EPAL Euro-Pallet Standard' : 'Stretch Film 23mic',
      basePrice,
      contractPrice,
      discountPercent,
      validUntil,
      status: 'ACTIVE',
    };

    setContracts([newContract, ...contracts]);
    setShowModal(false);
    toast.success(`B2B Pricing Contract ${newContract.contractNo} for NIP ${buyerNip} activated!`);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Tag className="h-6 w-6 text-amber-600" />
              B2B Pricing Contracts & Client Discount Matrix
            </h1>
            <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">
              Screen P11
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Configure custom volume discount schedules and locked-in contract pricing for verified B2B customer NIP accounts.
          </p>
        </div>

        <Button
          className="bg-amber-600 hover:bg-amber-700 text-white gap-2 text-xs shadow-xs"
          onClick={() => setShowModal(true)}
        >
          <Plus className="h-4 w-4" /> Create Client Pricing Contract
        </Button>
      </div>

      {/* Contracts Table */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b text-slate-600 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4">Contract #</th>
                <th className="py-3 px-4">Client / NIP</th>
                <th className="py-3 px-4">SKU / Item</th>
                <th className="py-3 px-4 text-right">Standard List</th>
                <th className="py-3 px-4 text-right">Contract Price</th>
                <th className="py-3 px-4 text-right">Discount</th>
                <th className="py-3 px-4">Expiration Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {contracts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-mono font-bold text-amber-700 dark:text-amber-400">
                    <Link to="/supplier/pricing/$contractId" params={{ contractId: c.id }} className="hover:underline">
                      {c.contractNo}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{c.buyerName}</div>
                    <div className="font-mono text-2xs text-slate-500">NIP: {c.buyerNip}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{c.productName}</div>
                    <div className="font-mono text-2xs text-slate-500">{c.sku}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 text-right line-through">
                    {c.basePrice.toFixed(2)} PLN
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-600 text-right text-sm">
                    {c.contractPrice.toFixed(2)} PLN
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-600 text-right">
                    -{c.discountPercent}%
                  </td>
                  <td className="py-3 px-4 text-slate-600">{c.validUntil}</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-2xs">
                      {c.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link to="/supplier/pricing/$contractId" params={{ contractId: c.id }}>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        Details <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base text-amber-700">
              <Tag className="h-5 w-5" /> Issue B2B Customer Contract Price
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateContract} className="space-y-4 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Client Legal Company Name:</Label>
              <Input
                placeholder="E.g. Baltic Retail Group Sp. z o.o."
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Client Tax NIP (10 Digits):</Label>
              <Input
                placeholder="8522619472"
                value={buyerNip}
                onChange={(e) => setBuyerNip(e.target.value)}
                className="text-xs font-mono font-bold"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Select SKU to Contract:</Label>
              <select
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full p-2 border rounded-md bg-white dark:bg-slate-900 font-mono"
              >
                <option value="SKU-PAL-01">SKU-PAL-01 - EPAL Euro-Pallet (List: 120.00 PLN)</option>
                <option value="SKU-STR-05">SKU-STR-05 - Stretch Film 23mic (List: 411.25 PLN)</option>
                <option value="SKU-COL-09">SKU-COL-09 - Thermobox 60L (List: 224.33 PLN)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Volume Discount (%):</Label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Valid Until Date:</Label>
                <Input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                Bind Contract Terms
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
