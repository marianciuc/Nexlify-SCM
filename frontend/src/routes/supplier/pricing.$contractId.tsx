import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronLeft, Tag, Building2, CheckCircle2, Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { MoneyDisplay, QuantityDisplay } from '@/components/money-display';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocale } from '@/hooks/useLocale';

export const Route = createFileRoute('/supplier/pricing/$contractId')({
  component: PricingContractDetailPage,
  staticData: {
    crumb: {
      label: 'nav.supplier.pricing',
    },
  },
});

interface ContractLine {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discount: number;
}

const MOCK_CONTRACT = {
  contractNo: 'PRC-2026-0081',
  buyerName: 'Baltic Retail Group Sp. z o.o.',
  buyerNip: '8522619472',
  currency: 'PLN',
  lines: [
    {
      sku: 'SKU-PAL-01',
      name: 'EPAL Euro-Pallet Standard (Pine Wood)',
      quantity: 250,
      unitPrice: 102.0,
      discount: 15.0,
    },
    {
      sku: 'SKU-STR-05',
      name: 'Industrial Stretch Film 23mic (Roll 300m)',
      quantity: 80,
      unitPrice: 360.0,
      discount: 12.5,
    },
  ] as ContractLine[],
};

function PricingContractDetailPage() {
  const { t } = useLocale();
  const { contractId } = Route.useParams();

  const [contractPrice, setContractPrice] = useState(102.0);
  const [minOrderQty, setMinOrderQty] = useState(50);
  const [paymentTerms, setPaymentTerms] = useState('Net 30');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(t('supplier.pricing.detail.saved', { id: contractId }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto min-w-0">
      <div>
        <Link
          to="/supplier/pricing"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          {t('supplier.pricing.detail.backToList')}
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t('supplier.pricing.detail.heading', {
              number: MOCK_CONTRACT.contractNo,
            })}
          </h1>
          <StatusBadge tone="success" label={t('supplier.pricing.detail.activeBadge')} size="sm" />
        </div>
        <Button
          size="sm"
          className="w-full sm:w-auto gap-2 font-semibold shadow-xs"
          onClick={handleSave}
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {t('supplier.pricing.detail.save')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="py-3 px-5 border-b border-border">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" aria-hidden="true" />
              {t('supplier.pricing.detail.buyerCard')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block">
                {t('supplier.pricing.detail.buyerName')}
              </span>
              <span className="font-bold text-foreground text-sm">{MOCK_CONTRACT.buyerName}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">
                {t('supplier.pricing.detail.buyerNip')}
              </span>
              <span className="font-mono font-bold text-foreground">
                {t('supplier.pricing.detail.buyerNipValue', { nip: MOCK_CONTRACT.buyerNip })}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">VIES</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                {t('supplier.pricing.detail.buyerVies')}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="py-3 px-5 border-b border-border">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" aria-hidden="true" />
              {t('supplier.pricing.detail.itemCard')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block">
                {t('supplier.pricing.detail.sku')}
              </span>
              <span className="font-mono font-bold text-primary">SKU-PAL-01</span>
            </div>
            <div>
              <span className="text-muted-foreground block">
                {t('supplier.pricing.detail.listPrice')}
              </span>
              <MoneyDisplay
                amount={120.0}
                variant="inline"
                className="line-through text-muted-foreground"
              />
            </div>
            <form onSubmit={handleSave} className="space-y-3 pt-1">
              <div className="space-y-1">
                <Label htmlFor="contract-price" className="text-xs">
                  {t('supplier.pricing.detail.contractPrice')}
                </Label>
                <Input
                  id="contract-price"
                  type="number"
                  step="0.01"
                  value={contractPrice}
                  onChange={(e) => setContractPrice(Number(e.target.value))}
                  className="font-mono font-bold text-emerald-700 dark:text-emerald-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <Label htmlFor="moq" className="text-xs text-muted-foreground">
                    {t('supplier.pricing.detail.moq')}
                  </Label>
                  <Input
                    id="moq"
                    type="number"
                    value={minOrderQty}
                    onChange={(e) => setMinOrderQty(Number(e.target.value))}
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="payment-terms" className="text-xs text-muted-foreground">
                    {t('supplier.pricing.detail.paymentTerms')}
                  </Label>
                  <Input
                    id="payment-terms"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-xs bg-card overflow-hidden">
        <CardHeader className="py-3 px-5 border-b border-border">
          <CardTitle className="text-sm font-semibold">
            {t('supplier.pricing.detail.linesHeading')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {MOCK_CONTRACT.lines.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              {t('supplier.pricing.detail.linesEmpty')}
            </p>
          ) : (
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground whitespace-nowrap uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-4 text-left">
                    {t('supplier.pricing.detail.lines.sku')}
                  </th>
                  <th className="py-3 px-4 text-left">
                    {t('supplier.pricing.detail.lines.name')}
                  </th>
                  <th className="py-3 px-4 text-right">
                    {t('supplier.pricing.detail.lines.qty')}
                  </th>
                  <th className="py-3 px-4 text-right">
                    {t('supplier.pricing.detail.lines.unitPrice')}
                  </th>
                  <th className="py-3 px-4 text-right">
                    {t('supplier.pricing.detail.lines.discount')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {MOCK_CONTRACT.lines.map((line) => (
                  <tr key={line.sku} className="hover:bg-muted/40">
                    <td className="py-3 px-4 font-mono font-bold text-xs text-primary">
                      {line.sku}
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">{line.name}</td>
                    <td className="py-3 px-4 text-right">
                      <QuantityDisplay amount={line.quantity} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <MoneyDisplay amount={line.unitPrice} variant="inline" emphasize />
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      -{line.discount}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default PricingContractDetailPage;