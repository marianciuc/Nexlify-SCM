import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  ArrowLeftRight,
  Plus,
  Warehouse,
  Truck,
  CheckCircle2,
  Clock,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/supplier/inventory/transfers')({
  component: WarehouseTransfersPage,
  staticData: {
    crumb: {
      label: 'Stock Transfers',
    },
  },
});

interface TransferOrder {
  id: string;
  transferNo: string;
  sourceHub: string;
  destinationHub: string;
  sku: string;
  productName: string;
  quantity: number;
  carrier: string;
  status: 'DISPATCHED' | 'IN_TRANSIT' | 'RECEIVED';
  eta: string;
}

const INITIAL_TRANSFERS: TransferOrder[] = [
  {
    id: 'trf-01',
    transferNo: 'TRF-2026-0812',
    sourceHub: 'Central DC Warszawa (WH-WAW-01)',
    destinationHub: 'Silesia Logistics Hub Katowice (WH-KTW-03)',
    sku: 'SKU-PAL-01',
    productName: 'EPAL Euro-Pallet Standard',
    quantity: 300,
    carrier: 'Nexlify Inter-DC Shuttle #4',
    status: 'IN_TRANSIT',
    eta: 'Today, 17:30',
  },
  {
    id: 'trf-02',
    transferNo: 'TRF-2026-0813',
    sourceHub: 'Central DC Warszawa (WH-WAW-01)',
    destinationHub: 'Port Logistics Hub Szczecin (WH-SZC-02)',
    sku: 'SKU-STR-05',
    productName: 'Industrial Stretch Film 23mic',
    quantity: 120,
    carrier: 'Baltic Shuttle Line',
    status: 'RECEIVED',
    eta: 'Completed Yesterday',
  },
];

function WarehouseTransfersPage() {
  const [transfers, setTransfers] = useState<TransferOrder[]>(INITIAL_TRANSFERS);
  const [showModal, setShowModal] = useState(false);

  const [sourceHub, setSourceHub] = useState('Central DC Warszawa (WH-WAW-01)');
  const [destHub, setDestHub] = useState('Silesia Logistics Hub Katowice (WH-KTW-03)');
  const [sku, setSku] = useState('SKU-PAL-01');
  const [qty, setQty] = useState(150);

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const newTrf: TransferOrder = {
      id: 'trf-' + Math.random().toString(36).substring(2, 7),
      transferNo: `TRF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      sourceHub,
      destinationHub: destHub,
      sku,
      productName: sku === 'SKU-PAL-01' ? 'EPAL Euro-Pallet Standard' : 'Warehouse Item',
      quantity: qty,
      carrier: 'Internal Hub Logistics Shuttle',
      status: 'DISPATCHED',
      eta: 'Tomorrow, 12:00',
    };
    setTransfers([newTrf, ...transfers]);
    setShowModal(false);
    toast.success(`Transfer Order ${newTrf.transferNo} created: ${qty} units allocated!`);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ArrowLeftRight className="h-6 w-6 text-amber-600" />
              Inter-Warehouse Stock Balancing & Transfers
            </h1>
            <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">
              Enterprise SCM 2.0
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Rebalance inventory between Warsaw, Katowice, and Szczecin regional distribution hubs to avoid regional stockouts.
          </p>
        </div>

        <Button
          className="bg-amber-600 hover:bg-amber-700 text-white gap-2 text-xs shadow-xs"
          onClick={() => setShowModal(true)}
        >
          <Plus className="h-4 w-4" /> New Inter-Warehouse Transfer
        </Button>
      </div>

      {/* Transfers Table */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b text-slate-600 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4">Transfer #</th>
                <th className="py-3 px-4">Item SKU</th>
                <th className="py-3 px-4">Source Hub</th>
                <th className="py-3 px-4">Destination Hub</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4">Internal Carrier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">ETA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {transfers.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-mono font-bold text-amber-700 dark:text-amber-400">
                    {t.transferNo}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{t.productName}</div>
                    <div className="font-mono text-2xs text-slate-500">{t.sku}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{t.sourceHub}</td>
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">{t.destinationHub}</td>
                  <td className="py-3 px-4 font-mono font-bold text-right text-emerald-600">
                    {t.quantity.toLocaleString()} pcs
                  </td>
                  <td className="py-3 px-4 text-slate-500">{t.carrier}</td>
                  <td className="py-3 px-4">
                    <Badge
                      variant="outline"
                      className={`text-2xs ${
                        t.status === 'RECEIVED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {t.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-700 dark:text-slate-300">{t.eta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Modal Dialog */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base text-amber-700">
              <ArrowLeftRight className="h-5 w-5" /> Schedule Inter-Warehouse Transfer
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTransfer} className="space-y-4 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Source Warehouse (Origin):</Label>
              <select
                value={sourceHub}
                onChange={(e) => setSourceHub(e.target.value)}
                className="w-full p-2 border rounded-md bg-white dark:bg-slate-900"
              >
                <option value="Central DC Warszawa (WH-WAW-01)">Central DC Warszawa (WH-WAW-01)</option>
                <option value="Silesia Logistics Hub Katowice (WH-KTW-03)">Silesia Logistics Hub Katowice (WH-KTW-03)</option>
                <option value="Port Logistics Hub Szczecin (WH-SZC-02)">Port Logistics Hub Szczecin (WH-SZC-02)</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Destination Facility:</Label>
              <select
                value={destHub}
                onChange={(e) => setDestHub(e.target.value)}
                className="w-full p-2 border rounded-md bg-white dark:bg-slate-900"
              >
                <option value="Silesia Logistics Hub Katowice (WH-KTW-03)">Silesia Logistics Hub Katowice (WH-KTW-03)</option>
                <option value="Central DC Warszawa (WH-WAW-01)">Central DC Warszawa (WH-WAW-01)</option>
                <option value="Port Logistics Hub Szczecin (WH-SZC-02)">Port Logistics Hub Szczecin (WH-SZC-02)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">SKU to Transfer:</Label>
                <select
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full p-2 border rounded-md bg-white dark:bg-slate-900 font-mono"
                >
                  <option value="SKU-PAL-01">SKU-PAL-01 (EPAL Pallets)</option>
                  <option value="SKU-STR-05">SKU-STR-05 (Stretch Film)</option>
                  <option value="SKU-HYD-02">SKU-HYD-02 (Pallet Trucks)</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Quantity to Move:</Label>
                <Input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="text-xs font-mono font-bold"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                Dispatch Transfer Order
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
