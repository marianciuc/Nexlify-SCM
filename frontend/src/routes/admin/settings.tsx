import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import {
  Settings,
  Server,
  Save,
  Sliders,
  Check,
} from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { FormFieldInput, FormFieldCheckbox } from '@/components/forms/common';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormLabel } from '@/components/ui/form';
import {
  useEnvironmentStore,
  AVAILABLE_ENVIRONMENTS,
  type EnvironmentType,
} from '@/service/env/environment-store';

export const Route = createFileRoute('/admin/settings')({
  component: AdminPlatformSettingsPage,
  staticData: {
    crumb: {
      label: 'Platform Settings',
    },
  },
});

const adminSettingsSchema = z.object({
  selectedEnv: z.enum(['development', 'staging', 'production', 'custom'] as const),
  gatewayUrl: z.string().min(1, 'Gateway URL is required'),
  keycloakUrl: z.string().min(1, 'SSO Provider URL is required'),
  mockEnabled: z.boolean(),
  maintenanceMode: z.boolean(),
});

type AdminSettingsFormData = z.infer<typeof adminSettingsSchema>;

function AdminPlatformSettingsPage() {
  const {
    currentEnvironment,
    customUrl,
    customKeycloakUrl,
    isMockMode,
    setManualConfig,
  } = useEnvironmentStore();

  const form = useForm<AdminSettingsFormData>({
    resolver: zodResolver(adminSettingsSchema),
    defaultValues: {
      selectedEnv: currentEnvironment,
      gatewayUrl: customUrl,
      keycloakUrl: customKeycloakUrl,
      mockEnabled: isMockMode,
      maintenanceMode: false,
    },
  });

  const selectedEnv = form.watch('selectedEnv') || currentEnvironment;

  useEffect(() => {
    form.reset({
      selectedEnv: currentEnvironment,
      gatewayUrl: customUrl,
      keycloakUrl: customKeycloakUrl,
      mockEnabled: isMockMode,
      maintenanceMode: false,
    });
  }, [currentEnvironment, customUrl, customKeycloakUrl, isMockMode, form]);

  const onSubmit = (data: AdminSettingsFormData) => {
    setManualConfig({
      env: data.selectedEnv,
      customUrl: data.gatewayUrl,
      customKeycloakUrl: data.keycloakUrl,
      isMockMode: data.mockEnabled,
    });
    toast.success('Platform connectivity settings saved successfully!');
  };

  const envConfig = AVAILABLE_ENVIRONMENTS[selectedEnv] || AVAILABLE_ENVIRONMENTS.development;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings className="h-6 w-6 text-red-600" />
          Global Platform Settings & Connectivity
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Environment selection, API connectivity endpoints, and platform operational modes.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Environment Selector Card */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-red-600" /> Active Platform Environment
                </span>
                <Badge variant="outline" className={`text-xs py-0.5 px-2 ${envConfig.badgeColor}`}>
                  {selectedEnv.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(AVAILABLE_ENVIRONMENTS) as EnvironmentType[]).map((envKey) => {
                  const env = AVAILABLE_ENVIRONMENTS[envKey];
                  const isSelected = selectedEnv === envKey;
                  return (
                    <button
                      key={envKey}
                      type="button"
                      onClick={() => {
                        form.setValue('selectedEnv', envKey);
                        if (envKey !== 'custom') {
                          form.setValue('gatewayUrl', env.url);
                        }
                      }}
                      className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-red-600 bg-red-50/40 dark:border-red-500 dark:bg-red-950/30 ring-1 ring-red-600'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 bg-card'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                          {env.label.split(' ')[0]}
                        </span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-red-600 shrink-0" />}
                      </div>
                      <span className="text-[10px] text-muted-foreground truncate">{env.url || 'Manual URL'}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Endpoints Card */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Server className="h-4 w-4 text-red-600" /> Platform Connectivity Endpoints
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-xs font-semibold">API Gateway Base URL:</FormLabel>
                  {selectedEnv !== 'custom' && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400">
                      (Preset mode: {selectedEnv})
                    </span>
                  )}
                </div>
                <FormFieldInput
                  control={form.control}
                  name="gatewayUrl"
                  onChange={(e) => {
                    form.setValue('gatewayUrl', e.target.value);
                    form.setValue('selectedEnv', 'custom');
                  }}
                  className="font-mono text-xs"
                />
              </div>

              <FormFieldInput
                control={form.control}
                name="keycloakUrl"
                label="Identity Provider & SSO Endpoint:"
                className="font-mono text-xs"
              />

              <div className="p-3 rounded-lg border bg-slate-50 dark:bg-slate-900">
                <FormFieldCheckbox
                  control={form.control}
                  name="mockEnabled"
                  label="Offline Demo Fallback Mode"
                  description="Enable demo catalog and order data generators when offline"
                  className="text-red-600"
                />
              </div>

              <div className="p-3 rounded-lg border bg-slate-50 dark:bg-slate-900">
                <FormFieldCheckbox
                  control={form.control}
                  name="maintenanceMode"
                  label="System Maintenance Mode"
                  description="Temporarily restrict non-admin write operations for maintenance"
                  className="text-red-600"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="sm" className="bg-red-600 hover:bg-red-700 text-white gap-2 font-semibold cursor-pointer w-full sm:w-auto">
              <Save className="h-4 w-4" /> Save System Settings
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default AdminPlatformSettingsPage;
