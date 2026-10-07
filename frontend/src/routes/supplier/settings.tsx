import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { Building2, Key, ShieldCheck, Save, Clock } from 'lucide-react';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { FormFieldInput } from '@/components/forms/common';
import { KycSubmissionModal } from '@/components/kyc/KycSubmissionModal';
import { PageHeader } from '@/components/page-header';
import { StatusBadge, type StatusTone } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useLocale } from '@/hooks/useLocale';
import { useTenantListQuery, useKycApplicationsQuery } from '@/hooks/useScmQueries';

export const Route = createFileRoute('/supplier/settings')({
  component: SupplierSettingsPage,
  staticData: {
    crumb: {
      label: 'nav.supplier.settings',
    },
  },
});

const KYC_TONE: Record<'VERIFIED' | 'PENDING_AUDIT' | 'REJECTED' | 'NOT_SUBMITTED', StatusTone> = {
  VERIFIED: 'success',
  PENDING_AUDIT: 'warning',
  REJECTED: 'danger',
  NOT_SUBMITTED: 'neutral',
};

function SupplierSettingsPage() {
  return <SupplierSettingsContent />;
}

function SupplierSettingsContent() {
  const { t } = useLocale();
  const { data: tenants = [] } = useTenantListQuery();
  const { data: kycApps = [] } = useKycApplicationsQuery();

  const currentSupplier = tenants.find((t) => t.role === 'SUPPLIER') || tenants[1];
  const currentKyc = kycApps.find(
    (app) =>
      (currentSupplier && app.nip === currentSupplier.nip) ||
      (currentSupplier && app.tenantId === currentSupplier.id)
  );

  const kycStatus = currentSupplier?.kycStatus || currentKyc?.status || 'VERIFIED';

  // Validation messages are user-visible — rebuild schema with the active locale.
  const supplierSettingsSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, t('supplier.settings.form.validation.nameRequired')),
        nip: z.string().min(10, t('supplier.settings.form.validation.nipRequired')),
        iban: z.string().min(15, t('supplier.settings.form.validation.ibanRequired')),
      }),
    [t]
  );

  type SupplierSettingsFormData = z.infer<typeof supplierSettingsSchema>;

  const form = useForm<SupplierSettingsFormData>({
    resolver: zodResolver(supplierSettingsSchema),
    defaultValues: {
      name: currentSupplier?.name || 'Drewnex Palety & Packaging Sp. z o.o.',
      nip: currentSupplier?.nip || '7822910483',
      iban: currentSupplier?.iban || 'PL 49 1020 2892 0000 4802 0192 4819',
    },
  });

  const onSubmit = (_data: SupplierSettingsFormData) => {
    toast.success(t('supplier.settings.form.saved'));
  };

  const apiKey = 'nex_live_sec_8914810294810928419';

  return (
    <div className="space-y-6 max-w-3xl mx-auto min-w-0">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
            {t('supplier.settings.title')}
          </span>
        }
        subtitle={t('supplier.settings.subtitle')}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {kycStatus === 'VERIFIED' && (
            <Card className="border-primary/30 bg-primary/5 shadow-xs">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck
                    className="h-8 w-8 text-primary shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <div className="font-bold text-sm text-foreground flex items-center gap-2">
                      <span>{t('supplier.settings.kyc.verifiedTitle')}</span>
                      <StatusBadge
                        tone={KYC_TONE[kycStatus as keyof typeof KYC_TONE] ?? 'success'}
                        label={t('supplier.settings.kyc.verifiedBadge')}
                        size="sm"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {t('supplier.settings.kyc.verifiedDescription')}
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
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 font-medium"
                    >
                      {t('supplier.settings.kyc.updateCta')}
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          )}

          {kycStatus === 'PENDING_AUDIT' && (
            <Card className="border-amber-300 bg-amber-500/5 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Clock
                    className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-foreground">
                      {t('supplier.settings.kyc.pendingTitle')}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {t('supplier.settings.kyc.pendingDescription')}
                    </p>
                  </div>
                </div>
                <StatusBadge
                  tone="warning"
                  label={t('supplier.settings.kyc.pendingBadge')}
                  size="sm"
                />
              </CardContent>
            </Card>
          )}

          <Card className="border-border shadow-xs bg-card">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <span className="block text-sm font-semibold text-foreground">
                {t('supplier.settings.form.sectionTitle')}
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFieldInput
                  control={form.control}
                  name="name"
                  label={t('supplier.settings.form.name')}
                  className="font-medium"
                />
                <FormFieldInput
                  control={form.control}
                  name="nip"
                  label={t('supplier.settings.form.nip')}
                  className="font-mono font-bold"
                />
                <FormFieldInput
                  control={form.control}
                  name="iban"
                  label={t('supplier.settings.form.iban')}
                  containerClassName="md:col-span-2"
                  className="font-mono font-bold"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-xs bg-card">
            <CardContent className="p-4 sm:p-6 space-y-2">
              <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Key className="h-4 w-4 text-primary" aria-hidden="true" />
                {t('supplier.settings.api.title')}
              </span>
              <Input
                value={apiKey}
                readOnly
                aria-label={t('supplier.settings.api.title')}
                className="font-mono text-xs bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">
                {t('supplier.settings.api.helper')}
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              className="gap-1.5 w-full sm:w-auto font-semibold shadow-xs"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {t('supplier.settings.form.save')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default SupplierSettingsPage;