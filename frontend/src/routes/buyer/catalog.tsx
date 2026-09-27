import { createFileRoute, Link, Outlet, useChildMatches } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Layers,
  LayoutGrid,
  List,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Building2,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useInventoryQuery, INITIAL_STOCK } from '@/hooks/useScmQueries';
import { useCartStore } from '@/service/cart/cart-store';
import type { StockItem } from '@/types/scm-domain';

export const Route = createFileRoute('/buyer/catalog')({
  component: BuyerCatalogPage,
  staticData: {
    crumb: {
      label: 'B2B Catalog',
    },
  },
});

interface EnhancedStockItem extends StockItem {
  moq: number;
  weightKg: number;
  volumeM3: number;
  supplierName: string;
  supplierNip: string;
  leadTimeDays: number;
  tieredPricing: { minQty: number; price: number; discountPercent: number }[];
  certifications: string[];
}

const ENHANCED_CATALOG: EnhancedStockItem[] = [
  {
    id: '1',
    sku: 'SKU-PAL-01',
    name: 'EPAL Euro-Pallet Standard (Pine Wood)',
    category: 'Packaging & Cargo Units',
    warehouse: 'Central DC Warszawa (WH-WAW-01)',
    quantityAvailable: 1850,
    quantityReserved: 100,
    unit: 'pcs',
    unitPrice: 120.0,
    status: 'IN_STOCK',
    moq: 20,
    weightKg: 25.0,
    volumeM3: 0.144,
    supplierName: 'Drewnex Palety Sp. z o.o.',
    supplierNip: '7822910483',
    leadTimeDays: 1,
    tieredPricing: [
      { minQty: 20, price: 120.0, discountPercent: 0 },
      { minQty: 100, price: 111.0, discountPercent: 7.5 },
      { minQty: 500, price: 102.0, discountPercent: 15.0 },
    ],
    certifications: ['EPAL / UIC 435-2', 'ISPM 15 / IPPC (Heat Treated)'],
  },
  {
    id: '2',
    sku: 'SKU-STR-05',
    name: 'Industrial Stretch Film 23mic (Roll 300m)',
    category: 'Packaging Supplies',
    warehouse: 'Central DC Warszawa (WH-WAW-01)',
    quantityAvailable: 420,
    quantityReserved: 40,
    unit: 'rolls',
    unitPrice: 411.25,
    status: 'IN_STOCK',
    moq: 5,
    weightKg: 3.2,
    volumeM3: 0.015,
    supplierName: 'PlastChem Industrial Sp. k.',
    supplierNip: '8942019485',
    leadTimeDays: 2,
    tieredPricing: [
      { minQty: 5, price: 411.25, discountPercent: 0 },
      { minQty: 25, price: 382.5, discountPercent: 7.0 },
      { minQty: 100, price: 349.5, discountPercent: 15.0 },
    ],
    certifications: ['ISO 9001:2015', 'RoHS Compliant'],
  },
  {
    id: '3',
    sku: 'SKU-HYD-02',
    name: 'Hydraulic Hand Pallet Truck 2.5t (Tandem PU)',
    category: 'Material Handling Equipment',
    warehouse: 'Port Logistics Hub Szczecin (WH-SZC-02)',
    quantityAvailable: 18,
    quantityReserved: 10,
    unit: 'units',
    unitPrice: 1420.05,
    status: 'LOW_STOCK',
    moq: 1,
    weightKg: 78.0,
    volumeM3: 0.45,
    supplierName: 'Baltic Heavy Freight & Tools',
    supplierNip: '8522619472',
    leadTimeDays: 3,
    tieredPricing: [
      { minQty: 1, price: 1420.05, discountPercent: 0 },
      { minQty: 5, price: 1335.0, discountPercent: 6.0 },
      { minQty: 10, price: 1250.0, discountPercent: 12.0 },
    ],
    certifications: ['CE Marking', 'EN 1757-2 Safety Directive'],
  },
  {
    id: '4',
    sku: 'SKU-COL-09',
    name: 'Insulated Thermobox 60L Pharma/Food Grade',
    category: 'Cold Chain Equipment',
    warehouse: 'Central DC Warszawa (WH-WAW-01)',
    quantityAvailable: 850,
    quantityReserved: 300,
    unit: 'boxes',
    unitPrice: 224.33,
    status: 'IN_STOCK',
    moq: 10,
    weightKg: 4.8,
    volumeM3: 0.08,
    supplierName: 'Pomerania Foods & Pharma Packaging',
    supplierNip: '5832918471',
    leadTimeDays: 1,
    tieredPricing: [
      { minQty: 10, price: 224.33, discountPercent: 0 },
      { minQty: 50, price: 206.38, discountPercent: 8.0 },
      { minQty: 200, price: 190.68, discountPercent: 15.0 },
    ],
    certifications: ['HACCP Compliant', 'GDP Pharma Transport Certified'],
  },
];

function BuyerCatalogPage() {
  const childMatches = useChildMatches();
  if (childMatches.length > 0) {
    return <Outlet />;
  }
  return <BuyerCatalogContent />;
}

function BuyerCatalogContent() {
  const { data: stockItems = INITIAL_STOCK } = useInventoryQuery();
  const addItemToCart = useCartStore((s) => s.addItem);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [quickQuantities, setQuickQuantities] = useState<Record<string, number>>({});

  const categories = useMemo(() => {
    const set = new Set(ENHANCED_CATALOG.map((i) => i.category));
    return ['ALL', ...Array.from(set)];
  }, []);

  const filteredItems = useMemo(() => {
    return ENHANCED_CATALOG.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchesStock =
        selectedStockStatus === 'ALL' ||
        (selectedStockStatus === 'IN_STOCK' && item.quantityAvailable > 50) ||
        (selectedStockStatus === 'LOW_STOCK' && item.quantityAvailable <= 50);
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [searchTerm, selectedCategory, selectedStockStatus]);

  const handleQuickAddToCart = (item: EnhancedStockItem) => {
    const qty = quickQuantities[item.sku] || item.moq;
    if (qty < item.moq) {
      toast.error(`Minimal Order Quantity (MOQ) for ${item.sku} is ${item.moq} ${item.unit}`);
      return;
    }
    addItemToCart(
      {
        sku: item.sku,
        name: item.name,
        category: item.category,
        unitPrice: item.unitPrice,
        moq: item.moq,
        unit: item.unit,
        vendorId: item.supplierNip,
        vendorName: item.supplierName,
        vendorNip: item.supplierNip,
        weightKg: item.weightKg,
        volumeM3: item.volumeM3,
      },
      qty
    );
    toast.success(`Added ${qty} ${item.unit} of ${item.name} to cart`);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              B2B Product Catalog
            </h1>
            <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">
              Screen P03
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Explore wholesale inventory with personal contract tiered pricing, MOQ verification, and live warehouse availability.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/buyer/cart">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs gap-2">
              <ShoppingCart className="h-4 w-4" />
              View Cart / Checkout
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden="true" />
          <Input
            placeholder="Search SKU, product name, or supplier..."
            aria-label="Search catalog by SKU, product name, or supplier"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-50 dark:bg-slate-950"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs" role="group" aria-label="Filter by category">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                aria-pressed={selectedCategory === cat}
                className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {cat === 'ALL' ? 'All Categories' : cat}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 border-l pl-2 border-slate-200 dark:border-slate-700" role="group" aria-label="View layout mode">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8 min-h-[32px] min-w-[32px]"
              aria-label="Switch to grid layout view"
              aria-pressed={viewMode === 'grid'}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8 min-h-[32px] min-w-[32px]"
              aria-label="Switch to tabular layout view"
              aria-pressed={viewMode === 'table'}
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      {/* Product Display: Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const currentQty = quickQuantities[item.sku] || item.moq;
            return (
              <Card
                key={item.sku}
                className="overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-white/80 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300">
                        {item.sku}
                      </span>
                      <Badge
                        variant={item.status === 'IN_STOCK' ? 'default' : 'destructive'}
                        className={
                          item.status === 'IN_STOCK'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 text-xs'
                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300 text-xs'
                        }
                      >
                        {item.status === 'IN_STOCK' ? (
                          <CheckCircle2 className="h-3 w-3 mr-1 inline" aria-hidden="true" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 mr-1 inline" aria-hidden="true" />
                        )}
                        <span className="tabular-nums font-semibold">{item.quantityAvailable}</span>&nbsp;{item.unit} available
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-slate-500" aria-hidden="true" />
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate">
                        {item.supplierName}
                      </span>
                    </div>
                  </div>

                  <CardContent className="p-4 space-y-3">
                    <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      {item.category}
                    </div>

                    <Link
                      to="/buyer/catalog/$sku"
                      params={{ sku: item.sku }}
                      className="text-base font-semibold text-slate-900 dark:text-slate-100 hover:text-emerald-600 transition-colors line-clamp-2"
                    >
                      {item.name}
                    </Link>

                    {/* Tiered Pricing Teaser */}
                    <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Base Wholesale:</span>
                        <span className="text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100">
                          {item.unitPrice.toFixed(2)}&nbsp;PLN / {item.unit}
                        </span>
                      </div>
                      {item.tieredPricing.length > 1 && item.tieredPricing[item.tieredPricing.length - 1] && (
                        <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          <span className="flex items-center gap-1">
                            <TrendingDown className="h-3 w-3" aria-hidden="true" />
                            Up to {item.tieredPricing[item.tieredPricing.length - 1]!.discountPercent}% off:
                          </span>
                          <span className="tabular-nums font-semibold">
                            {item.tieredPricing[item.tieredPricing.length - 1]!.price.toFixed(2)}&nbsp;PLN
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 flex items-center justify-between">
                      <span>MOQ: <strong className="tabular-nums">{item.moq}</strong> {item.unit}</span>
                      <span>Lead Time: <strong className="tabular-nums">{item.leadTimeDays}d</strong> dispatch</span>
                    </div>
                  </CardContent>
                </div>

                {/* Card Footer with Quick Add & Details Link */}
                <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 mt-2">
                  <div className="w-20">
                    <Input
                      type="number"
                      min={item.moq}
                      step={item.moq}
                      aria-label={`Order quantity for ${item.name}`}
                      value={currentQty}
                      onChange={(e) =>
                        setQuickQuantities({
                          ...quickQuantities,
                          [item.sku]: Number(e.target.value),
                        })
                      }
                      className="h-9 text-xs font-mono text-center tabular-nums"
                    />
                  </div>
                  <Button
                    size="sm"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
                    aria-label={`Add ${item.name} to cart`}
                    onClick={() => handleQuickAddToCart(item)}
                  >
                    <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />
                    Add
                  </Button>
                  <Link to="/buyer/catalog/$sku" params={{ sku: item.sku }} aria-label={`View full details of ${item.name}`}>
                    <Button size="icon" variant="outline" className="h-9 w-9" aria-label={`View full details of ${item.name}`}>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto shadow-2xs">
          <table className="w-full text-left text-sm min-w-[750px]">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium">
              <tr>
                <th className="py-3 px-4">SKU / Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Warehouse</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Base Price</th>
                <th className="py-3 px-4">MOQ</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.map((item) => (
                <tr key={item.sku} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <Link
                      to="/buyer/catalog/$sku"
                      params={{ sku: item.sku }}
                      className="font-semibold text-slate-900 dark:text-slate-100 hover:text-emerald-600 transition-colors"
                    >
                      {item.name}
                    </Link>
                    <div className="font-mono text-xs text-slate-500">{item.sku}</div>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400">{item.category}</td>
                  <td className="py-3.5 px-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                    {item.supplierName}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500">{item.warehouse}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant="outline" className="text-xs tabular-nums font-semibold">
                      {item.quantityAvailable}&nbsp;{item.unit}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                    {item.unitPrice.toFixed(2)}&nbsp;PLN
                  </td>
                  <td className="py-3.5 px-4 text-xs tabular-nums text-slate-600 dark:text-slate-400">
                    {item.moq}&nbsp;{item.unit}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs gap-1"
                        aria-label={`Add ${item.name} to cart`}
                        onClick={() => handleQuickAddToCart(item)}
                      >
                        <ShoppingCart className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                        Add
                      </Button>
                      <Link to="/buyer/catalog/$sku" params={{ sku: item.sku }} aria-label={`View details of ${item.name}`}>
                        <Button size="sm" variant="ghost" className="text-xs">
                          Details <ArrowRight className="h-3 w-3 ml-1" aria-hidden="true" />
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
