import { createFileRoute, Link, Outlet, useChildMatches } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Users,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/admin/users')({
  component: AdminTenantsDirectoryPage,
  staticData: {
    crumb: {
      label: 'Tenants & Counterparties',
    },
  },
});

interface TenantRecord {
  id: string;
  name: string;
  nip: string;
  role: 'BUYER' | 'SUPPLIER' | 'LOGISTICS_CARRIER';
  kycStatus: 'VERIFIED' | 'PENDING_AUDIT';
  tradeCreditLimitPln: number;
  creditUsedPln: number;
  joinedDate: string;
}

const INITIAL_TENANTS: TenantRecord[] = [
  {
    id: 'ten-01',
    name: 'Baltic Retail Group Sp. z o.o.',
    nip: '8522619472',
    role: 'BUYER',
    kycStatus: 'VERIFIED',
    tradeCreditLimitPln: 150000,
    creditUsedPln: 34993,
    joinedDate: '2026-01-15',
  },
  {
    id: 'ten-02',
    name: 'Drewnex Palety & Packaging Sp. z o.o.',
    nip: '7822910483',
    role: 'SUPPLIER',
    kycStatus: 'VERIFIED',
    tradeCreditLimitPln: 0,
    creditUsedPln: 0,
    joinedDate: '2026-02-01',
  },
  {
    id: 'ten-03',
    name: 'PlastChem Industrial Sp. k.',
    nip: '8942019485',
    role: 'SUPPLIER',
    kycStatus: 'VERIFIED',
    tradeCreditLimitPln: 0,
    creditUsedPln: 0,
    joinedDate: '2026-03-10',
  },
  {
    id: 'ten-04',
    name: 'Pomerania Foods Sp. k.',
    nip: '5832918471',
    role: 'BUYER',
    kycStatus: 'VERIFIED',
    tradeCreditLimitPln: 200000,
    creditUsedPln: 82779,
    joinedDate: '2026-02-18',
  },
  {
    id: 'ten-05',
    name: 'Vistula Trans Sp. z o.o.',
    nip: '5219482014',
    role: 'LOGISTICS_CARRIER',
    kycStatus: 'PENDING_AUDIT',
    tradeCreditLimitPln: 0,
    creditUsedPln: 0,
    joinedDate: '2026-09-24',
  },
];

function AdminTenantsDirectoryPage() {
  const childMatches = useChildMatches();
  if (childMatches.length > 0) {
    return <Outlet />;
  }
  return <AdminTenantsDirectoryContent />;
}

function AdminTenantsDirectoryContent() {
  const [tenants] = useState<TenantRecord[]>(INITIAL_TENANTS);
  const [filterRole, setFilterRole] = useState<string>('ALL');

  const filtered = tenants.filter((t) => {
    if (filterRole === 'ALL') return true;
    return t.role === filterRole;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building2 className="h-6 w-6 text-red-600" />
              B2B Tenant Directory & Counterparty Governance
            </h1>
            <Badge variant="outline" className="text-red-700 bg-red-50 border-red-200">
              Screen P17
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Global directory of buyers, manufacturers, and logistics carriers. Approve Trade Credit lines and monitor debt exposure.
          </p>
        </div>

        <Link to="/admin/users/verification">
          <Button className="bg-red-600 hover:bg-red-700 text-white gap-2 text-xs shadow-xs">
            <UserCheck className="h-4 w-4" /> KYC Verification Queue (1 Pending)
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs overflow-x-auto" role="group" aria-label="Tenant role filter">
        {[
          { id: 'ALL', label: 'All Organizations' },
          { id: 'BUYER', label: 'Buyers (Procurement)' },
          { id: 'SUPPLIER', label: 'Suppliers (WMS)' },
          { id: 'LOGISTICS_CARRIER', label: 'Carriers (TMS)' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterRole(tab.id)}
            aria-pressed={filterRole === tab.id}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
              filterRole === tab.id
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tenants Table */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[850px]">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b text-slate-600 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4">Organization Name</th>
                <th className="py-3 px-4">Tax ID (NIP)</th>
                <th className="py-3 px-4">Platform Role</th>
                <th className="py-3 px-4">KYC Status</th>
                <th className="py-3 px-4 text-right">Trade Credit Facility</th>
                <th className="py-3 px-4 text-right">Current Exposure</th>
                <th className="py-3 px-4">Member Since</th>
                <th className="py-3 px-4 text-right">Administration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                    <Link to="/admin/users/$tenantId" params={{ tenantId: t.id }} className="hover:underline">
                      {t.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">NIP: {t.nip}</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="text-2xs font-mono">
                      {t.role}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      className={`text-2xs ${
                        t.kycStatus === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {t.kycStatus}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold tabular-nums text-right text-slate-900 dark:text-slate-100">
                    {t.tradeCreditLimitPln > 0 ? `${t.tradeCreditLimitPln.toLocaleString()} PLN` : 'N/A (Cash)'}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold tabular-nums text-right text-red-600">
                    {t.creditUsedPln > 0 ? `${t.creditUsedPln.toLocaleString()} PLN` : '0 PLN'}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono tabular-nums">{t.joinedDate}</td>
                  <td className="py-3 px-4 text-right">
                    <Link to="/admin/users/$tenantId" params={{ tenantId: t.id }} aria-label={`Configure tenant ${t.name}`}>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        Configure <ArrowRight className="h-3 w-3 ml-1" aria-hidden="true" />
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
