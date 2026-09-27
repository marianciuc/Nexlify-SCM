import { createFileRoute, Link, Outlet, useChildMatches } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Boxes,
  PackageCheck,
  Clock,
  CheckCircle2,
  ArrowRight,
  Building2,
  MapPin,
  Barcode,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrdersQuery, INITIAL_ORDERS } from '@/hooks/useScmQueries';

export const Route = createFileRoute('/supplier/orders')({
  component: SupplierOrdersQueuePage,
  staticData: {
    crumb: {
      label: 'Fulfillment Queue',
    },
  },
});

function SupplierOrdersQueuePage() {
  const childMatches = useChildMatches();
  if (childMatches.length > 0) {
    return <Outlet />;
  }
  return <SupplierOrdersQueueContent />;
}

function SupplierOrdersQueueContent() {
  const { data: orders = INITIAL_ORDERS } = useOrdersQuery();
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'PENDING' | 'READY_FOR_DISPATCH'>('ALL');

  const filteredOrders = orders.filter((o) => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'PENDING') return o.status === 'SUBMITTED' || o.status === 'RESERVED';
    if (selectedFilter === 'READY_FOR_DISPATCH') return o.status === 'SHIPPED' || o.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Boxes className="h-6 w-6 text-amber-600" />
              Incoming Orders & WMS Fulfillment Queue
            </h1>
            <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">
              Screen P12 Integration
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Warehouse picking workstations, barcode scanning verification, packing slips, and carrier handover.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs overflow-x-auto" role="group" aria-label="Order status filter">
        {[
          { id: 'ALL', label: 'All Incoming Orders' },
          { id: 'PENDING', label: 'To Pick & Pack' },
          { id: 'READY_FOR_DISPATCH', label: 'Dispatched / In Transit' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedFilter(tab.id as any)}
            aria-pressed={selectedFilter === tab.id}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
              selectedFilter === tab.id
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List Table */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b text-slate-600 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Client / Destination</th>
                <th className="py-3 px-4">Positions</th>
                <th className="py-3 px-4 text-right">Order Gross</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4 text-right">WMS Workstation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-mono font-bold text-amber-700 dark:text-amber-400">
                    {order.orderNumber}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{order.customerName}</div>
                    <div className="text-2xs text-slate-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" aria-hidden="true" /> {order.deliveryCity}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono">{order.items?.length || 2} line items</td>
                  <td className="py-3 px-4 font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100 text-right">
                    {order.totalAmount.toLocaleString()}&nbsp;{order.currency}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="text-2xs font-semibold">
                      {order.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to="/supplier/orders/$orderId/fulfillment"
                      params={{ orderId: order.id }}
                      aria-label={`Open WMS pick and pack workstation for order ${order.orderNumber}`}
                    >
                      <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5 text-xs shadow-xs">
                        <Barcode className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Pick & Pack (P12)</span>
                        <ArrowRight className="h-3 w-3 ml-1" aria-hidden="true" />
                      </Button>
                    </Link>
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
