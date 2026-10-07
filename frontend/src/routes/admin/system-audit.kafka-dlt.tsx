import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronLeft, AlertTriangle, RefreshCw, CheckCircle2, Copy, Check, Database } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const Route = createFileRoute('/admin/system-audit/kafka-dlt')({
  component: KafkaDltInspectorPage,
  staticData: {
    crumb: {
      label: 'Event DLQ Inspector',
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
    errorException: 'OptimisticLockingFailureException: Concurrent stock reservation lock timeout on SKU-PAL-01 in Warszawa DC-01',
    payloadJson: JSON.stringify(
      {
        eventType: 'OrderCreatedEvent',
        orderId: 'ORD-2026-0891',
        clientId: '8522619472',
        totalAmount: 28450.0,
        currency: 'PLN',
        sku: 'SKU-PAL-01',
        quantity: 100,
        warehouseCode: 'WAW-DC-01',
      },
      null,
      2
    ),
    failedAt: '2026-09-24 16:15 CEST',
    isRedriven: false,
  },
  {
    id: 'dlt-02',
    topic: 'scm.billing.invoice.events.v1.DLT',
    partition: 0,
    offset: 1822,
    errorException: 'KsefTransmissionException: Gateway timeout from National e-Invoicing System API endpoint',
    payloadJson: JSON.stringify(
      {
        eventType: 'InvoiceGenerationEvent',
        invoiceNumber: 'INV/2026/09/0081',
        nip: '7822910483',
        grossAmountPln: 14760.0,
        vatAmountPln: 2760.0,
        splitPayment: true,
      },
      null,
      2
    ),
    failedAt: '2026-09-25 09:42 CEST',
    isRedriven: true,
  },
  {
    id: 'dlt-03',
    topic: 'scm.logistic.dispatch.events.v1.DLT',
    partition: 2,
    offset: 893,
    errorException: 'VrpAxialOverloadException: Total axle load exceeds 11.5t limit for route corridor S7',
    payloadJson: JSON.stringify(
      {
        eventType: 'WaybillDispatchedEvent',
        waybillNumber: 'CMR-2026-0044',
        vehiclePlate: 'WI 49102',
        grossWeightKg: 24800,
        assignedAxleWeightKg: 12100,
      },
      null,
      2
    ),
    failedAt: '2026-09-26 11:20 CEST',
    isRedriven: false,
  },
];

function KafkaDltInspectorPage() {
  const [messages, setMessages] = useState<DltMessage[]>(INITIAL_DLT);
  const [filterState, setFilterState] = useState<'ALL' | 'UNRESOLVED' | 'RECOVERED'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedEventToRedrive, setSelectedEventToRedrive] = useState<DltMessage | null>(null);

  const handleRedriveConfirm = () => {
    if (!selectedEventToRedrive) return;
    const id = selectedEventToRedrive.id;
    setMessages(messages.map((m) => (m.id === id ? { ...m, isRedriven: true } : m)));
    toast.success(`Event ${id} re-driven into processing pipeline successfully!`);
    setSelectedEventToRedrive(null);
  };

  const handleCopyJson = (id: string, json: string) => {
    navigator.clipboard.writeText(json);
    setCopiedId(id);
    toast.success('JSON payload copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = useMemo(() => {
    return messages.filter((m) => {
      if (filterState === 'UNRESOLVED') return !m.isRedriven;
      if (filterState === 'RECOVERED') return m.isRedriven;
      return true;
    });
  }, [messages, filterState]);

  const stats = useMemo(() => {
    const total = messages.length;
    const unresolved = messages.filter((m) => !m.isRedriven).length;
    const recovered = messages.filter((m) => m.isRedriven).length;
    return { total, unresolved, recovered };
  }, [messages]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/system-audit"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to System Audit
        </Link>
        <Badge variant="outline" className="text-destructive bg-destructive/10 border-destructive/30">
          Dead Letter Queue (DLQ) Inspector
        </Badge>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          Failed Transaction & Dead Letter Queue Recovery
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Inspect unrecoverable event exceptions, review raw payload data, and replay failed messages into the Kafka KRaft pipeline.
        </p>
      </div>

      {/* DLQ Telemetry Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-border bg-card">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total Dead Letters</span>
            <Database className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold font-mono text-foreground mt-1">
            {stats.total}
          </div>
          <span className="text-2xs text-muted-foreground">Captured in DLT topics</span>
        </Card>

        <Card className="p-4 border-destructive/30 bg-destructive/5">
          <div className="flex items-center justify-between text-xs text-destructive">
            <span>Unresolved Exceptions</span>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </div>
          <div className="text-2xl font-bold font-mono text-destructive mt-1">
            {stats.unresolved}
          </div>
          <span className="text-2xs text-destructive/80">Pending human or redrive audit</span>
        </Card>

        <Card className="p-4 border-primary/30 bg-primary/5">
          <div className="flex items-center justify-between text-xs text-primary">
            <span>Successfully Re-driven</span>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold font-mono text-primary mt-1">
            {stats.recovered}
          </div>
          <span className="text-2xs text-primary/80">Re-dispatched into event stream</span>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2 text-xs overflow-x-auto">
        {[
          { id: 'ALL', label: 'All DLT Events' },
          { id: 'UNRESOLVED', label: 'Unresolved Only' },
          { id: 'RECOVERED', label: 'Re-driven' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterState(tab.id as 'ALL' | 'UNRESOLVED' | 'RECOVERED')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
              filterState === tab.id
                ? 'bg-destructive text-destructive-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Message Cards */}
      <div className="space-y-4">
        {filtered.map((m) => (
          <Card key={m.id} className="border-border shadow-xs overflow-hidden bg-card">
            <CardHeader className="bg-muted/40 border-b border-border py-3 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="font-mono text-xs font-bold text-destructive break-all sm:break-normal">
                  {m.topic}
                </span>
                <span className="text-2xs text-muted-foreground font-mono ml-2 block sm:inline">
                  Partition {m.partition} • Offset {m.offset} • {m.failedAt}
                </span>
              </div>
              <Badge
                className={`text-2xs font-semibold shrink-0 ${
                  m.isRedriven
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'bg-destructive/10 text-destructive border-destructive/20'
                }`}
              >
                {m.isRedriven ? 'RE-DRIVEN / RECOVERED' : 'UNRESOLVED EXCEPTION'}
              </Badge>
            </CardHeader>

            <CardContent className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20 text-destructive font-mono text-2xs break-words">
                <strong>Exception:</strong> {m.errorException}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-2xs uppercase tracking-wider">
                    Raw Event JSON Payload:
                  </span>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="gap-1 text-muted-foreground hover:text-foreground"
                    onClick={() => handleCopyJson(m.id, m.payloadJson)}
                  >
                    {copiedId === m.id ? (
                      <>
                        <Check className="h-3 w-3 text-primary" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> Copy Payload
                      </>
                    )}
                  </Button>
                </div>
                <pre className="p-3 rounded-lg bg-zinc-950 text-emerald-400 font-mono text-2xs overflow-x-auto border border-zinc-800">
                  {m.payloadJson}
                </pre>
              </div>

              {!m.isRedriven && (
                <div className="flex justify-end pt-2">
                  <Button
                    size="sm"
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-1.5 text-xs font-semibold shadow-xs w-full sm:w-auto"
                    onClick={() => setSelectedEventToRedrive(m)}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Re-drive Message into Pipeline
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Redrive Confirmation Alert Dialog */}
      <AlertDialog open={selectedEventToRedrive !== null} onOpenChange={(open) => !open && setSelectedEventToRedrive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-destructive" />
              Подтверждение повторной отправки (Redrive) события
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 pt-2 text-left">
              <div>
                Вы действительно хотите повторно направить событие в поток обработки Kafka?
              </div>
              <div className="p-2.5 rounded bg-muted font-mono text-2xs space-y-1 text-foreground">
                <div><strong>Event ID:</strong> {selectedEventToRedrive?.id}</div>
                <div><strong>Topic:</strong> {selectedEventToRedrive?.topic}</div>
                <div><strong>Partition / Offset:</strong> {selectedEventToRedrive?.partition} / {selectedEventToRedrive?.offset}</div>
              </div>
              <p className="text-2xs text-muted-foreground">
                Внимание: Убедитесь, что причина сбоя (например, оптимистическая блокировка или таймаут шлюза KSeF) устранена перед повторным выполнением.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRedriveConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Отправить повторно (Redrive)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
