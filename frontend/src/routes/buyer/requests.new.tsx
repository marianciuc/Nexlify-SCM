import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  FileQuestion,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/buyer/requests/new')({
  component: CreateRfqPage,
  staticData: {
    crumb: {
      label: 'New RFQ Tender',
    },
  },
});

interface RfqLineItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  unit: string;
  targetUnitPrice: number;
  allowSubstitute: boolean;
  specNotes: string;
}

export function CreateRfqPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('Bulk Procurement: Industrial Materials & Packaging Q4/2026');
  const [category, setCategory] = useState('Packaging & Pallets');
  const [description, setDescription] = useState(
    'Procurement tender for certified packaging units and industrial supplies for regional fulfillment distribution hubs.'
  );
  const [deliveryLocation, setDeliveryLocation] = useState('Warszawa Central DC (DC-01, Ramp 4)');
  const [deadline, setDeadline] = useState('2026-10-20');
  const [globalAllowSubstitutes, setGlobalAllowSubstitutes] = useState(true);

  // Granular Line Items Requested by Buyer
  const [items, setItems] = useState<RfqLineItem[]>([
    {
      id: 'item-1',
      sku: 'SKU-PAL-01',
      name: 'Standard Wooden Pallets EPAL-1 (1200x800mm)',
      quantity: 1200,
      unit: 'pcs',
      targetUnitPrice: 42.0,
      allowSubstitute: true,
      specNotes: 'Kiln-dried pine timber (<22% moisture), ISPM-15 heat treated, dynamic load >=1500kg',
    },
    {
      id: 'item-2',
      sku: 'SKU-STR-05',
      name: 'Industrial Machine Stretch Film 23mic Transparent',
      quantity: 200,
      unit: 'rolls',
      targetUnitPrice: 85.0,
      allowSubstitute: true,
      specNotes: '300% pre-stretch capability, 16kg roll net weight, high puncture resistance',
    },
    {
      id: 'item-3',
      sku: 'SKU-BOX-12',
      name: 'Corrugated Heavy Duty 5-Ply Shipping Boxes (600x400x400)',
      quantity: 2500,
      unit: 'pcs',
      targetUnitPrice: 7.2,
      allowSubstitute: false,
      specNotes: 'BC-flute kraftliner cardboard, burst strength >= 1200 kPa, strict dimensions',
    },
  ]);

  const totalCalculatedBudget = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity * item.targetUnitPrice, 0);
  }, [items]);

  const totalQuantitySum = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  const handleAddItem = () => {
    const newItem: RfqLineItem = {
      id: 'item-' + (items.length + 1),
      sku: 'SKU-GEN-' + Math.floor(10 + Math.random() * 90),
      name: 'Custom Industrial Material Position',
      quantity: 500,
      unit: 'pcs',
      targetUnitPrice: 25.0,
      allowSubstitute: globalAllowSubstitutes,
      specNotes: 'Standard ISO 9001 certified commercial grade',
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      toast.error('Tender must contain at least 1 line item');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof RfqLineItem, value: any) => {
    const updated = [...items];
    const target = updated[index];
    if (target) {
      updated[index] = { ...target, [field]: value };
      setItems(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      toast.error('Please enter a tender title');
      return;
    }

    toast.success(
      `RFQ Tender "${title}" published with ${items.length} line items (Budget: ${totalCalculatedBudget.toLocaleString()} PLN)! (Kafka: scm.rfq.events.v1)`
    );
    navigate({ to: '/buyer/requests' });
  };

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Action */}
      <div className="flex items-center justify-between">
        <Link
          to="/buyer/requests"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to RFQ Tenders List
        </Link>
        <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">
          Module 7: RFQ Procurement Tender Engine
        </Badge>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-md">
        <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileQuestion className="h-5 w-5 text-emerald-600" />
              Publish RFQ Tender with Itemized Procurement Scope
            </CardTitle>
            <Badge className="bg-emerald-600 text-white font-mono text-xs">
              {items.length} Items Configured
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Specify the exact products, target volumes, maximum price caps, and per-position substitute allowance clauses.
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                1. Tender Scope & Logistics Conditions
              </h3>

              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-semibold">
                  Tender Project Title:
                </Label>
                <Input
                  id="title"
                  placeholder="E.g. Bulk Supply: Industrial EPAL Pallets & Stretch Film Q4/2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-sm font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs font-semibold">
                    Product Category:
                  </Label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 text-xs border rounded-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  >
                    <option value="Packaging & Pallets">Packaging & Pallets</option>
                    <option value="Industrial Chemistry">Industrial Chemistry & Polymers</option>
                    <option value="Packaging Supplies">Packaging Supplies (Film, Tapes)</option>
                    <option value="Material Handling">Material Handling & Warehouse Equipment</option>
                    <option value="Cold Chain Equipment">Cold Chain Equipment (Thermoboxes)</option>
                    <option value="Steel & Metallurgy">Steel & Metallurgy</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="location" className="text-xs font-semibold">
                    Delivery Destination Hub:
                  </Label>
                  <Input
                    id="location"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    className="text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="deadline" className="text-xs font-semibold">
                    Bidding Submission Deadline:
                  </Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="desc" className="text-xs font-semibold">
                  General Tender Notes & Compliance Instructions:
                </Label>
                <textarea
                  id="desc"
                  rows={2}
                  placeholder="Specify general contract conditions, required European certificates (ISPM-15, ISO, CE), unloading ramp constraints..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 text-xs border rounded-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:outline-emerald-600"
                />
              </div>
            </div>

            {/* Granular Line Items Management */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-emerald-600" />
                    2. Procurement Bill of Materials (Line Items Requested)
                  </h3>
                  <p className="text-2xs text-slate-500">
                    Define what specific products you require, desired unit volume, target price limits, and per-item substitution allowance.
                  </p>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddItem}
                  className="text-xs gap-1.5 border-emerald-600 text-emerald-700 hover:bg-emerald-50 h-8 self-start sm:self-auto"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Procurement Item</span>
                </Button>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto shadow-2xs">
                <table className="w-full text-xs text-left min-w-[700px]">
                  <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">SKU & Item Name</th>
                      <th className="py-2.5 px-3 w-28">Quantity</th>
                      <th className="py-2.5 px-3 w-32">Target Unit Price</th>
                      <th className="py-2.5 px-3 text-right w-32">Budget Cap</th>
                      <th className="py-2.5 px-3 text-center w-28">Allow Sub?</th>
                      <th className="py-2.5 px-2 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {items.map((item, idx) => {
                      const lineTotal = item.quantity * item.targetUnitPrice;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                          <td className="py-3 px-3 font-mono tabular-nums text-slate-400 font-bold">{idx + 1}</td>
                          <td className="py-3 px-3 space-y-1">
                            <div className="flex items-center gap-2">
                              <Input
                                value={item.name}
                                aria-label={`Наименование позиции ${idx + 1}`}
                                onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                                className="h-7 text-xs font-semibold text-slate-900 dark:text-slate-100"
                                placeholder="Product description"
                                required
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                value={item.sku}
                                aria-label={`Артикул SKU позиции ${idx + 1}`}
                                onChange={(e) => handleItemChange(idx, 'sku', e.target.value)}
                                className="h-6 w-32 text-2xs font-mono text-slate-500 uppercase"
                                placeholder="SKU Code"
                                required
                              />
                              <Input
                                value={item.specNotes}
                                aria-label={`Технические спецификации позиции ${idx + 1}`}
                                onChange={(e) => handleItemChange(idx, 'specNotes', e.target.value)}
                                className="h-6 text-2xs text-slate-500 flex-1"
                                placeholder="Technical specifications & tolerances"
                              />
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                min={1}
                                value={item.quantity}
                                aria-label={`Количество позиции ${idx + 1}`}
                                onChange={(e) =>
                                  handleItemChange(idx, 'quantity', Math.max(1, Number(e.target.value)))
                                }
                                className="h-7 text-xs font-mono tabular-nums font-bold text-center"
                                required
                              />
                              <select
                                value={item.unit}
                                aria-label={`Единица измерения позиции ${idx + 1}`}
                                onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                                className="h-7 px-1 text-2xs font-mono border rounded bg-white dark:bg-slate-900"
                              >
                                <option value="pcs">pcs</option>
                                <option value="kg">kg</option>
                                <option value="rolls">rolls</option>
                                <option value="pallets">pallets</option>
                                <option value="m3">m³</option>
                              </select>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                min={0.01}
                                step={0.1}
                                value={item.targetUnitPrice}
                                aria-label={`Ценовой лимит PLN позиции ${idx + 1}`}
                                onChange={(e) =>
                                  handleItemChange(idx, 'targetUnitPrice', Number(e.target.value))
                                }
                                className="h-7 text-xs font-mono tabular-nums text-right"
                                required
                              />
                              <span className="text-2xs text-slate-400 font-mono">PLN</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100">
                            {lineTotal.toLocaleString('pl-PL', { minimumFractionDigits: 2 })}&nbsp;PLN
                          </td>
                          <td className="py-3 px-3 text-center">
                            <label className="inline-flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={item.allowSubstitute}
                                aria-label={`Разрешить товар-аналог для позиции ${idx + 1}`}
                                onChange={(e) => handleItemChange(idx, 'allowSubstitute', e.target.checked)}
                                className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                              />
                              <span className="text-2xs text-slate-500">
                                {item.allowSubstitute ? 'Yes' : 'No'}
                              </span>
                            </label>
                          </td>
                          <td className="py-3 px-2 text-center">
                            {items.length > 1 && (
                              <button
                                type="button"
                                aria-label={`Удалить позицию ${item.name || idx + 1}`}
                                title={`Удалить позицию ${item.name || idx + 1}`}
                                onClick={() => handleRemoveItem(idx)}
                                className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Financial & Volume Aggregates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-2xs uppercase tracking-wider text-slate-500 font-semibold block">
                      Total Required Quantity:
                    </span>
                    <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {totalQuantitySum.toLocaleString()} total units across {items.length} positions
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-2xs uppercase tracking-wider text-slate-500 font-semibold block">
                    Calculated Maximum Target Budget:
                  </span>
                  <span className="text-xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                    {totalCalculatedBudget.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
                  </span>
                </div>
              </div>
            </div>

            {/* Substitution Rules Banner */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="font-semibold text-xs text-emerald-900 dark:text-emerald-100 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Global B2B Tender Substitution Policy (Module 7 RFQ Engine)
                </div>
                <p className="text-2xs text-emerald-700 dark:text-emerald-300">
                  When enabled, qualified B2B suppliers can submit alternative substitute products for items flagged with "Allow Sub". Suppliers must provide technical parameter equivalence tables, moisture/tolerance certificates, and cost-benefit justification.
                </p>
              </div>

              <input
                type="checkbox"
                checked={globalAllowSubstitutes}
                onChange={(e) => {
                  setGlobalAllowSubstitutes(e.target.checked);
                  setItems(items.map((i) => ({ ...i, allowSubstitute: e.target.checked })));
                }}
                className="h-5 w-5 rounded text-emerald-600 focus:ring-emerald-500 mt-1 cursor-pointer"
              />
            </div>

            {/* Submit Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => navigate({ to: '/buyer/requests' })}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-semibold shadow-xs"
              >
                <Plus className="h-4 w-4" />
                Publish RFQ Tender ({items.length} Positions)
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateRfqPage;
