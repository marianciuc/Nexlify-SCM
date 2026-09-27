import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Building2,
  Warehouse,
  CreditCard,
  Key,
  ShieldCheck,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/supplier/settings')({
  component: SupplierSettingsPage,
  staticData: {
    crumb: {
      label: 'Supplier Settings',
    },
  },
});

function SupplierSettingsPage() {
  const [name, setName] = useState('Drewnex Palety & Packaging Sp. z o.o.');
  const [nip, setNip] = useState('7822910483');
  const [iban, setIban] = useState('PL 49 1020 2892 0000 4802 0192 4819');
  const [apiKey] = useState('nex_live_sec_8914810294810928419');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Supplier profile, warehouse parameters and banking credentials updated!');
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Building2 className="h-6 w-6 text-amber-600" />
          Supplier Organization & WMS Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage manufacturer credentials, multi-hub warehouse facilities, and Polish MPP Split Payment bank accounts.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Verification Status Card */}
        <Card className="border-amber-200 bg-amber-50/20 dark:bg-amber-950/10 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-amber-600" />
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Verified Supplier Organization</span>
                  <Badge className="bg-amber-600 text-white text-2xs">Gold Tier</Badge>
                </div>
                <div className="text-xs text-slate-500">
                  NIP & Polish Court KRS verified by system administration.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal & Banking Form */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Corporate Credentials & Split Payment Bank</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Supplier Legal Entity:</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="text-xs font-medium" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Tax ID (NIP):</Label>
                <Input value={nip} onChange={(e) => setNip(e.target.value)} className="text-xs font-mono font-bold" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs">Bank Account for Polish Split Payment (MPP):</Label>
                <Input value={iban} onChange={(e) => setIban(e.target.value)} className="text-xs font-mono font-bold" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Credentials */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Key className="h-4 w-4 text-amber-600" /> ERP Integration Webhook API Key
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <Input value={apiKey} readOnly className="font-mono text-xs bg-slate-50 dark:bg-slate-900" />
            <p className="text-2xs text-slate-500">
              Use this bearer key to connect SAP, Comarch ERP Optima, or Microsoft Dynamics via REST Webhooks.
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white gap-2 text-xs font-semibold">
            <Save className="h-4 w-4" /> Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
