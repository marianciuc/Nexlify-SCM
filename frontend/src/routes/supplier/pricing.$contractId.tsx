import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import {
  ChevronLeft,
  Tag,
  Building2,
  Calendar,
  CheckCircle2,
  TrendingDown,
  ShieldCheck,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/supplier/pricing/$contractId')({
  component: PricingContractDetailPage,
  staticData: {
    crumb: {
      label: 'Contract Details',
    },
  },
});

function PricingContractDetailPage() {
  const { contractId } = Route.useParams();

  const [contractPrice, setContractPrice] = useState(102.0);
  const [minOrderQty, setMinOrderQty] = useState(50);
  const [paymentTerms, setPaymentTerms] = useState('Net 30 Days');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Contract ${contractId} updated and synced with Order Service!`);
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/supplier/pricing"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Pricing Contracts
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Contract Terms: <span className="font-mono text-amber-600">{contractId}</span>
            </h1>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
              Active Agreement
            </Badge>
          </div>
        </div>

        <Button
          className="bg-amber-600 hover:bg-amber-700 text-white gap-2 text-xs font-semibold"
          onClick={handleSave}
        >
          <Save className="h-4 w-4" /> Save Contract Amendments
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Buyer Identity */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="py-3 px-5 border-b">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-amber-600" /> Contract Counterparty
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div>
              <span className="text-slate-500 block">Buyer Legal Entity:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Baltic Retail Group Sp. z o.o.
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Tax Identification:</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">NIP: 8522619472</span>
            </div>
            <div>
              <span className="text-slate-500 block">Verified Status:</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Approved VIES / Trade Credit Active
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Contracted SKU */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="py-3 px-5 border-b">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4 text-amber-600" /> Contracted Product & Price
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div>
              <span className="text-slate-500 block">Covered Product SKU:</span>
              <span className="font-mono font-bold text-amber-600">SKU-PAL-01 (EPAL Euro-Pallets)</span>
            </div>
            <div>
              <span className="text-slate-500 block">Standard Catalog List Price:</span>
              <span className="font-mono line-through text-slate-500">120.00 PLN / unit</span>
            </div>
            <div className="space-y-1 pt-1">
              <Label className="text-xs">Contract Locked Price (PLN):</Label>
              <Input
                type="number"
                value={contractPrice}
                onChange={(e) => setContractPrice(Number(e.target.value))}
                className="font-mono font-bold text-emerald-600 text-sm"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
