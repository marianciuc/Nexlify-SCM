import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { Building2, Key, ShieldCheck, Save, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { FormFieldInput } from '@/components/forms/common';
import { KycSubmissionModal } from '@/components/kyc/KycSubmissionModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useTenantListQuery, useKycApplicationsQuery } from '@/hooks/useScmQueries';

export const Route = createFileRoute('/supplier/settings')({
  component: SupplierSettingsPage,
  staticData: {
    crumb: {
      label: 'Supplier Settings',
    },
  },
});

const supplierSettingsSchema = z.object({
  name: z.string().min(1, 'Supplier legal entity is required'),
  nip: z.string().min(10, 'Valid 10-digit NIP is required'),
  iban: z.string().min(15, 'Valid bank account number (IBAN) is required'),
});

type SupplierSettingsFormData = z.infer<typeof supplierSettingsSchema>;

function SupplierSettingsPage() {
  const { data: tenants = [] } = useTenantListQuery();
  const { data: kycApps = [] } = useKycApplicationsQuery();

  const currentSupplier = tenants.find((t) => t.role === 'SUPPLIER') || tenants[1];
  const currentKyc = kycApps.find(
    (app) => (currentSupplier && app.nip === currentSupplier.nip) || (currentSupplier && app.tenantId === currentSupplier.id)
  );

  const kycStatus = currentSupplier?.kycStatus || currentKyc?.status || 'VERIFIED';

  const form = useForm<SupplierSettingsFormData>({
    resolver: zodResolver(supplierSettingsSchema),
    defaultValues: {
      name: currentSupplier?.name || 'Drewnex Palety & Packaging Sp. z o.o.',
      nip: currentSupplier?.nip || '7822910483',
      iban: currentSupplier?.iban || 'PL 49 1020 2892 0000 4802 0192 4819',
    },
  });

  const onSubmit = (_data: SupplierSettingsFormData) => {
    toast.success('Supplier profile, warehouse parameters and banking credentials updated!');
  };

  const apiKey = 'nex_live_sec_8914810294810928419';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Verification Status Card */}
          {kycStatus === 'VERIFIED' && (
            <Card className="border-amber-200 bg-amber-50/20 dark:bg-amber-950/10 shadow-xs">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-8 w-8 text-amber-600 shrink-0" />
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span>Certyfikowany Dostawca B2B (Verified Supplier)</span>
                      <Badge className="bg-amber-600 text-white text-2xs">Biała Lista: Zgodny</Badge>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Rachunek bankowy do mechanizmu podzielonej płatności (MPP) zarejestrowany w wykazie Ministerstwa Finansów.
                    </div>
                  </div>
                </div>

                <KycSubmissionModal
                  initialValues={{
                    companyName: currentSupplier?.name,
                    nip: currentSupplier?.nip,
                    role: 'SUPPLIER',
                    iban: currentSupplier?.iban,
                  }}
                  triggerButton={
                    <Button type="button" variant="outline" size="sm" className="text-2xs h-8 border-amber-300">
                      Aktualizuj dane KYC / Certyfikaty
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          )}

          {kycStatus === 'PENDING_AUDIT' && (
            <Card className="border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-6 w-6 text-amber-600 shrink-0 animate-spin" />
                  <div>
                    <h3 className="font-bold text-sm text-amber-900 dark:text-amber-200">
                      Zgłoszenie dostawcy oczekuje na weryfikację
                    </h3>
                    <p className="text-2xs text-amber-700 dark:text-amber-400">
                      KRS i rachunek rozliczeniowy podlegają automatycznej kontroli w rejestrach MF i VIES.
                    </p>
                  </div>
                </div>
                <Badge className="bg-amber-600 text-white text-2xs">Audit In Progress</Badge>
              </CardContent>
            </Card>
          )}

          {/* Legal & Banking Form */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Corporate Credentials & Split Payment Bank</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFieldInput
                  control={form.control}
                  name="name"
                  label="Supplier Legal Entity:"
                  className="font-medium"
                />
                <FormFieldInput
                  control={form.control}
                  name="nip"
                  label="Tax ID (NIP):"
                  className="font-mono font-bold"
                />
                <FormFieldInput
                  control={form.control}
                  name="iban"
                  label="Bank Account for Polish Split Payment (MPP):"
                  containerClassName="md:col-span-2"
                  className="font-mono font-bold"
                />
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
            <Button type="submit" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white gap-2 font-semibold w-full sm:w-auto">
              <Save className="h-4 w-4" /> Save Configuration
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default SupplierSettingsPage;
