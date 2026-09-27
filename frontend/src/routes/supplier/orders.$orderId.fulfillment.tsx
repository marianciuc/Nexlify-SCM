import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState } from 'react';
import {
  ChevronLeft,
  Barcode,
  CheckCircle2,
  Package,
  Warehouse,
  Weight,
  Printer,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOrdersQuery, INITIAL_ORDERS, useUpdateOrderStatusMutation } from '@/hooks/useScmQueries';

export const Route = createFileRoute('/supplier/orders/$orderId/fulfillment')({
  component: WarehouseFulfillmentWorkstation,
  staticData: {
    crumb: {
      label: 'WMS Workstation',
    },
  },
});

interface PickItem {
  sku: string;
  name: string;
  zone: string;
  bin: string;
  quantityRequired: number;
  quantityPicked: number;
  scannedBarcode: string;
  isVerified: boolean;
}

function WarehouseFulfillmentWorkstation() {
  const { orderId } = Route.useParams();
  const navigate = useNavigate();
  const { data: orders = INITIAL_ORDERS } = useOrdersQuery();
  const updateStatusMutation = useUpdateOrderStatusMutation();

  const order = orders.find((o) => o.id === orderId) || INITIAL_ORDERS[0]!;

  const [barcodeInput, setBarcodeInput] = useState('');
  const [cargoWeightKg, setCargoWeightKg] = useState(2540);
  const [pickItems, setPickItems] = useState<PickItem[]>([
    {
      sku: 'SKU-PAL-01',
      name: 'EPAL Euro-Pallet Standard (Pine Wood)',
      zone: 'Zone A (Pallet Racks)',
      bin: 'A-04-BIN-108',
      quantityRequired: 100,
      quantityPicked: 0,
      scannedBarcode: '5901234567890',
      isVerified: false,
    },
    {
      sku: 'SKU-STR-05',
      name: 'Industrial Stretch Film 23mic (Roll 300m)',
      zone: 'Zone C (Supplies)',
      bin: 'C-01-BIN-042',
      quantityRequired: 40,
      quantityPicked: 0,
      scannedBarcode: '5909876543210',
      isVerified: false,
    },
  ]);

  const allVerified = pickItems.every((i) => i.isVerified);

  const handleScanBarcode = (e: React.FormEvent) => {
    e.preventDefault();
    const itemIndex = pickItems.findIndex(
      (i) => !i.isVerified && (i.sku === barcodeInput || i.scannedBarcode === barcodeInput)
    );

    const itemToUpdate = itemIndex > -1 ? pickItems[itemIndex] : undefined;
    if (itemIndex > -1 && itemToUpdate) {
      const updated = [...pickItems];
      updated[itemIndex] = {
        ...itemToUpdate,
        quantityPicked: itemToUpdate.quantityRequired,
        isVerified: true,
      };
      setPickItems(updated);
      setBarcodeInput('');
      toast.success(`Verified: ${itemToUpdate.name} (${itemToUpdate.quantityRequired} units)`);
    } else {
      toast.error('Barcode not found in current pick list or already verified');
    }
  };

  const handleQuickVerifyAll = () => {
    setPickItems(
      pickItems.map((i) => ({
        ...i,
        quantityPicked: i.quantityRequired,
        isVerified: true,
      }))
    );
    toast.success('All items verified on packing workstation');
  };

  const handleDispatchOrder = async () => {
    await updateStatusMutation.mutateAsync({
      orderId: order.id,
      nextStatus: 'SHIPPED',
    });
    toast.success(`Order ${order.orderNumber} marked READY_FOR_DISPATCH! TMS logistics notification dispatched.`);
    navigate({ to: '/supplier/orders' });
  };

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/supplier/orders"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Fulfillment Queue
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              WMS Pick & Pack Workstation
            </h1>
            <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">
              Screen P12
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Fulfilling Order: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{order.orderNumber}</span> • Customer: {order.customerName}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.success('Printed Pallet Shipping Label (GS1-128 standard)')}
          className="gap-1.5 text-xs"
        >
          <Printer className="h-3.5 w-3.5" />
          Print Pallet Labels
        </Button>
      </div>

      {/* 13-Status Saga Lifecycle Bar */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-2xs">
        <CardHeader className="py-2.5 px-4 bg-slate-50 dark:bg-slate-900 border-b">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Saga Status: <span className="font-mono text-emerald-600 font-bold">{order.status}</span>
            </span>
            <span className="text-2xs text-slate-500">WMS Fulfillment Flow (Step 6 of 9: IN_PROCESSING)</span>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-2xs overflow-x-auto gap-2 py-1">
            {['DRAFT', 'SUBMITTED', 'RESERVED', 'AWAITING_PAYMENT', 'PAID', 'IN_PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'].map((st, idx) => {
              const isPast = idx <= 5;
              const isCurrent = st === 'IN_PROCESSING';
              return (
                <div key={st} className="flex items-center gap-1 shrink-0">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                    isCurrent ? 'bg-amber-600 text-white animate-pulse' : isPast ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className={`font-medium ${isCurrent ? 'text-amber-600 font-bold' : isPast ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>
                    {st}
                  </span>
                  {idx < 8 && <span className="text-slate-300 ml-1">➔</span>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Barcode Scanner Input */}
      <Card className="border-amber-200 bg-amber-50/20 dark:bg-amber-950/10 shadow-xs">
        <CardContent className="p-4">
          <form onSubmit={handleScanBarcode} className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative w-full">
              <Barcode className="absolute left-3 top-2.5 h-4 w-4 text-amber-600" />
              <Input
                placeholder="Scan EAN-13 Barcode or enter SKU (e.g. 5901234567890 or SKU-PAL-01)..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="pl-9 font-mono text-xs bg-white dark:bg-slate-900"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button type="submit" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs shrink-0">
                Scan Verify
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleQuickVerifyAll}
                className="text-xs shrink-0"
              >
                Auto-Verify All
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Pick List Table */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <CardHeader className="py-3 px-5 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Package className="h-4 w-4 text-amber-600" /> Digital Warehouse Pick List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b text-slate-600 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4">Warehouse Zone & Bin</th>
                <th className="py-3 px-4">SKU / Item Name</th>
                <th className="py-3 px-4">Barcode EAN</th>
                <th className="py-3 px-4 text-right">Qty Required</th>
                <th className="py-3 px-4 text-right">Qty Picked</th>
                <th className="py-3 px-4 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pickItems.map((item) => (
                <tr
                  key={item.sku}
                  className={
                    item.isVerified
                      ? 'bg-emerald-50/30 dark:bg-emerald-950/10'
                      : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/50'
                  }
                >
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{item.zone}</div>
                    <div className="font-mono text-2xs text-amber-600 font-bold">{item.bin}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</div>
                    <div className="font-mono text-2xs text-slate-500">{item.sku}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{item.scannedBarcode}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-slate-900 dark:text-slate-100">
                    {item.quantityRequired} pcs
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-emerald-600">
                    {item.quantityPicked} pcs
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {item.isVerified ? (
                      <Badge className="bg-emerald-100 text-emerald-800 text-2xs gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Scanned
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-2xs text-amber-700 bg-amber-50">
                        Pending Scan
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Cargo Weighing & Dispatch Finalization */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600">
              <Weight className="h-6 w-6" />
            </div>
            <div>
              <Label className="text-xs font-semibold">Scale Gross Pallet Weight (kg):</Label>
              <Input
                type="number"
                value={cargoWeightKg}
                onChange={(e) => setCargoWeightKg(Number(e.target.value))}
                className="w-36 font-mono font-bold text-sm mt-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="lg"
              disabled={!allVerified}
              onClick={handleDispatchOrder}
              className={`gap-2 font-bold text-xs shadow-xs ${
                allVerified
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Truck className="h-4 w-4" />
              Confirm Packed & Ready for Dispatch (TMS Handover)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
