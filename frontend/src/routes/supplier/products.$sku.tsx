import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronLeft, Package, Warehouse, Boxes, Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { MoneyDisplay, QuantityDisplay } from '@/components/money-display';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocale } from '@/hooks/useLocale';

export const Route = createFileRoute('/supplier/products/$sku')({
  component: SupplierSkuDetailPage,
  staticData: { crumb: { label: 'nav.supplier.skuDetail' } },
});

function SupplierSkuDetailPage() {
  const { sku } = Route.useParams();
  const { t } = useLocale();

  const [name, setName] = useState('EPAL Euro-Pallet Standard (Pine Wood)');
  const [basePrice, setBasePrice] = useState(120.0);
  const [moq, setMoq] = useState(20);

  const warehouseBins = [
    { warehouse: 'Central DC Warszawa (WH-WAW-01)', aisle: 'A-04', rack: '02', bin: 'BIN-108', available: 1420, reserved: 80 },
    { warehouse: 'Silesia Logistics Hub Katowice (WH-KTW-03)', aisle: 'C-01', rack: '05', bin: 'BIN-042', available: 350, reserved: 20 },
    { warehouse: 'Port Logistics Hub Szczecin (WH-SZC-02)', aisle: 'B-02', rack: '01', bin: 'BIN-019', available: 80, reserved: 0 },
  ];

  const batches = [
    { batchNo: 'LOT-2026-0819', mfgDate: '2026-08-15', expDate: 'N/A', qty: 1000, qcStatus: 'APPROVED' as const },
    { batchNo: 'LOT-2026-0902', mfgDate: '2026-09-01', expDate: 'N/A', qty: 850, qcStatus: 'APPROVED' as const },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(t('supplier.sku.saved', { sku }));
  };

  return (
    <div className="space-y-6 max-w-5xl min-w-0">
      <div>
        <Link
          to="/supplier/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          {t('supplier.sku.backToCatalog')}
        </Link>
      </div>

      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" aria-hidden="true" />
            {t('supplier.sku.title')}
            <span className="font-mono text-primary">· {sku}</span>
          </span>
        }
        subtitle={name}
        actions={
          <>
            <StatusBadge tone="success" label={t('supplier.sku.activeInWms')} size="md" />
            <Button onClick={handleSave} size="sm" className="gap-2 font-medium">
              <Save className="h-4 w-4" aria-hidden="true" />
              {t('supplier.sku.save')}
            </Button>
          </>
        }
      />

      <Tabs defaultValue="bins" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/60 p-1">
          <TabsTrigger value="bins" className="text-xs gap-1.5">
            <Warehouse className="h-3.5 w-3.5" aria-hidden="true" />
            {t('supplier.sku.tab.bins')}
          </TabsTrigger>
          <TabsTrigger value="batches" className="text-xs gap-1.5">
            <Boxes className="h-3.5 w-3.5" aria-hidden="true" />
            {t('supplier.sku.tab.batches')}
          </TabsTrigger>
          <TabsTrigger value="specs" className="text-xs gap-1.5">
            <Package className="h-3.5 w-3.5" aria-hidden="true" />
            {t('supplier.sku.tab.specs')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bins" className="space-y-4 pt-4">
          <Card className="border-border bg-card">
            <CardHeader className="py-3 px-5 border-b border-border">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Warehouse className="h-4 w-4 text-primary" aria-hidden="true" />
                {t('supplier.sku.binsTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[640px]">
                <caption className="sr-only">{t('supplier.sku.binsTitle')}</caption>
                <thead className="bg-muted/30 border-b border-border text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">{t('supplier.sku.bins.warehouse')}</th>
                    <th className="py-3 px-4">{t('supplier.sku.bins.aisleRack')}</th>
                    <th className="py-3 px-4">{t('supplier.sku.bins.binCode')}</th>
                    <th className="py-3 px-4 text-right">{t('supplier.sku.bins.available')}</th>
                    <th className="py-3 px-4 text-right">{t('supplier.sku.bins.reserved')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {warehouseBins.map((bin) => (
                    <tr key={bin.bin} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-semibold text-foreground">{bin.warehouse}</td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">{bin.aisle} / {bin.rack}</td>
                      <td className="py-3 px-4 font-mono font-bold text-primary">{bin.bin}</td>
                      <td className="py-3 px-4 text-right">
                        <QuantityDisplay amount={bin.available} unit="pcs" emphasize />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <QuantityDisplay amount={bin.reserved} unit="pcs" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batches" className="space-y-4 pt-4">
          <Card className="border-border bg-card">
            <CardHeader className="py-3 px-5 border-b border-border">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Boxes className="h-4 w-4 text-primary" aria-hidden="true" />
                {t('supplier.sku.batchesTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[560px]">
                <caption className="sr-only">{t('supplier.sku.batchesTitle')}</caption>
                <thead className="bg-muted/30 border-b border-border text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">{t('supplier.sku.batches.lot')}</th>
                    <th className="py-3 px-4">{t('supplier.sku.batches.mfg')}</th>
                    <th className="py-3 px-4">{t('supplier.sku.batches.exp')}</th>
                    <th className="py-3 px-4 text-right">{t('supplier.sku.batches.qty')}</th>
                    <th className="py-3 px-4">{t('supplier.sku.batches.qc')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {batches.map((b) => (
                    <tr key={b.batchNo} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-foreground">{b.batchNo}</td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">{b.mfgDate}</td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">{b.expDate}</td>
                      <td className="py-3 px-4 text-right">
                        <QuantityDisplay amount={b.qty} unit="pcs" emphasize />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge tone="success" label={t('supplier.sku.batches.approved')} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specs" className="space-y-4 pt-4">
          <Card className="border-border bg-card">
            <CardHeader className="py-3 px-5 border-b border-border">
              <CardTitle className="text-sm font-semibold">{t('supplier.sku.specsTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="sku-name" className="text-xs">
                    {t('supplier.sku.specs.name')}
                  </Label>
                  <Input
                    id="sku-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sku-price" className="text-xs">
                    {t('supplier.sku.specs.price')}
                  </Label>
                  <Input
                    id="sku-price"
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="font-mono font-bold bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('supplier.sku.specs.priceHelper')} <MoneyDisplay amount={basePrice} variant="inline" />
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sku-moq" className="text-xs">
                    {t('supplier.sku.specs.moq')}
                  </Label>
                  <Input
                    id="sku-moq"
                    type="number"
                    value={moq}
                    onChange={(e) => setMoq(Number(e.target.value))}
                    className="font-mono font-bold bg-background"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SupplierSkuDetailPage;