import { createFileRoute, Link } from '@tanstack/react-router';
import {
  ShoppingCart,
  Trash2,
  Building2,
  Truck,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Plus,
  Minus,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/service/cart/cart-store';

export const Route = createFileRoute('/buyer/cart')({
  component: BuyerCartPage,
  staticData: {
    crumb: {
      label: 'Shopping Cart',
    },
  },
});

function BuyerCartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    clearVendor,
    getVendorGroups,
    getTotalItemsCount,
    getTotalNet,
    getTotalGross,
  } = useCartStore();

  const vendorGroups = getVendorGroups();
  const totalItems = getTotalItemsCount();
  const totalNet = getTotalNet();
  const totalGross = getTotalGross();
  const totalVat = Math.round((totalGross - totalNet) * 100) / 100;
  const totalWeightKg = items.reduce((sum, i) => sum + i.weightKg * i.quantity, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              B2B Procurement Cart
            </h1>
            <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">
              Screen P05A: Multi-Vendor Split
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Orders are automatically partitioned into separate purchase contracts by supplier to streamline dispatch and invoicing.
          </p>
        </div>

        {items.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearCart}
            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear Entire Cart
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800 p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
            <ShoppingCart className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            Your B2B Cart is empty
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            Review wholesale catalog items, tiered pricing discounts, and add items to begin procurement.
          </p>
          <Link to="/buyer/catalog">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              Browse B2B Catalog <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Vendor Grouped Items */}
          <div className="lg:col-span-2 space-y-6">
            {vendorGroups.map((group) => (
              <Card
                key={group.vendorId}
                className="border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs"
              >
                {/* Vendor Header */}
                <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3.5 px-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <Building2 className="h-4 w-4 text-emerald-600" />
                      <div>
                        <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                          {group.vendorName}
                        </span>
                        <span className="font-mono text-xs text-slate-500 ml-2">NIP: {group.vendorNip}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-2xs font-semibold gap-1">
                        <Truck className="h-3 w-3" /> Incoterms: {group.incoterms}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 hover:text-red-600"
                        onClick={() => clearVendor(group.vendorId)}
                        title="Remove supplier package"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Vendor Items Table */}
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {group.items.map((item) => (
                      <div
                        key={item.sku}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {item.sku}
                            </span>
                            <span className="text-2xs text-muted-foreground">{item.category}</span>
                          </div>
                          <Link
                            to="/buyer/catalog/$sku"
                            params={{ sku: item.sku }}
                            className="text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-emerald-600 transition-colors"
                          >
                            {item.name}
                          </Link>
                          <div className="text-xs text-slate-500 flex items-center gap-3">
                            <span>Unit: {item.unitPrice.toFixed(2)} PLN</span>
                            <span>Weight: {(item.weightKg * item.quantity).toFixed(1)} kg</span>
                            <span>MOQ: {item.moq} {item.unit}</span>
                          </div>
                        </div>

                        {/* Quantity Controls & Subtotal */}
                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <div className="flex items-center border rounded-lg overflow-hidden bg-white dark:bg-slate-950">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none"
                              onClick={() => updateQuantity(item.sku, item.quantity - item.moq)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              min={item.moq}
                              step={item.moq}
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.sku, Number(e.target.value))}
                              className="h-8 w-16 text-center font-mono text-xs border-0 focus-visible:ring-0"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none"
                              onClick={() => updateQuantity(item.sku, item.quantity + item.moq)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="text-right min-w-[100px]">
                            <div className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                              {(item.unitPrice * item.quantity).toFixed(2)} PLN
                            </div>
                            <div className="text-2xs text-slate-500">Net total</div>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-600"
                            onClick={() => removeItem(item.sku)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Vendor Group Subtotal Footer */}
                  <div className="bg-slate-50/50 dark:bg-slate-900/50 p-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div className="text-slate-500">
                      Total shipment weight: <strong>{group.totalWeightKg.toFixed(1)} kg</strong>
                    </div>
                    <div className="flex items-center gap-4">
                      <span>Net: <strong>{group.subtotalNet.toLocaleString()} PLN</strong></span>
                      <span>VAT (23%): <strong>{group.vatAmount.toLocaleString()} PLN</strong></span>
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Gross: {group.grossAmount.toLocaleString()} PLN
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Right Column: Global Order Summary */}
          <div className="space-y-6">
            <Card className="sticky top-6 border-slate-200 dark:border-slate-800 shadow-md">
              <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-base font-semibold">Total Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Lines:</span>
                    <span className="font-semibold">{items.length} positions</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Units:</span>
                    <span className="font-semibold">{totalItems} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gross Freight Weight:</span>
                    <span className="font-semibold">{(totalWeightKg / 1000).toFixed(2)} tons ({totalWeightKg.toFixed(0)} kg)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vendors Split:</span>
                    <span className="font-semibold">{vendorGroups.length} separate orders</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Net Total:</span>
                    <span className="font-mono font-semibold">{totalNet.toLocaleString()} PLN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">VAT (23% PL):</span>
                    <span className="font-mono font-semibold">{totalVat.toLocaleString()} PLN</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-bold text-base text-slate-900 dark:text-slate-100">
                    <span>Grand Total:</span>
                    <span className="font-mono text-emerald-600">
                      {totalGross.toLocaleString()} PLN
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    B2B Trade Credit Net 30 is available at checkout for verified accounts.
                  </span>
                </div>

                <Link to="/buyer/checkout" className="block">
                  <Button
                    size="lg"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-semibold shadow-xs"
                  >
                    Proceed to B2B Checkout <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>

                <Link
                  to="/buyer/catalog"
                  className="block text-center text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  Continue Shopping
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
