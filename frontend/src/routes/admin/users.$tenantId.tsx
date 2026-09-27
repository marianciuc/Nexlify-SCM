import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import {
  ChevronLeft,
  Building2,
  CreditCard,
  ShieldCheck,
  Save,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/admin/users/$tenantId')({
  component: AdminTenantDetailPage,
  staticData: {
    crumb: {
      label: 'Tenant Governance',
    },
  },
});

function AdminTenantDetailPage() {
  const { tenantId } = Route.useParams();

  const [creditLimit, setCreditLimit] = useState(150000);
  const [paymentTerms, setPaymentTerms] = useState('NET_30');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Trade Credit facility updated for tenant ${tenantId}! Synced with Billing Service.`);
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Tenants Directory
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Tenant: <span className="text-red-600">Baltic Retail Group Sp. z o.o.</span>
            </h1>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
              KYC Verified
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">NIP: 8522619472 • Role: ROLE_CLIENT (B2B Buyer)</p>
        </div>

        <Button
          className="bg-red-600 hover:bg-red-700 text-white gap-2 text-xs font-semibold"
          onClick={handleSave}
        >
          <Save className="h-4 w-4" /> Save Credit Facility Updates
        </Button>
      </div>

      {/* Credit Limits Form */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="py-3 px-5 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-red-600" /> B2B Trade Credit Facility Governance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-5 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Approved Credit Facility (PLN):</Label>
              <Input
                type="number"
                step="10000"
                value={creditLimit}
                onChange={(e) => setCreditLimit(Number(e.target.value))}
                className="font-mono text-base font-bold text-slate-900 dark:text-slate-100"
              />
              <span className="text-2xs text-slate-500">
                Current outstanding balance: <strong>34,993.50 PLN</strong> (Available: {(creditLimit - 34993.5).toLocaleString()} PLN)
              </span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Authorized Payment Terms:</Label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full p-2.5 text-xs border rounded-md bg-white dark:bg-slate-900 font-semibold"
              >
                <option value="NET_15">Net 15 Days</option>
                <option value="NET_30">Net 30 Days (Standard B2B)</option>
                <option value="NET_60">Net 60 Days (Enterprise Volume)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
