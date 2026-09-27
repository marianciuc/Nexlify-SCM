import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import {
  ChevronLeft,
  Package,
  Warehouse,
  Boxes,
  ShieldCheck,
  Save,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const Route = createFileRoute('/supplier/products/$sku')({
  component: SupplierSkuDetailPage,
  staticData: {
    crumb: {
      label: 'Manage SKU',
    },
  },
});

function SupplierSkuDetailPage() {
  const { sku } = Route.useParams();

  const [name, setName] = useState('EPAL Euro-Pallet Standard (Pine Wood)');
  const [basePrice, setBasePrice] = useState(120.0);
  const [moq, setMoq] = useState(20);

  const [warehouseBins] = useState([
    { warehouse: 'Central DC Warszawa (WH-WAW-01)', aisle: 'A-04', rack: '02', bin: 'BIN-108', available: 1420, reserved: 80 },
    { warehouse: 'Silesia Logistics Hub Katowice (WH-KTW-03)', aisle: 'C-01', rack: '05', bin: 'BIN-042', available: 350, reserved: 20 },
    { warehouse: 'Port Logistics Hub Szczecin (WH-SZC-02)', aisle: 'B-02', rack: '01', bin: 'BIN-019', available: 80, reserved: 0 },
  ]);

  const [batches] = useState([
    { batchNo: 'LOT-2026-0819', mfgDate: '2026-08-15', expDate: 'N/A (Dry Wood)', qty: 1000, qcStatus: 'APPROVED' },
    { batchNo: 'LOT-2026-0902', mfgDate: '2026-09-01', expDate: 'N/A (Dry Wood)', qty: 850, qcStatus: 'APPROVED' },
  ]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`SKU ${sku} properties and warehouse bin rules updated!`);
  };

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/supplier/products"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Products Catalog
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Manage SKU: <span className="font-mono text-amber-600">{sku}</span>
            </h1>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
              Active in WMS
            </Badge>
          </div>
        </div>

        <Button
          className="bg-amber-600 hover:bg-amber-700 text-white gap-2 text-xs font-semibold"
          onClick={handleSave}
        >
          <Save className="h-4 w-4" /> Save SKU Configurations
        </Button>
      </div>

      {/* Tabs View */}
      <Tabs defaultValue="bins" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md bg-slate-100 dark:bg-slate-800 p-1">
          <TabsTrigger value="bins" className="text-xs gap-1.5">
            <Warehouse className="h-3.5 w-3.5" /> WMS Bins & Hubs
          </TabsTrigger>
          <TabsTrigger value="batches" className="text-xs gap-1.5">
            <Boxes className="h-3.5 w-3.5" /> Batch & Lot Trace
          </TabsTrigger>
          <TabsTrigger value="specs" className="text-xs gap-1.5">
            <Package className="h-3.5 w-3.5" /> Pricing & Specs
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: WMS Bins */}
        <TabsContent value="bins" className="space-y-4 pt-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="py-3 px-5 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Warehouse className="h-4 w-4 text-amber-600" /> Regional Warehouse Bin Locations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b">
                  <tr>
                    <th className="py-3 px-4">Warehouse Facility</th>
                    <th className="py-3 px-4">Aisle / Rack</th>
                    <th className="py-3 px-4">Storage Bin ID</th>
                    <th className="py-3 px-4 text-right">Available Qty</th>
                    <th className="py-3 px-4 text-right">Reserved (Redisson)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {warehouseBins.map((bin, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {bin.warehouse}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {bin.aisle} / {bin.rack}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-600">
                        {bin.bin}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600 text-right">
                        {bin.available} pcs
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500 text-right">
                        {bin.reserved} pcs
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Batch & Lot */}
        <TabsContent value="batches" className="space-y-4 pt-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="py-3 px-5 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Boxes className="h-4 w-4 text-amber-600" /> Lot & Batch Traceability
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b">
                  <tr>
                    <th className="py-3 px-4">Lot / Batch #</th>
                    <th className="py-3 px-4">Mfg Date</th>
                    <th className="py-3 px-4">Expiry</th>
                    <th className="py-3 px-4 text-right">Batch Quantity</th>
                    <th className="py-3 px-4">QC Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {batches.map((b, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                        {b.batchNo}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{b.mfgDate}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{b.expDate}</td>
                      <td className="py-3 px-4 font-mono font-bold text-right">{b.qty} pcs</td>
                      <td className="py-3 px-4">
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-2xs">
                          {b.qcStatus}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: Specs & Commercial */}
        <TabsContent value="specs" className="space-y-4 pt-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="py-3 px-5 border-b">
              <CardTitle className="text-sm font-semibold">Pricing & Commercial Conditions</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Product Title:</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} className="text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Base Wholesale Price (PLN):</Label>
                  <Input
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="font-mono text-xs font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Minimum Order Quantity (MOQ):</Label>
                  <Input
                    type="number"
                    value={moq}
                    onChange={(e) => setMoq(Number(e.target.value))}
                    className="font-mono text-xs font-bold"
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
