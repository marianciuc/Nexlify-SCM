import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState } from 'react';
import {
  ChevronLeft,
  Package,
  Plus,
  Building2,
  Warehouse,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/supplier/products/new')({
  component: CreateSkuPage,
  staticData: {
    crumb: {
      label: 'New Product SKU',
    },
  },
});

function CreateSkuPage() {
  const navigate = useNavigate();

  const [sku, setSku] = useState('');
  const [ean, setEan] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Packaging & Cargo Units');
  const [basePrice, setBasePrice] = useState(150.0);
  const [moq, setMoq] = useState(10);
  const [unit, setUnit] = useState('pcs');
  const [weightKg, setWeightKg] = useState(15.0);
  const [dimensions, setDimensions] = useState('1200 x 800 x 144 mm');
  const [warehouse, setWarehouse] = useState('Central DC Warszawa (WH-WAW-01)');
  const [initialStock, setInitialStock] = useState(500);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || !name) {
      toast.error('Please enter SKU and Product Title');
      return;
    }

    toast.success(`Product SKU ${sku} (${name}) registered successfully in Inventory Service!`);
    navigate({ to: '/supplier/products' });
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/supplier/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Products
        </Link>
        <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">
          Screen P10 Integration
        </Badge>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-md">
        <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b pb-4">
          <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Package className="h-5 w-5 text-amber-600" />
            Register New Wholesale SKU in WMS
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Configure catalog item properties, logistics dimensions, EAN barcode, and initial regional stock allocation.
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Basic Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                1. Product Identification
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="sku" className="text-xs">
                    Stock Keeping Unit (SKU Code):
                  </Label>
                  <Input
                    id="sku"
                    placeholder="E.g. SKU-BOX-12"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="font-mono text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ean" className="text-xs">
                    Barcode EAN-13 / GTIN:
                  </Label>
                  <Input
                    id="ean"
                    placeholder="5901234567890"
                    value={ean}
                    onChange={(e) => setEan(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pname" className="text-xs">
                  Full Commercial Product Title:
                </Label>
                <Input
                  id="pname"
                  placeholder="E.g. Heavy Duty Corrugated Master Shipper Box (5-Ply)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xs font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cat" className="text-xs">
                  Product Category:
                </Label>
                <select
                  id="cat"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 text-xs border rounded-md bg-white dark:bg-slate-900"
                >
                  <option value="Packaging & Cargo Units">Packaging & Cargo Units</option>
                  <option value="Packaging Supplies">Packaging Supplies (Film, Strapping)</option>
                  <option value="Material Handling Equipment">Material Handling Equipment</option>
                  <option value="Cold Chain Equipment">Cold Chain Equipment</option>
                </select>
              </div>
            </div>

            {/* Step 2: Logistics & Dimensions */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                2. Logistics, Weight & Dimensions
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="dim" className="text-xs">
                    Dimensions (L x W x H mm):
                  </Label>
                  <Input
                    id="dim"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="weight" className="text-xs">
                    Unit Weight (kg):
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="uom" className="text-xs">
                    Unit of Measure:
                  </Label>
                  <Input
                    id="uom"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="text-xs font-mono text-center"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Pricing & MOQ */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                3. B2B Pricing & Order Rules
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="price" className="text-xs">
                    Base Wholesale Net Price (PLN):
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="font-mono text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pmoq" className="text-xs">
                    Minimum Order Quantity (MOQ):
                  </Label>
                  <Input
                    id="pmoq"
                    type="number"
                    min="1"
                    value={moq}
                    onChange={(e) => setMoq(Number(e.target.value))}
                    className="font-mono text-xs font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Initial Warehouse Allocation */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                4. Primary Warehouse Initial Inventory
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="wh" className="text-xs">
                    Receiving Warehouse Hub:
                  </Label>
                  <select
                    id="wh"
                    value={warehouse}
                    onChange={(e) => setWarehouse(e.target.value)}
                    className="w-full p-2 text-xs border rounded-md bg-white dark:bg-slate-900"
                  >
                    <option value="Central DC Warszawa (WH-WAW-01)">Central DC Warszawa (WH-WAW-01)</option>
                    <option value="Silesia Logistics Hub Katowice (WH-KTW-03)">Silesia Logistics Hub Katowice (WH-KTW-03)</option>
                    <option value="Port Logistics Hub Szczecin (WH-SZC-02)">Port Logistics Hub Szczecin (WH-SZC-02)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="initStock" className="text-xs">
                    Initial Physical Units Received:
                  </Label>
                  <Input
                    id="initStock"
                    type="number"
                    min="0"
                    value={initialStock}
                    onChange={(e) => setInitialStock(Number(e.target.value))}
                    className="font-mono text-xs font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => navigate({ to: '/supplier/products' })}>
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white gap-2 font-semibold">
                <Plus className="h-4 w-4" /> Save SKU & Create Inventory Record
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
