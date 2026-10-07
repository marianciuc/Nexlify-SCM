import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { ArrowLeftRight, Plus, Warehouse, Truck, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  FormFieldSelect,
  FormFieldNumber,
} from '@/components/forms/common';
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
import { Form } from '@/components/ui/form';

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

const transferSchema = z.object({
  sourceHub: z.string().min(1, 'Source hub is required'),
  destHub: z.string().min(1, 'Destination hub is required'),
  sku: z.string().min(1, 'SKU is required'),
  qty: z.number().int().min(1, 'Quantity must be at least 1'),
});

type TransferFormData = z.infer<typeof transferSchema>;

const sourceHubOptions = [
  { value: 'Central DC Warszawa (WH-WAW-01)', label: 'Central DC Warszawa (WH-WAW-01)' },
  { value: 'Silesia Logistics Hub Katowice (WH-KTW-03)', label: 'Silesia Logistics Hub Katowice (WH-KTW-03)' },
  { value: 'Port Logistics Hub Szczecin (WH-SZC-02)', label: 'Port Logistics Hub Szczecin (WH-SZC-02)' },
];

const destHubOptions = [
  { value: 'Silesia Logistics Hub Katowice (WH-KTW-03)', label: 'Silesia Logistics Hub Katowice (WH-KTW-03)' },
  { value: 'Central DC Warszawa (WH-WAW-01)', label: 'Central DC Warszawa (WH-WAW-01)' },
  { value: 'Port Logistics Hub Szczecin (WH-SZC-02)', label: 'Port Logistics Hub Szczecin (WH-SZC-02)' },
];

const skuOptions = [
  { value: 'SKU-PAL-01', label: 'SKU-PAL-01 (EPAL Pallets)' },
  { value: 'SKU-STR-05', label: 'SKU-STR-05 (Stretch Film)' },
  { value: 'SKU-HYD-02', label: 'SKU-HYD-02 (Pallet Trucks)' },
];

function WarehouseTransfersPage() {
  const [transfers, setTransfers] = useState<TransferOrder[]>(INITIAL_TRANSFERS);
  const [showModal, setShowModal] = useState(false);

  const form = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      sourceHub: 'Central DC Warszawa (WH-WAW-01)',
      destHub: 'Silesia Logistics Hub Katowice (WH-KTW-03)',
      sku: 'SKU-PAL-01',
      qty: 150,
    },
  });

  const onSubmit = (data: TransferFormData) => {
    const newTrf: TransferOrder = {
      id: 'trf-' + Math.random().toString(36).substring(2, 7),
      transferNo: `TRF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      sourceHub: data.sourceHub,
      destinationHub: data.destHub,
      sku: data.sku,
      productName: data.sku === 'SKU-PAL-01' ? 'EPAL Euro-Pallet Standard' : 'Warehouse Item',
      quantity: data.qty,
      carrier: 'Internal Hub Logistics Shuttle',
      status: 'DISPATCHED',
      eta: 'Tomorrow, 12:00',
    };
    setTransfers([newTrf, ...transfers]);
    setShowModal(false);
    form.reset();
    toast.success(`Transfer Order ${newTrf.transferNo} scheduled from ${data.sourceHub} to ${data.destHub}!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ArrowLeftRight className="h-6 w-6 text-amber-600" />
            Inter-Warehouse Stock Transfers
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Rebalance wholesale inventory across multi-hub Polish fulfillment centers.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowModal(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white gap-2 font-semibold shadow-xs cursor-pointer w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" /> Create Transfer Order
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-xs uppercase font-bold text-slate-500">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-mono font-bold text-amber-600">
              {transfers.filter((t) => t.status === 'IN_TRANSIT').length}
            </div>
            <p className="text-2xs text-muted-foreground mt-0.5">Active highway shuttles</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-xs uppercase font-bold text-slate-500">Units Moving</CardTitle>
            <Warehouse className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
              {transfers.reduce((acc, t) => acc + t.quantity, 0).toLocaleString()}
            </div>
            <p className="text-2xs text-muted-foreground mt-0.5">Physical items scheduled</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-xs uppercase font-bold text-slate-500">Completed Transfers</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-mono font-bold text-emerald-600">
              {transfers.filter((t) => t.status === 'RECEIVED').length}
            </div>
            <p className="text-2xs text-muted-foreground mt-0.5">Received into destination WMS</p>
          </CardContent>
        </Card>
      </div>

      {/* Transfers Table */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="py-3 px-4 border-b">
          <CardTitle className="text-sm font-semibold">Active & Recent Warehouse Reallocations</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[700px]">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b text-slate-500 font-semibold whitespace-nowrap">
              <tr>
                <th className="py-3 px-4">Transfer #</th>
                <th className="py-3 px-4">Source Hub</th>
                <th className="py-3 px-4">Destination Hub</th>
                <th className="py-3 px-4">SKU / Item</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">ETA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 whitespace-nowrap">
              {transfers.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">{t.transferNo}</td>
                  <td className="py-3 px-4">{t.sourceHub}</td>
                  <td className="py-3 px-4">{t.destinationHub}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold block">{t.sku}</span>
                    <span className="text-2xs text-slate-500">{t.productName}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold">{t.quantity} pcs</td>
                  <td className="py-3 px-4">
                    <Badge
                      className={
                        t.status === 'IN_TRANSIT'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : t.status === 'RECEIVED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      }
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-xs">
              <FormFieldSelect
                control={form.control}
                name="sourceHub"
                label="Source Warehouse (Origin):"
                options={sourceHubOptions}
              />

              <FormFieldSelect
                control={form.control}
                name="destHub"
                label="Destination Facility:"
                options={destHubOptions}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormFieldSelect
                  control={form.control}
                  name="sku"
                  label="SKU to Transfer:"
                  options={skuOptions}
                  className="font-mono"
                />

                <FormFieldNumber
                  control={form.control}
                  name="qty"
                  label="Quantity to Move:"
                  min={1}
                  step={1}
                  className="font-bold"
                />
              </div>

              <DialogFooter className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white cursor-pointer">
                  Dispatch Transfer Order
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default WarehouseTransfersPage;
