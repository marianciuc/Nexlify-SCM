import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { Building2, ShieldCheck, Save, Bell, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { FormFieldInput, FormFieldCheckbox } from '@/components/forms/common';
import { KycSubmissionModal } from '@/components/kyc/KycSubmissionModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import {
  useTenantListQuery,
  useKycApplicationsQuery,
} from '@/hooks/useScmQueries';

export const Route = createFileRoute('/buyer/settings')({
  component: BuyerSettingsPage,
  staticData: {
    crumb: {
      label: 'Buyer Settings',
    },
  },
});

const buyerSettingsSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  nip: z.string().min(10, 'Valid 10-digit NIP is required'),
  krs: z.string().min(1, 'KRS number is required'),
  city: z.string().min(1, 'City is required'),
  wsNotifications: z.boolean(),
  emailNotifications: z.boolean(),
});

type BuyerSettingsFormData = z.infer<typeof buyerSettingsSchema>;

function BuyerSettingsPage() {
  const { data: tenants = [] } = useTenantListQuery();
  const { data: kycApps = [] } = useKycApplicationsQuery();

  // Active buyer tenant (default: ten-01 Baltic Retail Group)
  const currentBuyer = tenants.find((t) => t.role === 'BUYER') || tenants[0];
  const currentKyc = kycApps.find(
    (app) => (currentBuyer && app.nip === currentBuyer.nip) || (currentBuyer && app.tenantId === currentBuyer.id)
  );

  const kycStatus = currentBuyer?.kycStatus || currentKyc?.status || 'VERIFIED';
  const tradeCreditLimit = currentBuyer?.tradeCreditLimitPln ?? 150000;
  const paymentTerms = currentBuyer?.paymentTerms ?? 'NET_30';

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
    toast.success('Настройки организации и параметры доставки успешно сохранены!');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto min-w-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          Профиль организации и параметры доставки
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Управление проверенным юрлицом (NIP), кредитным лимитом B2B и логистическими терминалами.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* KYC & Compliance Status Banner / Card */}
          {kycStatus === 'VERIFIED' && (
            <Card className="border-emerald-500/20 bg-emerald-500/5 shadow-xs">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold text-sm text-foreground flex items-center gap-2">
                      <span>Верифицированное юрлицо B2B</span>
                      <Badge className="bg-emerald-600 text-white text-2xs">Biała Lista VAT: Активен</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      NIP {currentBuyer?.nip} верифицирован в реестре Минфина и GUS / REGON. Поддержка Split Payment (MPP) активна.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:border-l sm:border-border sm:pl-4">
                  <div className="text-right text-xs">
                    <span className="text-muted-foreground block">Активный лимит:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {tradeCreditLimit.toLocaleString()} PLN ({paymentTerms})
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
                      <Button type="button" variant="outline" size="sm" className="text-2xs h-8 border-emerald-500/30">
                        Запросить повышение лимита
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {kycStatus === 'PENDING_AUDIT' && (
            <Card className="border-amber-500/30 bg-amber-500/5 shadow-xs">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Clock className="h-5 w-5 text-amber-500" />
                    <div>
                      <h3 className="font-bold text-sm text-foreground">
                        Заявка KYC на аудите комплаенс
                      </h3>
                      <p className="text-2xs text-muted-foreground">
                        Регистрационные данные поданы и ожидают решения комплаенс-офицера платформы.
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 text-2xs">Ожидает аудит</Badge>
                </div>

                {/* Progress Pipeline */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 text-2xs">
                  <div className="p-2 rounded bg-card border border-border flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="font-medium text-foreground">1. Подача заявки</span>
                  </div>
                  <div className="p-2 rounded bg-card border border-border flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="font-medium text-foreground">2. База MF / GUS</span>
                  </div>
                  <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-bold">
                    <Clock className="h-4 w-4 text-amber-500 shrink-0 animate-spin" />
                    <span>3. Аудит комплаенс</span>
                  </div>
                  <div className="p-2 rounded bg-muted/40 border border-border text-muted-foreground flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full border border-border" />
                    <span>4. Активация Net-30</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {kycStatus === 'REJECTED' && (
            <Card className="border-rose-500/30 bg-rose-500/5 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <XCircle className="h-6 w-6 text-rose-500 shrink-0" />
                  <div>
                    <h3 className="font-bold text-sm text-foreground">
                      Верификация KYC требует уточнения данных
                    </h3>
                    <p className="text-2xs text-muted-foreground">
                      Причина: {currentKyc?.rejectionReason || 'Несоответствие банковского счета Белому списку Минфина.'}
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
                    <Button type="button" size="sm" variant="destructive" className="text-xs">
                      Подать исправленное досье
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          )}

          {/* Legal Identity Form */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Юридические реквизиты и налоговые данные</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFieldInput
                  control={form.control}
                  name="companyName"
                  label="Юридическое наименование компании:"
                  className="font-medium"
                />
                <FormFieldInput
                  control={form.control}
                  name="nip"
                  label="Налоговый номер (NIP):"
                  className="font-mono font-bold"
                />
                <FormFieldInput
                  control={form.control}
                  name="krs"
                  label="Номер в судебном реестре (KRS):"
                  className="font-mono"
                />
                <FormFieldInput
                  control={form.control}
                  name="city"
                  label="Город юридической регистрации:"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" /> Уведомления об отгрузках и логистике
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-3 rounded-lg border border-border bg-card">
                <FormFieldCheckbox
                  control={form.control}
                  name="wsNotifications"
                  label="Онлайн-уведомления трекинга через WebSockets"
                  description="Оповещение в реальном времени при приближении автопоезда к терминалу разгрузки (<10 км)."
                  className="text-primary"
                />
              </div>

              <div className="p-3 rounded-lg border border-border bg-card">
                <FormFieldCheckbox
                  control={form.control}
                  name="emailNotifications"
                  label="Автоматическая отправка фактур VAT и e-CMR"
                  description="Электронная рассылка фактур и накладных в бухгалтерию сразу после отправки."
                  className="text-primary"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="sm" className="gap-2 font-medium w-full sm:w-auto">
              <Save className="h-4 w-4" /> Сохранить настройки профиля
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default BuyerSettingsPage;
