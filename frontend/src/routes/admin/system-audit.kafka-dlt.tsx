import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import {
  ChevronLeft,
  AlertTriangle,
  RefreshCw,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/admin/system-audit/kafka-dlt')({
  component: KafkaDltInspectorPage,
  staticData: {
    crumb: {
      label: 'Kafka DLT Inspector',
    },
  },
});

interface DltMessage {
  id: string;
  topic: string;
  partition: number;
  offset: number;
  errorException: string;
  payloadJson: string;
  failedAt: string;
  isRedriven: boolean;
}

const INITIAL_DLT: DltMessage[] = [
  {
    id: 'dlt-01',
    topic: 'scm.orders.order.events.v1.DLT',
    partition: 1,
    offset: 4091,
    errorException: 'OptimisticLockingFailureException: Concurrent stock reservation lock timeout on SKU-PAL-01',
    payloadJson: JSON.stringify(
      {
        eventType: 'OrderCreatedEvent',
        orderId: '88219-wa-01',
        clientId: '8522619472',
        totalAmount: 18500.0,
        sku: 'SKU-PAL-01',
        quantity: 50,
      },
      null,
      2
    ),
    failedAt: '2026-09-24 16:15 CEST',
    isRedriven: false,
  },
];

function KafkaDltInspectorPage() {
  const [messages, setMessages] = useState<DltMessage[]>(INITIAL_DLT);

  const handleRedrive = (id: string) => {
    setMessages(messages.map((m) => (m.id === id ? { ...m, isRedriven: true } : m)));
    toast.success(`Message ${id} re-driven into origin topic! Saga recovered.`);
  };

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/system-audit"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to System Audit
        </Link>
        <Badge variant="outline" className="text-red-700 bg-red-50 border-red-200">
          Dead Letter Topic Inspector
        </Badge>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          Apache Kafka Dead Letter Topics (.DLT) Recovery
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Inspect unrecoverable event consumer exceptions, review raw JSON payloads, and replay messages into the main processing loop.
        </p>
      </div>

      <div className="space-y-4">
        {messages.map((m) => (
          <Card key={m.id} className="border-red-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-red-50/50 dark:bg-red-950/20 border-b py-3 px-5 flex flex-row items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-red-700 dark:text-red-400">
                  {m.topic}
                </span>
                <span className="text-2xs text-slate-500 ml-2">
                  Partition: {m.partition} • Offset: {m.offset}
                </span>
              </div>
              <Badge
                className={`text-2xs ${
                  m.isRedriven
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {m.isRedriven ? 'RE-DRIVEN / RECOVERED' : 'UNRESOLVED EXCEPTION'}
              </Badge>
            </CardHeader>

            <CardContent className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 text-red-800 dark:text-red-300 font-mono text-2xs">
                <strong>Exception:</strong> {m.errorException}
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">Raw Event JSON Payload:</span>
                <pre className="p-3 rounded-lg bg-slate-950 text-emerald-400 font-mono text-2xs overflow-x-auto">
                  {m.payloadJson}
                </pre>
              </div>

              {!m.isRedriven && (
                <div className="flex justify-end pt-2">
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white gap-1.5 text-xs font-semibold"
                    onClick={() => handleRedrive(m.id)}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Re-drive Message into scm.orders.order.events.v1
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
