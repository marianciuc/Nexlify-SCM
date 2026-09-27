import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import {
  ChevronLeft,
  ShieldAlert,
  Gavel,
  CheckCircle2,
  Building2,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/admin/system-audit/disputes')({
  component: AdminDisputesArbitrationPage,
  staticData: {
    crumb: {
      label: 'RMA Arbitration',
    },
  },
});

interface Dispute {
  id: string;
  claimNo: string;
  buyerName: string;
  supplierName: string;
  amountPln: number;
  reason: string;
  status: 'IN_ARBITRATION' | 'RESOLVED_CREDIT_ISSUED';
}

const DISPUTES: Dispute[] = [
  {
    id: 'dsp-01',
    claimNo: 'RMA-2026-004',
    buyerName: 'Pomerania Foods Sp. k.',
    supplierName: 'PlastChem Industrial Sp. k.',
    amountPln: 822.5,
    reason: 'Punctured packaging rolls rejected upon delivery dock inspection',
    status: 'IN_ARBITRATION',
  },
];

function AdminDisputesArbitrationPage() {
  const [disputes, setDisputes] = useState<Dispute[]>(DISPUTES);

  const handleResolve = (id: string) => {
    setDisputes(
      disputes.map((d) => (d.id === id ? { ...d, status: 'RESOLVED_CREDIT_ISSUED' } : d))
    );
    toast.success('Arbitration decision: Forced Faktura Korygująca credit note issued to Buyer.');
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
          Platform Arbitration
        </Badge>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Gavel className="h-6 w-6 text-red-600" />
          Platform B2B Disputes & RMA Arbitration
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Binding administrative resolution for cargo discrepancy and damages when supplier and buyer fail to reach consensus.
        </p>
      </div>

      <div className="space-y-4">
        {disputes.map((d) => (
          <Card key={d.id} className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b py-3 px-5 flex flex-row items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-red-600">{d.claimNo}</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 ml-2">
                  {d.buyerName} vs {d.supplierName}
                </span>
              </div>
              <Badge
                className={
                  d.status === 'RESOLVED_CREDIT_ISSUED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-xs'
                    : 'bg-amber-50 text-amber-700 border-amber-200 text-xs'
                }
              >
                {d.status}
              </Badge>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs">
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-3 rounded-xl">
                <span>Disputed Value:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {d.amountPln.toFixed(2)} PLN
                </span>
              </div>

              <p className="text-slate-600 dark:text-slate-300">
                <strong>Discrepancy:</strong> {d.reason}
              </p>

              {d.status === 'IN_ARBITRATION' && (
                <div className="flex justify-end pt-2">
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white gap-1.5 text-xs font-semibold"
                    onClick={() => handleResolve(d.id)}
                  >
                    <Gavel className="h-3.5 w-3.5" />
                    Enforce Immediate Credit Note to Buyer
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
