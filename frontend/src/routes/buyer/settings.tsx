import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { Building2, Save } from 'lucide-react';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { FormFieldCheckbox, FormFieldInput } from '@/components/forms/common';
import { KycSubmissionModal } from '@/components/kyc/KycSubmissionModal';
import { MoneyDisplay } from '@/components/money-display';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useLocale } from '@/hooks/useLocale';
import { useKycApplicationsQuery, useTenantListQuery } from '@/hooks/useScmQueries';

export const Route = createFileRoute('/buyer/settings')({
  component: BuyerSettingsPage,
  staticData: {
    crumb: {
      label: 'nav.buyer.settings',
    },
  },
});

type BuyerSettingsFormData = {
  companyName: string;
  nip: string;
  krs: string;
  city: string;
  wsNotifications: boolean;
  emailNotifications: boolean;
};

function BuyerSettingsPage() {
  const { t } = useLocale();
  const { data: tenants = [] } = useTenantListQuery();
  const { data: kycApps = [] } = useKycApplicationsQuery();

  // Active buyer tenant (default: ten-01 Baltic Retail Group)
  const currentBuyer = tenants.find((tn) => tn.role === 'BUYER') || tenants[0];
  const currentKyc = kycApps.find(
    (app) =>
      (currentBuyer && app.nip === currentBuyer.nip) ||
      (currentBuyer && app.tenantId === currentBuyer.id)
  );

  const kycStatus = currentBuyer?.kycStatus || currentKyc?.status || 'VERIFIED';
  const tradeCreditLimit = currentBuyer?.tradeCreditLimitPln ?? 150000;
  const paymentTerms = currentBuyer?.paymentTerms ?? 'NET_30';

  // Validation messages are user-visible, so the schema is rebuilt with the active locale.
  const buyerSettingsSchema = useMemo(
    () =>
      z.object({
        companyName: z.string().min(1, t('buyer.settings.validation.companyName')),
        nip: z.string().min(10, t('buyer.settings.validation.nip')),
        krs: z.string().min(1, t('buyer.settings.validation.krs')),
        city: z.string().min(1, t('buyer.settings.validation.city')),
        wsNotifications: z.boolean(),
        emailNotifications: z.boolean(),
      }),
    [t]
  );

  const form = useForm<BuyerSettingsFormData>({
    resolver: zodResolver(buyerSettingsSchema),
    defaultValues: {
      companyName: currentBuyer?.name || 'Baltic Retail Group Sp. z o.o.',
      nip: currentBuyer?.nip || '8522619472',
      krs: currentBuyer?.krs || '0000839211',
      city: 'Szczecin',
      wsNotifications: true,
      emailNotifications: true,
    },
  });

  const onSubmit = (_data: BuyerSettingsFormData) => {
    toast.success(t('buyer.settings.savedToast'));
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto min-w-0">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
            {t('buyer.settings.title')}
          </span>
        }
        subtitle={t('buyer.settings.subtitle')}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* KYC & compliance status */}
          {kycStatus === 'VERIFIED' && (
            <Card className="border-border bg-card shadow-xs">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <StatusBadge tone="success" label={t('buyer.settings.kyc.verified')} size="md" />
                  <p className="text-xs text-muted-foreground">
                    {t('buyer.settings.kyc.verifiedDesc', { nip: currentBuyer?.nip || '—' })}
                  </p>
                </div>

                <div className="flex items-center gap-3 sm:border-l sm:border-border sm:pl-4 shrink-0">
                  <div className="text-right text-xs">
                    <span className="text-muted-foreground block">
                      {t('buyer.settings.kyc.creditLimit')}
                    </span>
                    <span className="text-sm text-foreground">
                      <MoneyDisplay amount={tradeCreditLimit} variant="inline" emphasize />{' '}
                      <span className="font-mono">({paymentTerms})</span>
                    </span>
                  </div>

                  <KycSubmissionModal
                    initialValues={{
                      companyName: currentBuyer?.name,
                      nip: currentBuyer?.nip,
                      krs: currentBuyer?.krs,
                      role: 'BUYER',
                      requestedCreditLimitPln: tradeCreditLimit + 50000,
                    }}
                    triggerButton={
                      <Button type="button" variant="outline" size="sm" className="font-medium">
                        {t('buyer.settings.kyc.requestIncrease')}
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {kycStatus === 'PENDING_AUDIT' && (
            <Card className="border-border bg-card shadow-xs">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <StatusBadge tone="warning" label={t('buyer.settings.kyc.pending')} size="md" />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-foreground">
                      {t('buyer.settings.kyc.pendingTitle')}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t('buyer.settings.kyc.pendingDesc')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {kycStatus === 'REJECTED' && (
            <Card className="border-border bg-card shadow-xs">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <StatusBadge tone="danger" label={t('buyer.settings.kyc.rejected')} size="md" />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-foreground">
                      {t('buyer.settings.kyc.rejectedTitle')}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t('buyer.settings.kyc.rejectedReason', {
                        reason:
                          currentKyc?.rejectionReason || t('buyer.settings.kyc.rejectedDefault'),
                      })}
                    </p>
                  </div>
                </div>

                <KycSubmissionModal
                  initialValues={{
                    companyName: currentBuyer?.name,
                    nip: currentBuyer?.nip,
                    krs: currentBuyer?.krs,
                    role: 'BUYER',
                  }}
                  triggerButton={
                    <Button type="button" size="sm" variant="destructive" className="font-medium">
                      {t('buyer.settings.kyc.resubmit')}
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          )}

          {/* Legal identity form */}
          <Card className="border-border bg-card shadow-xs">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <span className="text-sm font-semibold text-foreground block">
                {t('buyer.settings.identityTitle')}
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFieldInput
                  control={form.control}
                  name="companyName"
                  label={t('buyer.settings.companyName')}
                  className="font-medium"
                />
                <FormFieldInput
                  control={form.control}
                  name="nip"
                  label={t('buyer.settings.nip')}
                  className="font-mono font-bold"
                  dir="ltr"
                />
                <FormFieldInput
                  control={form.control}
                  name="krs"
                  label={t('buyer.settings.krs')}
                  className="font-mono"
                  dir="ltr"
                />
                <FormFieldInput
                  control={form.control}
                  name="city"
                  label={t('buyer.settings.city')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification preferences */}
          <Card className="border-border bg-card shadow-xs">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <span className="text-sm font-semibold text-foreground block">
                {t('buyer.settings.notificationsTitle')}
              </span>
              <div className="rounded-md border border-border p-3 space-y-3">
                <FormFieldCheckbox
                  control={form.control}
                  name="wsNotifications"
                  label={t('buyer.settings.wsLabel')}
                  description={t('buyer.settings.wsDesc')}
                />
                <FormFieldCheckbox
                  control={form.control}
                  name="emailNotifications"
                  label={t('buyer.settings.emailLabel')}
                  description={t('buyer.settings.emailDesc')}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="sm" className="gap-2 font-medium w-full sm:w-auto">
              <Save className="h-4 w-4" aria-hidden="true" />
              {t('buyer.settings.save')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default BuyerSettingsPage;
