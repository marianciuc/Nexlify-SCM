import { createFileRoute, Link } from '@tanstack/react-router';
import {
  ChevronLeft,
  Gavel,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useClaimsQuery, useResolveClaimMutation } from '@/hooks/useScmQueries';

export const Route = createFileRoute('/admin/system-audit/disputes')({
  component: AdminDisputesArbitrationPage,
  staticData: {
    crumb: {
      label: 'RMA Arbitration',
    },
  },
});

function AdminDisputesArbitrationPage() {
  const { data: claims = [] } = useClaimsQuery();
  const resolveMutation = useResolveClaimMutation();

  const handleResolve = async (claimId: string, decision: 'APPROVED' | 'REJECTED') => {
    await resolveMutation.mutateAsync({ claimId, decision });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
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
          Binding administrative resolution for cargo discrepancies and damages when supplier and buyer fail to reach consensus.
        </p>
      </div>

      <div className="space-y-4">
        {claims.map((claim) => (
          <Card key={claim.id} className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b py-3 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-mono text-xs font-bold text-red-600">{claim.claimNumber}</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 ml-2">
                  Order Ref: {claim.orderNumber} • Supplier: {claim.supplierName}
                </span>
              </div>
              <Badge
                className={
                  claim.status === 'APPROVED_CREDIT_NOTE'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-xs'
                    : 'bg-amber-50 text-amber-700 border-amber-200 text-xs'
                }
              >
                {claim.status === 'APPROVED_CREDIT_NOTE' ? (
                  <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                ) : (
                  <Clock className="h-3 w-3 mr-1 inline" />
                )}
                {claim.status}
              </Badge>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs">
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-3 rounded-xl">
                <span>Disputed Compensation Value:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {claim.claimAmountPln.toFixed(2)} PLN
                </span>
              </div>

              <p className="text-slate-600 dark:text-slate-300">
                <strong>Discrepancy Details:</strong> {claim.reason}
              </p>

              <div className="text-2xs text-muted-foreground">
                Reported Date: {claim.reportedDate} • Settlement: {claim.settlementType}
              </div>

              {claim.status === 'PENDING_SUPPLIER' && (
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-300 text-slate-700 gap-1.5 text-xs font-semibold w-full sm:w-auto"
                    onClick={() => handleResolve(claim.id, 'REJECTED')}
                  >
                    <XCircle className="h-3.5 w-3.5 text-slate-500" />
                    Reject Discrepancy
                  </Button>
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white gap-1.5 text-xs font-semibold w-full sm:w-auto"
                    onClick={() => handleResolve(claim.id, 'APPROVED')}
                  >
                    <Gavel className="h-3.5 w-3.5" />
                    Enforce Forced Credit Note to Buyer
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
