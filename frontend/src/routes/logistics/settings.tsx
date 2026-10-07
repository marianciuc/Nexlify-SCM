import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { Settings, Save, ShieldCheck, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { FormFieldSelect, FormFieldNumber } from '@/components/forms/common';
import { KycSubmissionModal } from '@/components/kyc/KycSubmissionModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useTenantListQuery, useKycApplicationsQuery } from '@/hooks/useScmQueries';

export const Route = createFileRoute('/logistics/settings')({
  component: LogisticsSettingsPage,
  staticData: {
    crumb: {
      label: 'TMS Settings',
    },
  },
});

const logisticsSettingsSchema = z.object({
  graphHopperProfile: z.string().min(1, 'Profile is required'),
  maxDriveHours: z.number().min(1, 'Must be at least 1 hour').max(24, 'Cannot exceed 24 hours'),
  fuelPricePln: z.number().positive('Fuel price must be positive'),
  co2Factor: z.number().positive('CO2 factor must be positive'),
});

type LogisticsSettingsFormData = z.infer<typeof logisticsSettingsSchema>;

const profileOptions = [
  {
    value: 'truck_heavy_40t',
    label: 'truck_heavy_40t (Bridge heights > 4.0m, Weight < 40t)',
  },
  {
    value: 'delivery_van_3_5t',
    label: 'delivery_van_3_5t (Urban streets allowed, No toll roads)',
  },
];

function LogisticsSettingsPage() {
  const { data: tenants = [] } = useTenantListQuery();
  const { data: kycApps = [] } = useKycApplicationsQuery();

  const currentCarrier = tenants.find((t) => t.role === 'LOGISTICS_CARRIER') || tenants[4];
  const currentKyc = kycApps.find(
    (app) => (currentCarrier && app.nip === currentCarrier.nip) || (currentCarrier && app.tenantId === currentCarrier.id)
  );

  const kycStatus = currentCarrier?.kycStatus || currentKyc?.status || 'PENDING_AUDIT';

  const form = useForm<LogisticsSettingsFormData>({
    resolver: zodResolver(logisticsSettingsSchema),
    defaultValues: {
      graphHopperProfile: 'truck_heavy_40t',
      maxDriveHours: 9,
      fuelPricePln: 6.45,
      co2Factor: 2.68,
    },
  });

  const onSubmit = (_data: LogisticsSettingsFormData) => {
    toast.success('Параметры маршрутизации и автопарка успешно обновлены!');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings className="h-6 w-6 text-amber-500" />
          TMS Fleet & Routing Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure vehicle physical constraints, GLEC emissions coefficients, and dynamic fuel costing for route optimization.
        </p>
      </div>

      {/* Carrier Compliance & KYC Card */}
      {kycStatus === 'VERIFIED' ? (
        <Card className="border-emerald-200 bg-emerald-50/30 dark:bg-emerald-950/15 shadow-xs">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-7 w-7 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>{currentCarrier?.name || 'Vistula Trans Sp. z o.o.'}</span>
                  <Badge className="bg-emerald-600 text-white text-2xs">Licencja Transportowa GITD: Aktywna</Badge>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Biała Lista VAT oraz licencja na międzynarodowy transport drogowy rzeczy zweryfikowana. Uprawniony do obsługi e-CMR.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 shadow-xs">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Clock className="h-7 w-7 text-amber-600 shrink-0 animate-spin" />
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>{currentCarrier?.name || 'Vistula Trans Sp. z o.o.'}</span>
                  <Badge className="bg-amber-600 text-white text-2xs">Weryfikacja Licencji w Toku</Badge>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Wniosek o autoryzację przewoźnika i rejestrację rachunku MPP oczekuje na akceptację przez Compliance.
                </div>
              </div>
            </div>

            <KycSubmissionModal
              initialValues={{
                companyName: currentCarrier?.name,
                nip: currentCarrier?.nip,
                role: 'LOGISTICS_CARRIER',
              }}
              triggerButton={
                <Button variant="outline" size="sm" className="w-full sm:w-auto border-amber-300">
                  Uzupełnij dokumenty licencji
                </Button>
              }
            />
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Vehicle Routing Engine Profiles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFieldSelect
                  control={form.control}
                  name="graphHopperProfile"
                  label="Vehicle Constraint Profile:"
                  options={profileOptions}
                  className="font-mono"
                />

                <FormFieldNumber
                  control={form.control}
                  name="maxDriveHours"
                  label="Max Continuous Driving Shift (Hours):"
                  min={1}
                  max={24}
                  className="font-bold"
                />

                <FormFieldNumber
                  control={form.control}
                  name="fuelPricePln"
                  label="Base Diesel Price (PLN / Liter):"
                  step={0.01}
                  min={0.01}
                  className="font-bold"
                />

                <FormFieldNumber
                  control={form.control}
                  name="co2Factor"
                  label="GLEC CO2 Emission Factor (kg CO2 / L):"
                  step={0.01}
                  min={0.01}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="sm" className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white gap-2 font-semibold">
              <Save className="h-4 w-4" /> Save TMS Configuration
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default LogisticsSettingsPage;
