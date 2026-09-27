import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  Building2,
  Calendar,
  AlertTriangle,
  TrendingDown,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/buyer/contracts')({
  component: BuyerContractsPage,
  staticData: {
    crumb: {
      label: 'Framework Contracts',
    },
  },
});

interface FrameworkContract {
  id: string;
  contractNumber: string;
  supplierName: string;
  supplierNip: string;
  productCategory: string;
  volumeCommittedUnits: number;
  volumeFulfilledUnits: number;
  contractDiscountPercent: number;
  validFrom: string;
  validTo: string;
  slaMaxLeadTimeDays: number;
  slaPenaltyPerDayPercent: number;
  status: 'ACTIVE' | 'PENDING_RENEWAL' | 'COMPLETED';
}

const CONTRACTS_DATA: FrameworkContract[] = [
  {
    id: 'cntr-01',
    contractNumber: 'B2B-SLA-2026-0019',
    supplierName: 'Drewnex Palety Sp. z o.o.',
    supplierNip: '7822910483',
    productCategory: 'Packaging & Cargo Units (EPAL)',
    volumeCommittedUnits: 10000,
    volumeFulfilledUnits: 7500,
    contractDiscountPercent: 18.5,
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    slaMaxLeadTimeDays: 2,
    slaPenaltyPerDayPercent: 0.5,
    status: 'ACTIVE',
  },
  {
    id: 'cntr-02',
    contractNumber: 'B2B-SLA-2026-0044',
    supplierName: 'PlastChem Industrial Sp. k.',
    supplierNip: '8942019485',
    productCategory: 'Stretch Film & Packaging Supplies',
    volumeCommittedUnits: 2500,
    volumeFulfilledUnits: 2350,
    contractDiscountPercent: 15.0,
    validFrom: '2026-03-01',
    validTo: '2026-09-30',
    slaMaxLeadTimeDays: 3,
    slaPenaltyPerDayPercent: 0.75,
    status: 'PENDING_RENEWAL',
  },
];

function BuyerContractsPage() {
  const [contracts] = useState<FrameworkContract[]>(CONTRACTS_DATA);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText className="h-6 w-6 text-emerald-600" />
              Framework Agreements & SLA Contracts
            </h1>
            <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">
              Enterprise SCM 2.0
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Long-term procurement volume commitments, fixed preferential B2B price tiers, and automated SLA penalty tracking.
          </p>
        </div>

        <Button
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-xs shadow-xs"
          onClick={() => toast.info('Initiated new Framework Contract draft request')}
        >
          Draft New SLA Agreement
        </Button>
      </div>

      {/* Contract Cards */}
      <div className="space-y-6">
        {contracts.map((c) => {
          const fulfillmentProgress = Math.round((c.volumeFulfilledUnits / c.volumeCommittedUnits) * 100);
          return (
            <Card key={c.id} className="border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
              <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b py-3 px-5 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-emerald-600" />
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                      {c.contractNumber}
                    </span>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {c.supplierName}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    variant={c.status === 'ACTIVE' ? 'default' : 'secondary'}
                    className={
                      c.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }
                  >
                    {c.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1 text-xs"
                    onClick={() => toast.success(`Downloaded signed SLA contract: ${c.contractNumber}`)}
                  >
                    <Download className="h-3.5 w-3.5" />
                    PDF
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Volume Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Volume Commitment Fulfillment Progress (Target: {c.volumeCommittedUnits.toLocaleString()} units)
                    </span>
                    <span className="font-mono font-bold text-emerald-600">
                      {c.volumeFulfilledUnits.toLocaleString()} units ({fulfillmentProgress}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${fulfillmentProgress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Terms Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-500 block">Negotiated Discount:</span>
                    <span className="font-mono font-bold text-emerald-600 text-sm">
                      -{c.contractDiscountPercent}% Off List
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">SLA Lead Time:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Max {c.slaMaxLeadTimeDays} business days
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">SLA Penalty Clause:</span>
                    <span className="font-semibold text-amber-600">
                      {c.slaPenaltyPerDayPercent}% auto-credit/day late
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Contract Term:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {c.validFrom} ➔ {c.validTo}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
