import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { Settings, Save, ShieldCheck, Clock } from 'lucide-react';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { FormFieldSelect, FormFieldNumber } from '@/components/forms/common';
import { KycSubmissionModal } from '@/components/kyc/KycSubmissionModal';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useLocale } from '@/hooks/useLocale';
import { useTenantListQuery } from '@/hooks/useScmQueries';
import { type TranslationPath } from '@/types/generated-locale';

export const Route = createFileRoute('/logistics/settings')({
  component: LogisticsSettingsPage,
  staticData: {
    crumb: {
      label: 'nav.logistics.settings',
    },
  },
});

type ProfileOption = 'truck_heavy_40t' | 'delivery_van_3_5t';

const PROFILE_OPTIONS: { value: ProfileOption; labelKey: TranslationPath }[] = [
  { value: 'truck_heavy_40t', labelKey: 'logistics.settings.profile.heavy' },
  { value: 'delivery_van_3_5t', labelKey: 'logistics.settings.profile.van' },
];

type KycStatus = 'VERIFIED' | 'PENDING_AUDIT';

const KYC_TONE: Record<KycStatus, 'success' | 'warning'> = {
  VERIFIED: 'success',
  PENDING_AUDIT: 'warning',
};

const KYC_LABEL_KEY: Record<KycStatus, TranslationPath> = {
  VERIFIED: 'logistics.settings.kyc.verified',
  PENDING_AUDIT: 'logistics.settings.kyc.pending',
};

function LogisticsSettingsPage() {
  return <LogisticsSettingsContent />;
}

function LogisticsSettingsContent() {
  const { t } = useLocale();
  const { data: tenants = [] } = useTenantListQuery();

  const currentCarrier = tenants.find((t) => t.role === 'LOGISTICS_CARRIER') || tenants[4];

  const kycStatus: KycStatus = currentCarrier?.kycStatus === 'VERIFIED' ? 'VERIFIED' : 'PENDING_AUDIT';

  const logisticsSettingsSchema = useMemo(
    () =>
      z.object({
        graphHopperProfile: z.enum(['truck_heavy_40t', 'delivery_van_3_5t'] as const),
        maxDriveHours: z.number().min(1, t('logistics.settings.validation.driveHoursMin')).max(24, t('logistics.settings.validation.driveHoursMax')),
        fuelPricePln: z.number().positive(t('logistics.settings.validation.fuelPricePositive')),
        co2Factor: z.number().positive(t('logistics.settings.validation.co2Positive')),
      }),
    [t]
  );

  type LogisticsSettingsFormData = z.infer<typeof logisticsSettingsSchema>;

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
    toast.success(t('logistics.settings.savedToast'));
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto min-w-0">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" aria-hidden="true" />
            {t('logistics.settings.title')}
          </span>
        }
        subtitle={t('logistics.settings.subtitle')}
      />

      {/* Carrier Compliance & KYC Card */}
      <Card className="border-border shadow-xs bg-card">
        <CardContent className="p-4 sm:p-6 space-y-3">
          <div className="flex items-start gap-3">
            {kycStatus === 'VERIFIED' ? (
              <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0" aria-hidden="true" />
            ) : (
              <Clock className="h-6 w-6 text-amber-600 shrink-0" aria-hidden="true" />
            )}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-foreground">
                  {currentCarrier?.name || t('logistics.settings.kyc.fallbackCarrier')}
                </span>
                <StatusBadge tone={KYC_TONE[kycStatus]} label={t(KYC_LABEL_KEY[kycStatus])} size="sm" />
              </div>
              <p className="text-xs text-muted-foreground">
                {kycStatus === 'VERIFIED'
                  ? t('logistics.settings.kyc.verifiedBody')
                  : t('logistics.settings.kyc.pendingBody')}
              </p>
            </div>
            {kycStatus !== 'VERIFIED' && (
              <KycSubmissionModal
                initialValues={{
                  companyName: currentCarrier?.name,
                  nip: currentCarrier?.nip,
                  role: 'LOGISTICS_CARRIER',
                }}
                triggerButton={
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    {t('logistics.settings.kyc.submitLicense')}
                  </Button>
                }
              />
            )}
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-border shadow-xs bg-card">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <span className="text-sm font-semibold text-foreground block">
                {t('logistics.settings.routingTitle')}
              </span>
              <p className="text-xs text-muted-foreground -mt-2">
                {t('logistics.settings.routingDescription')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormFieldSelect
                  control={form.control}
                  name="graphHopperProfile"
                  label={t('logistics.settings.profileLabel')}
                  options={PROFILE_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
                  className="font-mono"
                />

                <FormFieldNumber
                  control={form.control}
                  name="maxDriveHours"
                  label={t('logistics.settings.maxDriveHoursLabel')}
                  min={1}
                  max={24}
                  className="font-bold"
                />

                <FormFieldNumber
                  control={form.control}
                  name="fuelPricePln"
                  label={t('logistics.settings.fuelPriceLabel')}
                  step={0.01}
                  min={0.01}
                  className="font-bold"
                />

                <FormFieldNumber
                  control={form.control}
                  name="co2Factor"
                  label={t('logistics.settings.co2FactorLabel')}
                  step={0.01}
                  min={0.01}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="sm" className="gap-1.5 w-full sm:w-auto font-medium">
              <Save className="h-4 w-4" aria-hidden="true" />
              {t('logistics.settings.save')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default LogisticsSettingsPage;