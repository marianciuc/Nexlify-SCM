import { createFileRoute, Link } from '@tanstack/react-router';
import { Activity, AlertTriangle, CheckCircle2, ShieldAlert, Server } from 'lucide-react';
import 'react';
import 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/admin/system-audit')({
  component: SystemAuditDashboardPage,
  staticData: {
    crumb: {
      label: 'System Audit & Events',
    },
  },
});

interface SagaTransaction {
  id: string;
  sagaId: string;
  orderNumber: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED_COMPENSATING';
  steps: { name: string; service: string; status: 'SUCCESS' | 'RUNNING' | 'FAILED' }[];
  durationMs: number;
  timestamp: string;
}

const SAGAS: SagaTransaction[] = [
  {
    id: '1',
    sagaId: 'saga-99120',
    orderNumber: 'ORD-2026-0891',
    status: 'COMPLETED',
    steps: [
      { name: 'OrderCreatedEvent', service: 'order-service', status: 'SUCCESS' },
      { name: 'InventoryReservedEvent', service: 'inventory-service', status: 'SUCCESS' },
      { name: 'PaymentAuthorizedEvent', service: 'billing-service', status: 'SUCCESS' },
      { name: 'ShipmentDispatchedEvent', service: 'logistics-service', status: 'SUCCESS' },
    ],
    durationMs: 412,
    timestamp: '5 min ago',
  },
  {
    id: '2',
    sagaId: 'saga-99121',
    orderNumber: 'ORD-2026-0892',
    status: 'COMPLETED',
    steps: [
      { name: 'OrderCreatedEvent', service: 'order-service', status: 'SUCCESS' },
      { name: 'InventoryReservedEvent', service: 'inventory-service', status: 'SUCCESS' },
      { name: 'PaymentAuthorizedEvent', service: 'billing-service', status: 'SUCCESS' },
    ],
    durationMs: 280,
    timestamp: '25 min ago',
  },
];

function SystemAuditDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Activity className="h-6 w-6 text-red-600" />
              Platform Transaction Audit & Event Log
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time monitoring of asynchronous transaction workflows, execution queues, and failed events.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link to="/admin/system-audit/kafka-dlt" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="border-red-300 text-red-700 bg-red-50 hover:bg-red-100 gap-1.5 w-full sm:w-auto">
              <AlertTriangle className="h-3.5 w-3.5" />
              Failed Event Queue (DLQ)
            </Button>
          </Link>
          <Link to="/admin/system-audit/disputes" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="gap-1.5 w-full sm:w-auto">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
              RMA Arbitration
            </Button>
          </Link>
        </div>
      </div>

      {/* Sagas List */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <CardHeader className="py-3 px-5 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Server className="h-4 w-4 text-red-600" /> Active Transaction Executions
          </CardTitle>
          <div className="flex items-center gap-1.5 text-2xs text-emerald-600 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Event Bus Connected
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b text-slate-600 dark:text-slate-400 whitespace-nowrap">
              <tr>
                <th className="py-3 px-4">Transaction ID / Order #</th>
                <th className="py-3 px-4">Distributed Step Flow</th>
                <th className="py-3 px-4 text-right">Execution Latency</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 whitespace-nowrap">
              {SAGAS.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-red-600">{s.sagaId}</div>
                    <div className="font-mono text-2xs text-slate-500">{s.orderNumber}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {s.steps.map((st, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-2xs font-mono flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" aria-hidden="true" />
                            {st.name}
                          </span>
                          {idx < s.steps.length - 1 && <span className="text-slate-400" aria-hidden="true">➔</span>}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold tabular-nums text-right text-slate-900 dark:text-slate-100">
                    {s.durationMs}&nbsp;ms
                  </td>
                  <td className="py-3 px-4 text-slate-500">{s.timestamp}</td>
                  <td className="py-3 px-4 text-right">
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-2xs">
                      {s.status}
                    </Badge>
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
