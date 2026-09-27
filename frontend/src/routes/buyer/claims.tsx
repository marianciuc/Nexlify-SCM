import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  ShieldAlert,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/buyer/claims')({
  component: BuyerClaimsPage,
  staticData: {
    crumb: {
      label: 'Claims & RMA',
    },
  },
});

interface RmaClaim {
  id: string;
  claimNumber: string;
  orderNumber: string;
  supplierName: string;
  reason: string;
  claimAmountPln: number;
  reportedDate: string;
  status: 'PENDING_SUPPLIER' | 'APPROVED_CREDIT_NOTE' | 'REPLACEMENT_DISPATCHED';
  settlementType: string;
}

const CLAIMS_DATA: RmaClaim[] = [
  {
    id: 'rma-01',
    claimNumber: 'RMA-2026-003',
    orderNumber: 'ORD-2026-0891',
    supplierName: 'Drewnex Palety Sp. z o.o.',
    reason: 'Defective Pallet Boards (10 pcs cracked upon unloading)',
    claimAmountPln: 1200.0,
    reportedDate: '2026-09-24',
    status: 'APPROVED_CREDIT_NOTE',
    settlementType: 'Faktura Korygująca issued (-1,200 PLN)',
  },
  {
    id: 'rma-02',
    claimNumber: 'RMA-2026-004',
    orderNumber: 'ORD-2026-0892',
    supplierName: 'PlastChem Industrial Sp. k.',
    reason: 'Packaging seal puncture during freight',
    claimAmountPln: 822.5,
    reportedDate: '2026-09-25',
    status: 'PENDING_SUPPLIER',
    settlementType: 'Investigation in progress',
  },
];

function BuyerClaimsPage() {
  const [claims] = useState<RmaClaim[]>(CLAIMS_DATA);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-amber-600" />
              RMA Claims & Discrepancy Resolution
            </h1>
            <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">
              Enterprise SCM 2.0
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Formal return merchandise authorizations, unbundling discrepancies, and automatic Faktura Korygująca credit notes.
          </p>
        </div>

        <Button
          className="bg-amber-600 hover:bg-amber-700 text-white gap-2 text-xs shadow-xs"
          onClick={() => toast.info('To file a claim, select an order in the Orders tab and click File RMA.')}
        >
          <Plus className="h-4 w-4" /> Report New Discrepancy
        </Button>
      </div>

      {/* Claims Table */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b text-slate-600 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4">Claim #</th>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Discrepancy Details</th>
                <th className="py-3 px-4 text-right">Claim Amount</th>
                <th className="py-3 px-4">Reported Date</th>
                <th className="py-3 px-4">Resolution Status</th>
                <th className="py-3 px-4 text-right">Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {claims.map((claim) => (
                <tr key={claim.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-mono font-bold text-amber-700 dark:text-amber-400">
                    {claim.claimNumber}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">{claim.orderNumber}</td>
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                    {claim.supplierName}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                    {claim.reason}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100 text-right">
                    {claim.claimAmountPln.toFixed(2)} PLN
                  </td>
                  <td className="py-3 px-4 text-slate-500">{claim.reportedDate}</td>
                  <td className="py-3 px-4">
                    <Badge
                      variant="outline"
                      className={`text-2xs ${
                        claim.status === 'APPROVED_CREDIT_NOTE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {claim.status === 'APPROVED_CREDIT_NOTE' ? (
                        <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                      ) : (
                        <Clock className="h-3 w-3 mr-1 inline" />
                      )}
                      {claim.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-700 dark:text-slate-300">
                    {claim.settlementType}
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
