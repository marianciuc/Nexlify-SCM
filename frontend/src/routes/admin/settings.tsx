import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { Check, Save, Settings } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { FormFieldCheckbox, FormFieldInput } from '@/components/forms/common';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useLocale } from '@/hooks/useLocale';
import {
  useEnvironmentStore,
  AVAILABLE_ENVIRONMENTS,
  type EnvironmentType,
} from '@/service/env/environment-store';
import { type TranslationPath } from '@/types/generated-locale';

export const Route = createFileRoute('/admin/settings')({
  component: AdminPlatformSettingsPage,
  staticData: {
    crumb: {
      label: 'nav.admin.settings',
    },
  },
});

const ENV_LABEL_KEY: Record<EnvironmentType, TranslationPath> = {
  development: 'admin.settings.env.development',
  staging: 'admin.settings.env.staging',
  production: 'admin.settings.env.production',
  custom: 'admin.settings.env.custom',
};

type AdminSettingsFormData = {
  selectedEnv: EnvironmentType;
  gatewayUrl: string;
  keycloakUrl: string;
  mockEnabled: boolean;
};

function AdminPlatformSettingsPage() {
  const { t } = useLocale();
  const {
    currentEnvironment,
    customUrl,
    customKeycloakUrl,
    isMockMode,
    setManualConfig,
  } = useEnvironmentStore();

  // Validation messages are user-visible, so the schema is rebuilt with the active locale.
  const adminSettingsSchema = useMemo(
    () =>
      z.object({
        selectedEnv: z.enum(['development', 'staging', 'production', 'custom'] as const),
        gatewayUrl: z.string().min(1, t('admin.settings.gatewayRequired')),
        keycloakUrl: z.string().min(1, t('admin.settings.keycloakRequired')),
        mockEnabled: z.boolean(),
      }),
    [t]
  );

  const form = useForm<AdminSettingsFormData>({
    resolver: zodResolver(adminSettingsSchema),
    defaultValues: {
      selectedEnv: currentEnvironment,
      gatewayUrl: customUrl,
      keycloakUrl: customKeycloakUrl,
      mockEnabled: isMockMode,
    },
  });

  const selectedEnv = form.watch('selectedEnv') || currentEnvironment;

  useEffect(() => {
    form.reset({
      selectedEnv: currentEnvironment,
      gatewayUrl: customUrl,
      keycloakUrl: customKeycloakUrl,
      mockEnabled: isMockMode,
    });
  }, [currentEnvironment, customUrl, customKeycloakUrl, isMockMode, form]);

  const onSubmit = (data: AdminSettingsFormData) => {
    setManualConfig({
      env: data.selectedEnv,
      customUrl: data.gatewayUrl,
      customKeycloakUrl: data.keycloakUrl,
      isMockMode: data.mockEnabled,
    });
    toast.success(t('admin.settings.savedToast'));
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto min-w-0">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" aria-hidden="true" />
            {t('admin.settings.title')}
          </span>
        }
        subtitle={t('admin.settings.subtitle')}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Active environment — drives gateway + SSO endpoint resolution */}
          <Card className="border-border shadow-xs bg-card">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">{t('admin.settings.envTitle')}</span>
                <Badge variant="outline" className="text-[10px] font-mono font-semibold">
                  {selectedEnv.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{t('admin.settings.envDescription')}</p>
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                role="group"
                aria-label={t('admin.settings.envGroupAria')}
              >
                {(Object.keys(AVAILABLE_ENVIRONMENTS) as EnvironmentType[]).map((envKey) => {
                  const env = AVAILABLE_ENVIRONMENTS[envKey];
                  const isSelected = selectedEnv === envKey;
                  return (
                    <button
                      key={envKey}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => {
                        form.setValue('selectedEnv', envKey);
                        if (envKey !== 'custom') {
                          form.setValue('gatewayUrl', env.url);
                        }
                      }}
                      className={`p-3 rounded-lg border text-left transition-colors flex flex-col gap-1 cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border bg-card hover:bg-muted/50'
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2 w-full">
                        <span className="text-xs font-semibold text-foreground">{t(ENV_LABEL_KEY[envKey])}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground truncate" dir="ltr">
                        {env.url}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Connectivity endpoints + runtime modes */}
          <Card className="border-border shadow-xs bg-card">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <span className="text-sm font-semibold text-foreground block">
                {t('admin.settings.endpointsTitle')}
              </span>
              <FormFieldInput
                control={form.control}
                name="gatewayUrl"
                label={t('admin.settings.gatewayLabel')}
                description={selectedEnv !== 'custom' ? t('admin.settings.presetHint') : undefined}
                onChange={(e) => {
                  form.setValue('gatewayUrl', e.target.value);
                  form.setValue('selectedEnv', 'custom');
                }}
                className="font-mono"
                dir="ltr"
              />

              <FormFieldInput
                control={form.control}
                name="keycloakUrl"
                label={t('admin.settings.keycloakLabel')}
                description={selectedEnv !== 'custom' ? t('admin.settings.presetHint') : undefined}
                className="font-mono"
                dir="ltr"
              />

              <div className="rounded-md border border-border p-3 space-y-2">
                <span className="block text-xs font-semibold text-foreground px-2">
                  {t('admin.settings.modesTitle')}
                </span>
                <FormFieldCheckbox
                  control={form.control}
                  name="mockEnabled"
                  label={t('admin.settings.mockLabel')}
                  description={t('admin.settings.mockDescription')}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="sm" className="gap-1.5 w-full sm:w-auto font-medium">
              <Save className="h-4 w-4" aria-hidden="true" />
              {t('admin.settings.save')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default AdminPlatformSettingsPage;
