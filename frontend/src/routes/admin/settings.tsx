import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  Settings,
  Server,
  Shield,
  Database,
  Radio,
  Save,
  Sliders,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

function AdminPlatformSettingsPage() {
  const {
    currentEnvironment,
    customUrl,
    customKeycloakUrl,
    isMockMode,
    setManualConfig,
  } = useEnvironmentStore();

  const [selectedEnv, setSelectedEnv] = useState<EnvironmentType>(currentEnvironment);
  const [gatewayUrl, setGatewayUrl] = useState(customUrl);
  const [keycloakUrl, setKeycloakUrl] = useState(customKeycloakUrl);
  const [kafkaBrokers, setKafkaBrokers] = useState('localhost:9092 (KRaft Cluster)');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [mockEnabled, setMockEnabled] = useState(isMockMode);

  useEffect(() => {
    setSelectedEnv(currentEnvironment);
    setGatewayUrl(customUrl);
    setKeycloakUrl(customKeycloakUrl);
    setMockEnabled(isMockMode);
  }, [currentEnvironment, customUrl, customKeycloakUrl, isMockMode]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setManualConfig({
      env: selectedEnv,
      customUrl: gatewayUrl,
      customKeycloakUrl: keycloakUrl,
      isMockMode: mockEnabled,
    });
    toast.success('Platform infrastructure and gateway settings saved successfully!');
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings className="h-6 w-6 text-red-600" />
          Global Platform Architecture & Gateway Governance
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cluster connectivity, Spring Cloud Gateway route definitions, Keycloak OIDC, and Redis token cache.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Environment Selector Card */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-red-600" /> Active Platform Environment
              </span>
              <Badge variant="outline" className={`text-xs py-0.5 px-2 ${AVAILABLE_ENVIRONMENTS[selectedEnv].badgeColor}`}>
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
                      setSelectedEnv(envKey);
                      if (envKey !== 'custom') {
                        setGatewayUrl(env.url);
                      }
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
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
              <Server className="h-4 w-4 text-red-600" /> Microservice Infrastructure Endpoints
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Spring Cloud Gateway Base URL:</Label>
                {selectedEnv !== 'custom' && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400">
                    (Preset mode: {selectedEnv})
                  </span>
                )}
              </div>
              <Input
                value={gatewayUrl}
                onChange={(e) => {
                  setGatewayUrl(e.target.value);
                  setSelectedEnv('custom');
                }}
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Keycloak OIDC Realm Discovery:</Label>
              <Input
                value={keycloakUrl}
                onChange={(e) => setKeycloakUrl(e.target.value)}
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Apache Kafka Event Bus (KRaft):</Label>
              <Input
                value={kafkaBrokers}
                onChange={(e) => setKafkaBrokers(e.target.value)}
                className="font-mono text-xs"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 dark:bg-slate-900 pt-2">
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">Offline Mock Fallback Mode</div>
                <div className="text-[10px] text-slate-500">Enable in-browser mock catalog and order generators</div>
              </div>
              <input
                type="checkbox"
                checked={mockEnabled}
                onChange={(e) => setMockEnabled(e.target.checked)}
                className="h-4 w-4 text-red-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 dark:bg-slate-900 pt-2">
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">Global Maintenance Mode</div>
                <div className="text-[10px] text-slate-500">Restricts non-admin API writes across all tenants</div>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="h-4 w-4 text-red-600 rounded"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white gap-2 text-xs font-semibold">
            <Save className="h-4 w-4" /> Save System Settings
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AdminPlatformSettingsPage;
