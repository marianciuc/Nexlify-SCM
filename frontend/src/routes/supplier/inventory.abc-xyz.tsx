import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Grid,
  TrendingUp,
  Package,
  Layers,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/supplier/inventory/abc-xyz')({
  component: AbcXyzAnalysisPage,
  staticData: {
    crumb: {
      label: 'ABC/XYZ Matrix',
    },
  },
});

interface AbcItem {
  sku: string;
  name: string;
  annualRevenuePln: number;
  revenueSharePercent: number;
  variationCoefficientPercent: number;
  quadrant: 'AX' | 'AY' | 'AZ' | 'BX' | 'BY' | 'BZ' | 'CX' | 'CY' | 'CZ';
  recommendation: string;
}

const ABC_ITEMS: AbcItem[] = [
  {
    sku: 'SKU-PAL-01',
    name: 'EPAL Euro-Pallet Standard',
    annualRevenuePln: 1450000,
    revenueSharePercent: 62.5,
    variationCoefficientPercent: 6.8,
    quadrant: 'AX',
    recommendation: 'Golden Asset: High turnover, strictly predictable JIT replenishment with buffer of 3 days.',
  },
  {
    sku: 'SKU-STR-05',
    name: 'Industrial Stretch Film 23mic',
    annualRevenuePln: 420000,
    revenueSharePercent: 18.1,
    variationCoefficientPercent: 8.2,
    quadrant: 'BX',
    recommendation: 'Medium value, continuous demand: weekly automated reorder point.',
  },
  {
    sku: 'SKU-COL-09',
    name: 'Insulated Thermobox 60L Pharma',
    annualRevenuePln: 280000,
    revenueSharePercent: 12.0,
    variationCoefficientPercent: 21.4,
    quadrant: 'BY',
    recommendation: 'Seasonal fluctuations: increase safety stock in Q2/Q3 for summer food logistics.',
  },
  {
    sku: 'SKU-HYD-02',
    name: 'Hydraulic Hand Pallet Truck 2.5t',
    annualRevenuePln: 170000,
    revenueSharePercent: 7.4,
    variationCoefficientPercent: 34.0,
    quadrant: 'CZ',
    recommendation: 'Capital equipment, sporadic orders: assemble or order on-demand, minimize warehouse footprint.',
  },
];

function AbcXyzAnalysisPage() {
  const [selectedQuadrant, setSelectedQuadrant] = useState<string>('ALL');

  const filtered = ABC_ITEMS.filter((i) => {
    if (selectedQuadrant === 'ALL') return true;
    return i.quadrant === selectedQuadrant;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Grid className="h-6 w-6 text-amber-600" />
              ABC / XYZ Inventory Matrix Analysis
            </h1>
            <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">
              Enterprise SCM 2.0
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Dual-axis classification: Value contribution (ABC) vs Demand predictability & variation coefficient (XYZ).
          </p>
        </div>
      </div>

      {/* 3x3 Matrix Grid Visualizer */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-2xs">
        <CardHeader className="py-3 px-5 border-b">
          <CardTitle className="text-sm font-semibold">Interactive 9-Cell Classification Grid</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            {/* Row 1: A Category */}
            <div
              onClick={() => setSelectedQuadrant(selectedQuadrant === 'AX' ? 'ALL' : 'AX')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedQuadrant === 'AX'
                  ? 'border-emerald-600 bg-emerald-500/15 shadow-xs ring-2 ring-emerald-500'
                  : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 hover:border-emerald-400'
              }`}
            >
              <div className="font-extrabold text-sm text-emerald-800 dark:text-emerald-300">AX (Golden Core)</div>
              <div className="text-2xs text-emerald-700 dark:text-emerald-400 mt-1">
                High Value, Stable Demand. Strict JIT replenishment.
              </div>
              <Badge className="mt-2 bg-emerald-600 text-white text-2xs">1 SKU (62.5% Rev)</Badge>
            </div>

            <div
              onClick={() => setSelectedQuadrant(selectedQuadrant === 'AY' ? 'ALL' : 'AY')}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 cursor-pointer"
            >
              <div className="font-bold text-slate-800 dark:text-slate-200">AY (High Value Seasonal)</div>
              <div className="text-2xs text-slate-500 mt-1">Moderate variation, buffer stock required</div>
            </div>

            <div
              onClick={() => setSelectedQuadrant(selectedQuadrant === 'AZ' ? 'ALL' : 'AZ')}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 cursor-pointer"
            >
              <div className="font-bold text-slate-800 dark:text-slate-200">AZ (High Value Unstable)</div>
              <div className="text-2xs text-slate-500 mt-1">Expensive items with sporadic order spikes</div>
            </div>

            {/* Row 2: B Category */}
            <div
              onClick={() => setSelectedQuadrant(selectedQuadrant === 'BX' ? 'ALL' : 'BX')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedQuadrant === 'BX'
                  ? 'border-blue-600 bg-blue-500/15 shadow-xs ring-2 ring-blue-500'
                  : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 hover:border-blue-400'
              }`}
            >
              <div className="font-extrabold text-sm text-blue-800 dark:text-blue-300">BX (Steady Secondary)</div>
              <div className="text-2xs text-blue-700 dark:text-blue-400 mt-1">Regular consumables (Stretch Film)</div>
              <Badge className="mt-2 bg-blue-600 text-white text-2xs">1 SKU (18.1% Rev)</Badge>
            </div>

            <div
              onClick={() => setSelectedQuadrant(selectedQuadrant === 'BY' ? 'ALL' : 'BY')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedQuadrant === 'BY'
                  ? 'border-blue-600 bg-blue-500/15 shadow-xs ring-2 ring-blue-500'
                  : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 hover:border-blue-400'
              }`}
            >
              <div className="font-extrabold text-sm text-blue-800 dark:text-blue-300">BY (Cold Chain Boxes)</div>
              <div className="text-2xs text-blue-700 dark:text-blue-400 mt-1">Seasonal weather peaks</div>
              <Badge className="mt-2 bg-blue-600 text-white text-2xs">1 SKU (12.0% Rev)</Badge>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 cursor-pointer">
              <div className="font-bold text-slate-800 dark:text-slate-200">BZ (Medium Erratic)</div>
              <div className="text-2xs text-slate-500 mt-1">Order on confirmation</div>
            </div>

            {/* Row 3: C Category */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 cursor-pointer">
              <div className="font-bold text-slate-800 dark:text-slate-200">CX (Bulk Low-Cost)</div>
              <div className="text-2xs text-slate-500 mt-1">Pallet nails, standard strapping</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 cursor-pointer">
              <div className="font-bold text-slate-800 dark:text-slate-200">CY (Low Cost Seasonal)</div>
              <div className="text-2xs text-slate-500 mt-1">Specialized tape, desiccants</div>
            </div>

            <div
              onClick={() => setSelectedQuadrant(selectedQuadrant === 'CZ' ? 'ALL' : 'CZ')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedQuadrant === 'CZ'
                  ? 'border-red-600 bg-red-500/15 shadow-xs ring-2 ring-red-500'
                  : 'bg-red-50/50 dark:bg-red-950/20 border-red-200 hover:border-red-400'
              }`}
            >
              <div className="font-extrabold text-sm text-red-800 dark:text-red-300">CZ (Dead-Stock Risk)</div>
              <div className="text-2xs text-red-700 dark:text-red-400 mt-1">Heavy tools, zero floor buffer</div>
              <Badge className="mt-2 bg-red-600 text-white text-2xs">1 SKU (7.4% Rev)</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Item Table */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b text-slate-600 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4">SKU / Item</th>
                <th className="py-3 px-4 text-right">Annual Revenue</th>
                <th className="py-3 px-4 text-right">Rev Share</th>
                <th className="py-3 px-4 text-right">Variation (V)</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Operational Replenishment Policy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((item) => (
                <tr key={item.sku} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</div>
                    <div className="font-mono text-2xs text-slate-500">{item.sku}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-right text-slate-900 dark:text-slate-100">
                    {item.annualRevenuePln.toLocaleString()} PLN
                  </td>
                  <td className="py-3 px-4 font-mono text-right text-emerald-600 font-semibold">
                    {item.revenueSharePercent}%
                  </td>
                  <td className="py-3 px-4 font-mono text-right text-slate-600">
                    {item.variationCoefficientPercent}%
                  </td>
                  <td className="py-3 px-4">
                    <Badge className="font-bold text-2xs bg-amber-100 text-amber-900">
                      {item.quadrant}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {item.recommendation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
