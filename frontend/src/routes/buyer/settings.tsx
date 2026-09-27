import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Building2,
  MapPin,
  CreditCard,
  Bell,
  ShieldCheck,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/buyer/settings')({
  component: BuyerSettingsPage,
  staticData: {
    crumb: {
      label: 'Buyer Settings',
    },
  },
});

function BuyerSettingsPage() {
  const [companyName, setCompanyName] = useState('Baltic Retail Group Sp. z o.o.');
  const [nip, setNip] = useState('8522619472');
  const [krs, setKrs] = useState('0000819240');
  const [city, setCity] = useState('Warszawa');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [wsNotifications, setWsNotifications] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Organization settings and delivery parameters updated successfully!');
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Building2 className="h-6 w-6 text-emerald-600" />
          Buyer Company Profile & Facility Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your verified Polish NIP entity, B2B Trade Credit facilities, and logistics delivery docks.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Verification Status Card */}
        <Card className="border-emerald-200 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Verified B2B Tenant Status</span>
                  <Badge className="bg-emerald-600 text-white text-2xs">KYC Approved</Badge>
                </div>
                <div className="text-xs text-slate-500">
                  REGON & VIES EU Cross-Border VAT validated by platform administrator.
                </div>
              </div>
            </div>

            <div className="text-right text-xs">
              <span className="text-slate-500 block">Trade Credit Line:</span>
              <span className="font-mono font-bold text-emerald-600 text-sm">150,000 PLN (Net 30)</span>
            </div>
          </CardContent>
        </Card>

        {/* Legal Identity Form */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Legal Identity & Tax Credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cname" className="text-xs">
                  Company Legal Name:
                </Label>
                <Input
                  id="cname"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="text-xs font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cnip" className="text-xs">
                  Tax Identification Number (NIP):
                </Label>
                <Input
                  id="cnip"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  className="text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ckrs" className="text-xs">
                  KRS Number:
                </Label>
                <Input
                  id="ckrs"
                  value={krs}
                  onChange={(e) => setKrs(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ccity" className="text-xs">
                  Registered Headquarters City:
                </Label>
                <Input
                  id="ccity"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4 text-emerald-600" /> Dispatch & Freight Alerting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  Real-time WebSockets Live Tracking Alerts
                </div>
                <div className="text-2xs text-slate-500">
                  Receive live alerts when truck enters delivery geofence (&lt;10km from dock).
                </div>
              </div>
              <input
                type="checkbox"
                checked={wsNotifications}
                onChange={(e) => setWsNotifications(e.target.checked)}
                className="h-4 w-4 text-emerald-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  Automated Faktura VAT & e-CMR Electronic Dispatch
                </div>
                <div className="text-2xs text-slate-500">
                  Send PDF invoices directly to corporate accounting upon dispatch.
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="h-4 w-4 text-emerald-600 rounded"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-xs font-semibold">
            <Save className="h-4 w-4" /> Save Profile Preferences
          </Button>
        </div>
      </form>
    </div>
  );
}
