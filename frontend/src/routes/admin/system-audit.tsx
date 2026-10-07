import { createFileRoute } from '@tanstack/react-router';
import {
  Activity,
  CheckCircle2,
  Copy,
  Database,
  Gavel,
  AlertTriangle,
  RefreshCw,
  ShieldAlert,
  XCircle,
  Check,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { MoneyDisplay } from '@/components/money-display';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocale } from '@/hooks/useLocale';
import { useClaimsQuery, useResolveClaimMutation } from '@/hooks/useScmQueries';
import type { TranslationPath } from '@/types/generated-locale';

export const Route = createFileRoute('/admin/system-audit')({
  component: SystemAuditPage,
  staticData: {
    crumb: {
      label: 'nav.admin.audit',
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
    errorException:
      'OptimisticLockingFailureException: Concurrent stock reservation lock timeout on SKU-PAL-01 in Warszawa DC-01',
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

type DisputeStatus = 'PENDING_SUPPLIER' | 'APPROVED_CREDIT_NOTE' | 'REPLACEMENT_DISPATCHED';

const DISPUTE_STATUS_TONE: Record<DisputeStatus, 'success' | 'warning' | 'info'> = {
  APPROVED_CREDIT_NOTE: 'success',
  PENDING_SUPPLIER: 'warning',
  REPLACEMENT_DISPATCHED: 'info',
};

const DISPUTE_STATUS_LABEL: Record<DisputeStatus, TranslationPath> = {
  APPROVED_CREDIT_NOTE: 'admin.systemAudit.disputes.status.approved',
  PENDING_SUPPLIER: 'admin.systemAudit.disputes.status.pending',
  REPLACEMENT_DISPATCHED: 'admin.systemAudit.disputes.status.pending',
};

type DltFilter = 'ALL' | 'UNRESOLVED' | 'RECOVERED';

const DLT_FILTERS: { id: DltFilter; labelKey: TranslationPath }[] = [
  { id: 'ALL', labelKey: 'admin.systemAudit.dlt.filter.all' },
  { id: 'UNRESOLVED', labelKey: 'admin.systemAudit.dlt.filter.unresolved' },
  { id: 'RECOVERED', labelKey: 'admin.systemAudit.dlt.filter.recovered' },
];

function SystemAuditPage() {
  const { t } = useLocale();
  return (
    <div className="space-y-6 max-w-7xl mx-auto min-w-0">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" aria-hidden="true" />
            {t('admin.systemAudit.title')}
          </span>
        }
        subtitle={t('admin.systemAudit.subtitle')}
      />

      <Tabs defaultValue="disputes" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/60 p-1">
          <TabsTrigger value="disputes" className="text-xs gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
            {t('admin.systemAudit.tab.disputes')}
          </TabsTrigger>
          <TabsTrigger value="dlt" className="text-xs gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
            {t('admin.systemAudit.tab.dlt')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="disputes" className="space-y-4 pt-4">
          <DisputesTab t={t} />
        </TabsContent>

        <TabsContent value="dlt" className="space-y-4 pt-4">
          <DltTab t={t} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DisputesTab({ t }: { t: (key: TranslationPath, options?: Record<string, unknown>) => string }) {
  const { data: claims = [] } = useClaimsQuery();
  const resolveMutation = useResolveClaimMutation();

  const handleResolve = async (claimId: string, decision: 'APPROVED' | 'REJECTED') => {
    await resolveMutation.mutateAsync({ claimId, decision });
  };

  return (
    <Card className="border-border bg-card shadow-xs overflow-hidden">
      <CardHeader className="py-3 px-5 border-b border-border">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Gavel className="h-4 w-4 text-primary" aria-hidden="true" />
          {t('admin.systemAudit.disputes.title')}
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          {t('admin.systemAudit.disputes.subtitle')}
        </p>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[900px]">
          <caption className="sr-only">{t('admin.systemAudit.disputes.tableCaption')}</caption>
          <thead className="bg-muted/30 border-b border-border text-muted-foreground text-[11px] uppercase tracking-wider font-semibold whitespace-nowrap">
            <tr>
              <th className="py-3 px-4">{t('admin.systemAudit.disputes.table.claim')}</th>
              <th className="py-3 px-4">{t('admin.systemAudit.disputes.table.order')}</th>
              <th className="py-3 px-4">{t('admin.systemAudit.disputes.table.reason')}</th>
              <th className="py-3 px-4 text-right">{t('admin.systemAudit.disputes.table.amount')}</th>
              <th className="py-3 px-4">{t('admin.systemAudit.disputes.table.reported')}</th>
              <th className="py-3 px-4">{t('admin.systemAudit.disputes.table.settlement')}</th>
              <th className="py-3 px-4">{t('admin.systemAudit.disputes.table.status')}</th>
              <th className="py-3 px-4 text-right">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border whitespace-nowrap">
            {claims.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                  <Gavel className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" aria-hidden="true" />
                  <p className="font-semibold text-foreground">
                    {t('admin.systemAudit.disputes.emptyTitle')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('admin.systemAudit.disputes.emptySubtitle')}
                  </p>
                </td>
              </tr>
            ) : (
              claims.map((claim) => {
                const status = claim.status as DisputeStatus;
                return (
                  <tr key={claim.id} className="hover:bg-muted/30 transition-colors align-top">
                    <td className="py-3 px-4 font-mono font-bold text-primary">{claim.claimNumber}</td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-xs text-foreground">{claim.orderNumber}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{claim.supplierName}</div>
                    </td>
                    <td className="py-3 px-4 max-w-[260px]">
                      <span className="text-xs text-foreground whitespace-normal">{claim.reason}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <MoneyDisplay amount={claim.claimAmountPln} variant="inline" emphasize />
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground font-mono">{claim.reportedDate}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{claim.settlementType}</td>
                    <td className="py-3 px-4">
                      <StatusBadge
                        tone={DISPUTE_STATUS_TONE[status]}
                        label={t(DISPUTE_STATUS_LABEL[status])}
                        size="sm"
                      />
                    </td>
                    <td className="py-3 px-4 text-right">
                      {status === 'PENDING_SUPPLIER' ? (
                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                          <Button
                            size="xs"
                            variant="outline"
                            className="gap-1 font-semibold w-full sm:w-auto"
                            onClick={() => handleResolve(claim.id, 'REJECTED')}
                          >
                            <XCircle className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                            {t('admin.systemAudit.disputes.actions.reject')}
                          </Button>
                          <Button
                            size="xs"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1 font-semibold w-full sm:w-auto"
                            onClick={() => handleResolve(claim.id, 'APPROVED')}
                          >
                            <Gavel className="h-3 w-3" aria-hidden="true" />
                            {t('admin.systemAudit.disputes.actions.enforce')}
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function DltTab({ t }: { t: (key: TranslationPath, options?: Record<string, unknown>) => string }) {
  const [messages, setMessages] = useState<DltMessage[]>(INITIAL_DLT);
  const [filterState, setFilterState] = useState<DltFilter>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedEventToRedrive, setSelectedEventToRedrive] = useState<DltMessage | null>(null);

  const handleRedriveConfirm = () => {
    if (!selectedEventToRedrive) return;
    const id = selectedEventToRedrive.id;
    setMessages((current) => current.map((m) => (m.id === id ? { ...m, isRedriven: true } : m)));
    toast.success(t('admin.systemAudit.dlt.message.redriveSuccess', { id }));
    setSelectedEventToRedrive(null);
  };

  const handleCopyJson = (id: string, json: string) => {
    navigator.clipboard.writeText(json);
    setCopiedId(id);
    toast.success(t('admin.systemAudit.dlt.message.copySuccess'));
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
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-border bg-card">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{t('admin.systemAudit.dlt.metrics.total')}</span>
            <Database className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="text-2xl font-bold font-mono text-foreground mt-1 tabular-nums">{stats.total}</div>
          <span className="text-xs text-muted-foreground">{t('admin.systemAudit.dlt.metrics.totalHelper')}</span>
        </Card>

        <Card className="p-4 border-destructive/30 bg-destructive/5">
          <div className="flex items-center justify-between text-xs text-destructive">
            <span>{t('admin.systemAudit.dlt.metrics.unresolved')}</span>
            <AlertTriangle className="h-4 w-4 text-destructive" aria-hidden="true" />
          </div>
          <div className="text-2xl font-bold font-mono text-destructive mt-1 tabular-nums">{stats.unresolved}</div>
          <span className="text-xs text-destructive/80">{t('admin.systemAudit.dlt.metrics.unresolvedHelper')}</span>
        </Card>

        <Card className="p-4 border-primary/30 bg-primary/5">
          <div className="flex items-center justify-between text-xs text-primary">
            <span>{t('admin.systemAudit.dlt.metrics.recovered')}</span>
            <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
          <div className="text-2xl font-bold font-mono text-primary mt-1 tabular-nums">{stats.recovered}</div>
          <span className="text-xs text-primary/80">{t('admin.systemAudit.dlt.metrics.recoveredHelper')}</span>
        </Card>
      </div>

      <div
        className="flex items-center gap-1 bg-card p-1 rounded-lg border border-border shadow-xs text-xs overflow-x-auto"
        role="group"
        aria-label={t('admin.systemAudit.dlt.filterAria')}
      >
        {DLT_FILTERS.map((f) => {
          const isActive = filterState === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterState(f.id)}
              aria-pressed={isActive}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors shrink-0 whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {t(f.labelKey)}
            </button>
          );
        })}
      </div>

      <Card className="border-border bg-card shadow-xs overflow-hidden">
        <CardHeader className="py-3 px-5 border-b border-border">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" aria-hidden="true" />
            {t('admin.systemAudit.dlt.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[900px]">
            <caption className="sr-only">{t('admin.systemAudit.dlt.tableCaption')}</caption>
            <thead className="bg-muted/30 border-b border-border text-muted-foreground text-[11px] uppercase tracking-wider font-semibold whitespace-nowrap">
              <tr>
                <th className="py-3 px-4">Topic / partition</th>
                <th className="py-3 px-4">{t('admin.systemAudit.dlt.message.exception')}</th>
                <th className="py-3 px-4 text-right">Offset</th>
                <th className="py-3 px-4">Failed at</th>
                <th className="py-3 px-4">{t('admin.systemAudit.disputes.table.status')}</th>
                <th className="py-3 px-4 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border whitespace-nowrap">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                    <AlertTriangle className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" aria-hidden="true" />
                    <p className="font-semibold text-foreground">
                      {t('admin.systemAudit.disputes.emptyTitle')}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/30 transition-colors align-top">
                    <td className="py-3 px-4">
                      <div className="font-mono text-xs font-bold text-destructive break-all sm:break-normal">
                        {m.topic}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">
                        Partition {m.partition}
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-[420px]">
                      <code className="font-mono text-xs text-foreground whitespace-normal break-words">
                        {m.errorException}
                      </code>
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">
                            {t('admin.systemAudit.dlt.message.payload')}
                          </span>
                          <Button
                            variant="ghost"
                            size="xs"
                            className="gap-1 text-muted-foreground hover:text-foreground"
                            aria-label={
                              copiedId === m.id
                                ? t('admin.systemAudit.dlt.message.copied')
                                : t('admin.systemAudit.dlt.message.copy')
                            }
                            onClick={() => handleCopyJson(m.id, m.payloadJson)}
                          >
                            {copiedId === m.id ? (
                              <>
                                <Check className="h-3 w-3 text-primary" aria-hidden="true" />{' '}
                                {t('admin.systemAudit.dlt.message.copied')}
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" aria-hidden="true" />{' '}
                                {t('admin.systemAudit.dlt.message.copy')}
                              </>
                            )}
                          </Button>
                        </div>
                        <pre className="p-2 rounded-md bg-zinc-950 text-emerald-400 font-mono text-[11px] overflow-x-auto border border-zinc-800 whitespace-pre">
                          {m.payloadJson}
                        </pre>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-foreground">
                      {m.offset}
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground font-mono">{m.failedAt}</td>
                    <td className="py-3 px-4">
                      {m.isRedriven ? (
                        <StatusBadge
                          tone="success"
                          label={t('admin.systemAudit.dlt.badge.redriven')}
                          size="sm"
                        />
                      ) : (
                        <StatusBadge
                          tone="danger"
                          label={t('admin.systemAudit.dlt.badge.unresolved')}
                          size="sm"
                        />
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {!m.isRedriven ? (
                        <Button
                          size="xs"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1 font-semibold w-full sm:w-auto"
                          onClick={() => setSelectedEventToRedrive(m)}
                        >
                          <RefreshCw className="h-3 w-3" aria-hidden="true" />
                          {t('admin.systemAudit.dlt.message.redrive')}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <AlertDialog
        open={selectedEventToRedrive !== null}
        onOpenChange={(open) => !open && setSelectedEventToRedrive(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" aria-hidden="true" />
              {t('admin.systemAudit.dlt.redriveDialog.title')}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 pt-2 text-left">
              <div>{t('admin.systemAudit.dlt.redriveDialog.body')}</div>
              <div className="p-2.5 rounded bg-muted font-mono text-xs space-y-1 text-foreground">
                <div>
                  <strong>{t('admin.systemAudit.dlt.redriveDialog.eventId')}:</strong>{' '}
                  {selectedEventToRedrive?.id}
                </div>
                <div>
                  <strong>{t('admin.systemAudit.dlt.redriveDialog.topic')}:</strong>{' '}
                  {selectedEventToRedrive?.topic}
                </div>
                <div>
                  <strong>{t('admin.systemAudit.dlt.redriveDialog.partitionOffset')}:</strong>{' '}
                  {selectedEventToRedrive?.partition} / {selectedEventToRedrive?.offset}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('admin.systemAudit.dlt.redriveDialog.warning')}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <AlertDialogCancel>{t('admin.systemAudit.dlt.redriveDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRedriveConfirm}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {t('admin.systemAudit.dlt.redriveDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default SystemAuditPage;