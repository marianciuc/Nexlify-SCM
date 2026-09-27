import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ShoppingCart,
  Building2,
  Package,
  Layers,
  ShieldCheck,
  Truck,
  TrendingDown,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileText,
  Warehouse,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCartStore } from '@/service/cart/cart-store';

export const Route = createFileRoute('/buyer/catalog/$sku')({
  component: SkuDetailPage,
  staticData: {
    crumb: {
      label: 'SKU Detail',
    },
  },
});

const SKU_DATABASE: Record<
  string,
  {
    sku: string;
    name: string;
    category: string;
    basePrice: number;
    unit: string;
    moq: number;
    weightKg: number;
    volumeM3: number;
    dimensions: string;
    palletCapacity: number;
    supplierName: string;
    supplierNip: string;
    supplierRating: number;
    leadTimeDays: number;
    description: string;
    certifications: { name: string; issuer: string; date: string }[];
    tieredPricing: { minQty: number; price: number; discountPercent: number }[];
    warehouses: { name: string; code: string; stock: number; dispatchWindow: string }[];
    substitutes: {
      sku: string;
      name: string;
      price: number;
      supplier: string;
      reason: string;
      matchPercent: number;
    }[];
  }
> = {
  'SKU-PAL-01': {
    sku: 'SKU-PAL-01',
    name: 'EPAL Euro-Pallet Standard (Pine Wood)',
    category: 'Packaging & Cargo Units',
    basePrice: 120.0,
    unit: 'pcs',
    moq: 20,
    weightKg: 25.0,
    volumeM3: 0.144,
    dimensions: '1200 x 800 x 144 mm',
    palletCapacity: 1500,
    supplierName: 'Drewnex Palety Sp. z o.o.',
    supplierNip: '7822910483',
    supplierRating: 98.4,
    leadTimeDays: 1,
    description:
      'Standardized European wooden 4-way pallet conforming to UIC 435-2 and EN 13698-1 specifications. Manufactured from certified sustainably harvested Polish pine wood, heat-treated per ISPM 15 standards for international cross-border cargo transport.',
    certifications: [
      { name: 'EPAL Quality License (UIC 435-2)', issuer: 'European Pallet Association', date: 'Valid to 2028' },
      { name: 'ISPM 15 / IPPC Heat Treated (HT)', issuer: 'Polish State Plant Health Inspectorate', date: 'HT-56/2026' },
      { name: 'FSC 100% Chain of Custody', issuer: 'Forest Stewardship Council', date: 'FSC-C149201' },
    ],
    tieredPricing: [
      { minQty: 20, price: 120.0, discountPercent: 0 },
      { minQty: 100, price: 111.0, discountPercent: 7.5 },
      { minQty: 500, price: 102.0, discountPercent: 15.0 },
      { minQty: 2000, price: 96.0, discountPercent: 20.0 },
    ],
    warehouses: [
      { name: 'Central DC Warszawa', code: 'WH-WAW-01', stock: 1420, dispatchWindow: 'Same-day (Order before 14:00)' },
      { name: 'Silesia Logistics Hub Katowice', code: 'WH-KTW-03', stock: 350, dispatchWindow: 'Within 24 hours' },
      { name: 'Port Logistics Hub Szczecin', code: 'WH-SZC-02', stock: 80, dispatchWindow: 'Within 48 hours' },
    ],
    substitutes: [
      {
        sku: 'SKU-PAL-COMP-01',
        name: 'Pressed Wood One-Way Export Pallet 1200x800',
        price: 89.0,
        supplier: 'TimberEco Sp. z o.o.',
        reason: 'Lighter weight (14kg), nestable, exempt from ISPM-15, ideal for air/sea export.',
        matchPercent: 92,
      },
      {
        sku: 'SKU-PAL-HDPE-02',
        name: 'Heavy Duty Plastic Hygiene Pallet HDPE',
        price: 245.0,
        supplier: 'PlastBox SCM S.A.',
        reason: 'Washable, zero splinter risk, required for strict pharma & food cleanrooms.',
        matchPercent: 88,
      },
    ],
  },
  'SKU-STR-05': {
    sku: 'SKU-STR-05',
    name: 'Industrial Stretch Film 23mic (Roll 300m)',
    category: 'Packaging Supplies',
    basePrice: 411.25,
    unit: 'rolls',
    moq: 5,
    weightKg: 3.2,
    volumeM3: 0.015,
    dimensions: '500 mm x 300 m',
    palletCapacity: 240,
    supplierName: 'PlastChem Industrial Sp. k.',
    supplierNip: '8942019485',
    supplierRating: 97.2,
    leadTimeDays: 2,
    description:
      'High-performance 3-layer cast polyethylene stretch wrap engineered for automatic and manual pallet wrapping. Provides exceptional puncture resistance and high elongation memory to secure heavy, irregular pallet loads during long-haul transport.',
    certifications: [
      { name: 'ISO 9001:2015 Manufacturing Standard', issuer: 'TÜV Rheinland Poland', date: 'Valid to 2027' },
      { name: 'RoHS 3 Compliance (EU 2015/863)', issuer: 'SGS International', date: 'Certified' },
    ],
    tieredPricing: [
      { minQty: 5, price: 411.25, discountPercent: 0 },
      { minQty: 25, price: 382.5, discountPercent: 7.0 },
      { minQty: 100, price: 349.5, discountPercent: 15.0 },
    ],
    warehouses: [
      { name: 'Central DC Warszawa', code: 'WH-WAW-01', stock: 420, dispatchWindow: 'Same-day' },
      { name: 'Poznań DC Logistics', code: 'WH-POZ-01', stock: 180, dispatchWindow: 'Within 24 hours' },
    ],
    substitutes: [
      {
        sku: 'SKU-STR-NANO-01',
        name: 'Multi-layer Nano Stretch Film 15mic',
        price: 435.0,
        supplier: 'EcoWrap Technologies',
        reason: 'Uses 35% less plastic by weight with equivalent holding force.',
        matchPercent: 95,
      },
    ],
  },
  'SKU-HYD-02': {
    sku: 'SKU-HYD-02',
    name: 'Hydraulic Hand Pallet Truck 2.5t (Tandem PU)',
    category: 'Material Handling Equipment',
    basePrice: 1420.05,
    unit: 'units',
    moq: 1,
    weightKg: 78.0,
    volumeM3: 0.45,
    dimensions: '1150 x 540 x 1230 mm',
    palletCapacity: 2500,
    supplierName: 'Baltic Heavy Freight & Tools',
    supplierNip: '8522619472',
    supplierRating: 99.1,
    leadTimeDays: 3,
    description:
      'Industrial grade hydraulic hand pallet truck with reinforced welded chassis and overload safety valve. Tandem polyurethane steering and load rollers ensure silent rolling over warehouse expansion joints and wire mesh docks.',
    certifications: [
      { name: 'CE Machinery Directive 2006/42/EC', issuer: 'UDT Poland', date: 'Compliant' },
      { name: 'EN 1757-2 Industrial Safety Directive', issuer: 'CEER European Registry', date: 'Certified' },
    ],
    tieredPricing: [
      { minQty: 1, price: 1420.05, discountPercent: 0 },
      { minQty: 5, price: 1335.0, discountPercent: 6.0 },
      { minQty: 10, price: 1250.0, discountPercent: 12.0 },
    ],
    warehouses: [
      { name: 'Port Logistics Hub Szczecin', code: 'WH-SZC-02', stock: 18, dispatchWindow: '2-3 business days' },
    ],
    substitutes: [
      {
        sku: 'SKU-ELEC-PAL-01',
        name: 'Semi-Electric Pallet Jack 1.8t Lithium-Ion',
        price: 3890.0,
        supplier: 'Linde Handling Solutions',
        reason: 'Motorized drive reduces operator fatigue in large cross-docking facilities.',
        matchPercent: 80,
      },
    ],
  },
  'SKU-COL-09': {
    sku: 'SKU-COL-09',
    name: 'Insulated Thermobox 60L Pharma/Food Grade',
    category: 'Cold Chain Equipment',
    basePrice: 224.33,
    unit: 'boxes',
    moq: 10,
    weightKg: 4.8,
    volumeM3: 0.08,
    dimensions: '600 x 400 x 360 mm',
    palletCapacity: 120,
    supplierName: 'Pomerania Foods & Pharma Packaging',
    supplierNip: '5832918471',
    supplierRating: 98.8,
    leadTimeDays: 1,
    description:
      'Heavy-duty expanded polypropylene (EPP) thermal insulated shipper container. Maintains qualified temperature range (+2°C to +8°C or -20°C) for up to 72 hours when packed with certified PCM eutectic cooling plates.',
    certifications: [
      { name: 'EU GDP Pharma Distribution Qualified', issuer: 'Polish Chief Pharmaceutical Inspectorate', date: 'Valid 2029' },
      { name: 'HACCP & EC 1935/2004 Food Contact', issuer: 'PZH National Institute of Hygiene', date: 'Approved' },
    ],
    tieredPricing: [
      { minQty: 10, price: 224.33, discountPercent: 0 },
      { minQty: 50, price: 206.38, discountPercent: 8.0 },
      { minQty: 200, price: 190.68, discountPercent: 15.0 },
    ],
    warehouses: [
      { name: 'Central DC Warszawa', code: 'WH-WAW-01', stock: 850, dispatchWindow: 'Same-day dispatch' },
    ],
    substitutes: [],
  },
};

function SkuDetailPage() {
  const { sku } = Route.useParams();
  const addItemToCart = useCartStore((s) => s.addItem);

  const product = useMemo(() => {
    return SKU_DATABASE[sku] || SKU_DATABASE['SKU-PAL-01']!;
  }, [sku]);

  // Tiered Pricing Calculator State
  const [calculatorQty, setCalculatorQty] = useState<number>(product.moq);

  const pricingCalculation = useMemo(() => {
    let effectivePrice = product.basePrice;
    let discountPercent = 0;

    // Find best tiered pricing tier
    for (const tier of product.tieredPricing) {
      if (calculatorQty >= tier.minQty) {
        effectivePrice = tier.price;
        discountPercent = tier.discountPercent;
      }
    }

    const totalNet = effectivePrice * calculatorQty;
    const totalWithoutDiscount = product.basePrice * calculatorQty;
    const totalSavings = totalWithoutDiscount - totalNet;
    const vatAmount = totalNet * 0.23;
    const grossAmount = totalNet + vatAmount;

    return {
      effectivePrice,
      discountPercent,
      totalNet,
      totalSavings,
      vatAmount,
      grossAmount,
    };
  }, [calculatorQty, product]);

  const handleAddToCart = () => {
    if (calculatorQty < product.moq) {
      toast.error(`Order quantity cannot be lower than MOQ (${product.moq} ${product.unit})`);
      return;
    }
    addItemToCart(
      {
        sku: product.sku,
        name: product.name,
        category: product.category,
        unitPrice: pricingCalculation.effectivePrice,
        moq: product.moq,
        unit: product.unit,
        vendorId: product.supplierNip,
        vendorName: product.supplierName,
        vendorNip: product.supplierNip,
        weightKg: product.weightKg,
        volumeM3: product.volumeM3,
      },
      calculatorQty
    );
    toast.success(`Added ${calculatorQty} ${product.unit} to cart with ${pricingCalculation.discountPercent}% B2B discount!`);
  };

  const totalStockAcrossWarehouses = product.warehouses.reduce((acc, w) => acc + w.stock, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Navigation Breadcrumb Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/buyer/catalog"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Catalog
        </Link>
        <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">
          Screen P04: SKU Card & Pricing Engine
        </Badge>
      </div>

      {/* Main Grid: 2 Columns (Content Tabs + Sticky Purchasing Box) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Product Info & Tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Summary Card */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                      {product.sku}
                    </span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      {product.category}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {product.name}
                  </h1>
                </div>

                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Contract Wholesale Base:</div>
                  <div className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {product.basePrice.toFixed(2)} PLN <span className="text-sm font-normal text-slate-500">/ {product.unit}</span>
                  </div>
                </div>
              </div>

              {/* Badges / Key Specs Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Supplier:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{product.supplierName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Lead Time:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{product.leadTimeDays} business day</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Stock:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {totalStockAcrossWarehouses} {product.unit} available
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Supplier Rating:</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">★ {product.supplierRating} / 100 OTIF</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed 4-Tabs View */}
          <Tabs defaultValue="calculator" className="w-full">
            <TabsList className="grid grid-cols-4 w-full bg-slate-100 dark:bg-slate-800 p-1">
              <TabsTrigger value="calculator" className="text-xs gap-1.5">
                <TrendingDown className="h-3.5 w-3.5" /> Tiered Pricing
              </TabsTrigger>
              <TabsTrigger value="specs" className="text-xs gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Specs & ISO
              </TabsTrigger>
              <TabsTrigger value="warehouses" className="text-xs gap-1.5">
                <Warehouse className="h-3.5 w-3.5" /> Stock & Hubs
              </TabsTrigger>
              <TabsTrigger value="substitutes" className="text-xs gap-1.5">
                <Layers className="h-3.5 w-3.5" /> Substitutes
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Tiered Pricing Calculator */}
            <TabsContent value="calculator" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center justify-between">
                    <span>Volume Discount Schedule (Tiered Pricing)</span>
                    <Badge variant="secondary" className="text-xs">Contract Rules Active</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {product.tieredPricing.map((tier, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          calculatorQty >= tier.minQty
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50'
                        }`}
                      >
                        <div className="text-xs text-muted-foreground font-medium">
                          From {tier.minQty} {product.unit}
                        </div>
                        <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                          {tier.price.toFixed(2)} PLN
                        </div>
                        <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {tier.discountPercent > 0 ? `-${tier.discountPercent}% Discount` : 'Standard Price'}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Interactive Live Calculator */}
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Live Discount Calculator
                    </Label>
                    <div className="flex items-center gap-4">
                      <div className="w-48">
                        <Input
                          type="number"
                          min={product.moq}
                          step={product.moq}
                          value={calculatorQty}
                          onChange={(e) => setCalculatorQty(Math.max(product.moq, Number(e.target.value)))}
                          className="font-mono text-base font-bold bg-white dark:bg-slate-950"
                        />
                      </div>
                      <div className="text-xs text-slate-500">
                        Units ({product.unit}). Minimum order: <strong>{product.moq} {product.unit}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-sm">
                      <div>
                        <span className="text-xs text-slate-500 block">Applied Unit Price:</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                          {pricingCalculation.effectivePrice.toFixed(2)} PLN
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block">Total Net Amount:</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                          {pricingCalculation.totalNet.toLocaleString()} PLN
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block">Total Volume Savings:</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          +{pricingCalculation.totalSavings.toLocaleString()} PLN ({pricingCalculation.discountPercent}%)
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block">Gross (VAT 23%):</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                          {pricingCalculation.grossAmount.toLocaleString()} PLN
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 2: Specs & Certifications */}
            <TabsContent value="specs" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Technical Specifications & Logistics Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {product.description}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl text-xs">
                    <div>
                      <span className="text-slate-500 block">Dimensions (L x W x H):</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{product.dimensions}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Unit Net Weight:</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{product.weightKg} kg</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Unit Volume:</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{product.volumeM3} m³</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Max Safe Load / Capacity:</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{product.palletCapacity} kg</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Minimal Order Qty (MOQ):</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{product.moq} {product.unit}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Manufacturer NIP:</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{product.supplierNip}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Compliance Certificates & Audited Documents
                    </h4>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 border rounded-xl overflow-hidden">
                      {product.certifications.map((cert, idx) => (
                        <div key={idx} className="p-3 flex items-center justify-between text-xs bg-white dark:bg-slate-950">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-600" />
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-slate-100">{cert.name}</div>
                              <div className="text-slate-500">{cert.issuer}</div>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs text-emerald-700 bg-emerald-50">
                            {cert.date}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: Stock by Regional Warehouses */}
            <TabsContent value="warehouses" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Regional Warehouse Allocation & Dispatch Time</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {product.warehouses.map((wh, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                          <Warehouse className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{wh.name}</div>
                          <div className="text-xs font-mono text-slate-500">{wh.code}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
                            {wh.stock} {product.unit}
                          </div>
                          <div className="text-xs text-emerald-600 font-medium">Ready in stock</div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {wh.dispatchWindow}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 4: Compatible Substitutes */}
            <TabsContent value="substitutes" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    Market Substitutes & Compatible Alternates (RFQ Engine)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {product.substitutes.length === 0 ? (
                    <div className="text-sm text-slate-500 p-4 text-center">
                      No alternate items registered for this SKU.
                    </div>
                  ) : (
                    product.substitutes.map((sub, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-mono text-xs text-slate-500">{sub.sku}</span>
                            <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                              {sub.name}
                            </div>
                            <div className="text-xs text-slate-500">Offered by {sub.supplier}</div>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                              {sub.matchPercent}% Compatibility
                            </Badge>
                            <div className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100 mt-1">
                              {sub.price.toFixed(2)} PLN
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                          <strong>Technical comparison:</strong> {sub.reason}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Sticky Purchasing Action Card */}
        <div className="space-y-6">
          <Card className="sticky top-6 border-slate-200 dark:border-slate-800 shadow-md">
            <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base font-semibold">Wholesale Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Unit Price with Tiered Discount:</span>
                <div className="text-3xl font-mono font-extrabold text-slate-900 dark:text-slate-100">
                  {pricingCalculation.effectivePrice.toFixed(2)}{' '}
                  <span className="text-sm font-normal text-slate-500">PLN / {product.unit}</span>
                </div>
                {pricingCalculation.discountPercent > 0 && (
                  <Badge className="bg-emerald-500 text-white text-xs">
                    {pricingCalculation.discountPercent}% B2B Volume Discount Applied
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Order Quantity ({product.unit}):</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={product.moq}
                    step={product.moq}
                    value={calculatorQty}
                    onChange={(e) => setCalculatorQty(Math.max(product.moq, Number(e.target.value)))}
                    className="font-mono font-bold text-center"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCalculatorQty(calculatorQty + product.moq)}
                  >
                    +{product.moq}
                  </Button>
                </div>
                <p className="text-2xs text-muted-foreground">
                  Minimum Order Quantity: {product.moq} {product.unit}.
                </p>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal Net:</span>
                  <span className="font-mono font-semibold">{pricingCalculation.totalNet.toLocaleString()} PLN</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Volume Savings:</span>
                  <span className="font-mono">-{pricingCalculation.totalSavings.toLocaleString()} PLN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">VAT (23%):</span>
                  <span className="font-mono">{pricingCalculation.vatAmount.toLocaleString()} PLN</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-bold text-sm text-slate-900 dark:text-slate-100">
                  <span>Gross Total:</span>
                  <span className="font-mono text-emerald-600">
                    {pricingCalculation.grossAmount.toLocaleString()} PLN
                  </span>
                </div>
              </div>

              {/* Incoterms & Freight note */}
              <div className="flex items-start gap-2 text-xs text-slate-500">
                <Truck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Delivery terms: <strong>DAP (Delivered at Place)</strong> or EXW available at checkout.
                </span>
              </div>

              {/* Add to Cart Button */}
              <Button
                size="lg"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-semibold shadow-xs"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4" />
                Add {calculatorQty} {product.unit} to Cart
              </Button>

              <Link to="/buyer/cart" className="block text-center text-xs text-emerald-600 hover:underline">
                Proceed to Checkout
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
