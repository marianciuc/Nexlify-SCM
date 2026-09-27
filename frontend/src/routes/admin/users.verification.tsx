import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import {
  ChevronLeft,
  UserCheck,
  Building2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/admin/users/verification')({
  component: AdminKycVerificationQueuePage,
  staticData: {
    crumb: {
      label: 'KYC Queue',
    },
  },
});

interface PendingKyc {
  id: string;
  name: string;
  nip: string;
  krs: string;
  requestedRole: string;
  submittedDate: string;
  regonChecked: boolean;
  whiteListVatChecked: boolean;
  viesEuChecked: boolean;
  status: 'PENDING_AUDIT' | 'APPROVED' | 'REJECTED';
}

const PENDING_APPLICATIONS: PendingKyc[] = [
  {
    id: 'kyc-01',
    name: 'Vistula Trans Sp. z o.o.',
    nip: '5219482014',
    krs: '0000918249',
    requestedRole: 'LOGISTICS_CARRIER',
    submittedDate: '2026-09-24 16:40',
    regonChecked: true,
    whiteListVatChecked: true,
    viesEuChecked: true,
    status: 'PENDING_AUDIT',
  },
];

function AdminKycVerificationQueuePage() {
  const [applications, setApplications] = useState<PendingKyc[]>(PENDING_APPLICATIONS);

  const handleApprove = (id: string, name: string) => {
    setApplications(applications.map((a) => (a.id === id ? { ...a, status: 'APPROVED' } : a)));
    toast.success(`Organization ${name} approved and Keycloak realm role provisioned!`);
  };

  const handleReject = (id: string, name: string) => {
    setApplications(applications.map((a) => (a.id === id ? { ...a, status: 'REJECTED' } : a)));
    toast.error(`Organization ${name} registration rejected.`);
  };

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Tenants Directory
        </Link>
        <Badge variant="outline" className="text-red-700 bg-red-50 border-red-200">
          KYC Compliance Engine
        </Badge>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-red-600" />
          KYC & Tax Registration Verification Queue
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review business registration filings, verify automated Polish Ministry of Finance White List and EU VIES status.
        </p>
      </div>

      <div className="space-y-4">
        {applications.map((app) => (
          <Card key={app.id} className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b py-3 px-5 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-red-600" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{app.name}</h3>
                  <div className="font-mono text-2xs text-slate-500">NIP: {app.nip} • KRS: {app.krs}</div>
                </div>
              </div>

              <Badge
                className={
                  app.status === 'APPROVED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-xs'
                    : app.status === 'REJECTED'
                    ? 'bg-red-50 text-red-700 border-red-200 text-xs'
                    : 'bg-amber-50 text-amber-700 border-amber-200 text-xs'
                }
              >
                {app.status}
              </Badge>
            </CardHeader>

            <CardContent className="p-6 space-y-4 text-xs">
              {/* Compliance Checks Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border bg-white dark:bg-slate-950 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">GUS / REGON Database</div>
                    <div className="text-2xs text-slate-500">Active Polish Business</div>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>

                <div className="p-3 rounded-lg border bg-white dark:bg-slate-950 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">Biała Lista Podatników (MF)</div>
                    <div className="text-2xs text-slate-500">Active VAT Payer Status</div>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>

                <div className="p-3 rounded-lg border bg-white dark:bg-slate-950 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">VIES EU Cross-Border</div>
                    <div className="text-2xs text-slate-500">Valid Intra-Community VAT</div>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
              </div>

              {app.status === 'PENDING_AUDIT' && (
                <div className="flex justify-end gap-3 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleReject(app.id, app.name)}
                  >
                    Reject Registration
                  </Button>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 font-semibold"
                    onClick={() => handleApprove(app.id, app.name)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve Organization & Provision Realm
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
