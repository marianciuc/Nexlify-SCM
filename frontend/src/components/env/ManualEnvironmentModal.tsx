import {useState, useEffect} from 'react';
import {
    Activity,
    Check,
    Cpu,
    ExternalLink,
    Globe,
    RefreshCw,
    RotateCcw,
    Save,
    Server,
    Shield,
    Sliders,
    Warehouse,
    Wifi,
    WifiOff,
} from 'lucide-react';
import {toast} from 'sonner';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {
    useEnvironmentStore,
    AVAILABLE_ENVIRONMENTS,
    AVAILABLE_TENANTS,
    type EnvironmentType,
    type TenantContext,
} from '@/service/env/environment-store';

interface ManualEnvironmentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ManualEnvironmentModal({open, onOpenChange}: ManualEnvironmentModalProps) {
    const {
        currentEnvironment,
        currentTenant,
        customUrl,
        customKeycloakUrl,
        isMockMode,
        setManualConfig,
        resetDefaults,
    } = useEnvironmentStore();

    // Local form state for editing
    const [selectedEnv, setSelectedEnv] = useState<EnvironmentType>(currentEnvironment);
    const [gatewayUrl, setGatewayUrl] = useState(customUrl);
    const [keycloakUrl, setKeycloakUrl] = useState(customKeycloakUrl);
    const [mockEnabled, setMockEnabled] = useState(isMockMode);

    // Tenant selection
    const [tenantMode, setTenantMode] = useState<'preset' | 'custom'>('preset');
    const [selectedPresetTenant, setSelectedPresetTenant] = useState<TenantContext>(currentTenant);
    const [customTenantName, setCustomTenantName] = useState(currentTenant.name);
    const [customNip, setCustomNip] = useState(currentTenant.nip);
    const [customCountry, setCustomCountry] = useState(currentTenant.country);
    const [customWhCode, setCustomWhCode] = useState(currentTenant.warehouseCode);
    const [customWhName, setCustomWhName] = useState(currentTenant.warehouseName);

    // Ping / Test state
    const [pingStatus, setPingStatus] = useState<'idle' | 'testing' | 'online' | 'warning' | 'offline'>('idle');
    const [pingMessage, setPingMessage] = useState<string>('');
    const [pingLatency, setPingLatency] = useState<number | null>(null);

    // Synchronize local form when dialog opens
    useEffect(() => {
        if (open) {
            setSelectedEnv(currentEnvironment);
            setGatewayUrl(customUrl);
            setKeycloakUrl(customKeycloakUrl);
            setMockEnabled(isMockMode);
            setSelectedPresetTenant(currentTenant);
            setCustomTenantName(currentTenant.name);
            setCustomNip(currentTenant.nip);
            setCustomCountry(currentTenant.country);
            setCustomWhCode(currentTenant.warehouseCode);
            setCustomWhName(currentTenant.warehouseName);
            setPingStatus('idle');
            setPingMessage('');
            setPingLatency(null);

            const isPreset = AVAILABLE_TENANTS.some(t => t.id === currentTenant.id);
            setTenantMode(isPreset ? 'preset' : 'custom');
        }
    }, [open, currentEnvironment, currentTenant, customUrl, customKeycloakUrl, isMockMode]);

    // Fast URL preset updater
    const handleApplyPreset = (env: EnvironmentType) => {
        setSelectedEnv(env);
        if (env !== 'custom') {
            setGatewayUrl(AVAILABLE_ENVIRONMENTS[env].url);
        }
    };

    // Live Ping / Connectivity Check
    const handleTestConnection = async () => {
        setPingStatus('testing');
        setPingMessage('Testing connection to API Gateway...');
        setPingLatency(null);

        const targetUrl = selectedEnv === 'custom' ? gatewayUrl : AVAILABLE_ENVIRONMENTS[selectedEnv].url;
        const startTime = performance.now();

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);

            // Ping health endpoint or base URL
            const res = await fetch(`${targetUrl.replace(/\/$/, '')}/actuator/health`, {
                method: 'GET',
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                },
            }).catch(async () => {
                // Fallback to checking root if actuator is restricted or absent
                return await fetch(targetUrl, {
                    method: 'HEAD',
                    signal: controller.signal,
                    mode: 'no-cors',
                });
            });

            clearTimeout(timeoutId);
            const latency = Math.round(performance.now() - startTime);
            setPingLatency(latency);

            if (res.ok || res.type === 'opaque') {
                setPingStatus('online');
                setPingMessage(`Endpoint is reachable (${latency}ms)`);
            } else {
                setPingStatus('warning');
                setPingMessage(`Server responded with HTTP ${res.status} (${latency}ms)`);
            }
        } catch (err: unknown) {
            const latency = Math.round(performance.now() - startTime);
            setPingLatency(latency);
            setPingStatus('offline');
            const errorMsg = err instanceof Error ? err.message : 'Connection failed';
            setPingMessage(`Unreachable: ${errorMsg} (${latency}ms)`);
        }
    };

    const handleSaveAndApply = () => {
        let activeTenant: TenantContext;
        if (tenantMode === 'preset') {
            activeTenant = selectedPresetTenant;
        } else {
            activeTenant = {
                id: `custom-tenant-${Date.now()}`,
                name: customTenantName || 'Custom Logistics Enterprise',
                nip: customNip || '1000000000',
                country: customCountry || 'PL',
                warehouseCode: customWhCode || 'WH-CUST-01',
                warehouseName: customWhName || 'Custom Facility Terminal',
            };
        }

        setManualConfig({
            env: selectedEnv,
            customUrl: gatewayUrl,
            customKeycloakUrl: keycloakUrl,
            isMockMode: mockEnabled,
            tenant: activeTenant,
        });

        toast.success(`Environment updated: ${AVAILABLE_ENVIRONMENTS[selectedEnv].label}`, {
            description: `Target Gateway: ${selectedEnv === 'custom' ? gatewayUrl : AVAILABLE_ENVIRONMENTS[selectedEnv].url}`,
        });

        onOpenChange(false);
    };

    const handleReset = () => {
        resetDefaults();
        toast.info('Environment settings restored to defaults (Development - Local)');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto p-6'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100'>
                        <Sliders className='h-5 w-5 text-indigo-600 dark:text-indigo-400' />
                        Ручная настройка окружения (Environment & Gateway Config)
                    </DialogTitle>
                    <DialogDescription className='text-xs text-muted-foreground'>
                        Сконфигурируйте рабочий хост API Gateway, Keycloak OIDC, режим мок-данных и параметры мультиарендной организации.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue='environment' className='mt-2 space-y-4'>
                    <TabsList className='grid grid-cols-2 w-full'>
                        <TabsTrigger value='environment' className='text-xs flex items-center gap-1.5'>
                            <Server className='h-3.5 w-3.5' /> Gateway & Endpoints
                        </TabsTrigger>
                        <TabsTrigger value='tenant' className='text-xs flex items-center gap-1.5'>
                            <Warehouse className='h-3.5 w-3.5' /> Multi-Tenant Context
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Environment & Endpoints */}
                    <TabsContent value='environment' className='space-y-4 text-xs'>
                        {/* Preset Selection Buttons */}
                        <div className='space-y-2'>
                            <Label className='text-xs font-semibold text-slate-700 dark:text-slate-300'>
                                Выберите целевое окружение:
                            </Label>
                            <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
                                {(Object.keys(AVAILABLE_ENVIRONMENTS) as EnvironmentType[]).map(envKey => {
                                    const env = AVAILABLE_ENVIRONMENTS[envKey];
                                    const isSelected = selectedEnv === envKey;
                                    return (
                                        <button
                                            key={envKey}
                                            type='button'
                                            onClick={() => handleApplyPreset(envKey)}
                                            className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                                                isSelected
                                                    ? 'border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/40 ring-1 ring-indigo-600'
                                                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 bg-card'
                                            }`}
                                        >
                                            <div className='flex items-center justify-between w-full mb-1'>
                                                <Badge variant='outline' className={`text-[9px] py-0 px-1 font-bold ${env.badgeColor}`}>
                                                    {envKey.toUpperCase()}
                                                </Badge>
                                                {isSelected && <Check className='h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400' />}
                                            </div>
                                            <span className='font-semibold text-slate-900 dark:text-slate-100 text-[11px] truncate'>
                                                {env.label.split(' ')[0]}
                                            </span>
                                            <span className='text-[9px] text-muted-foreground truncate mt-0.5'>
                                                {env.description.split(' ')[0]} {env.description.split(' ')[1]}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Custom Gateway URL Field */}
                        <div className='space-y-2 rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/40 dark:bg-slate-900/40'>
                            <div className='flex items-center justify-between'>
                                <Label htmlFor='custom-gateway-url' className='text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5'>
                                    <Globe className='h-3.5 w-3.5 text-indigo-600' />
                                    Spring Cloud Gateway Base URL
                                </Label>
                                {selectedEnv !== 'custom' && (
                                    <span className='text-[10px] text-amber-600 dark:text-amber-400 font-medium'>
                                        (Привязано к пресету {selectedEnv})
                                    </span>
                                )}
                            </div>

                            <Input
                                id='custom-gateway-url'
                                value={selectedEnv === 'custom' ? gatewayUrl : AVAILABLE_ENVIRONMENTS[selectedEnv].url}
                                onChange={e => {
                                    setGatewayUrl(e.target.value);
                                    if (selectedEnv !== 'custom') setSelectedEnv('custom');
                                }}
                                placeholder='http://localhost:8080 или https://your-gateway.domain'
                                className='h-8 text-xs font-mono bg-white dark:bg-slate-950'
                            />

                            {/* Quick chip presets */}
                            <div className='flex flex-wrap items-center gap-1.5 pt-1'>
                                <span className='text-[10px] text-muted-foreground mr-1'>Быстрые хосты:</span>
                                {[
                                    'http://localhost:8080',
                                    'http://localhost:8081',
                                    'http://127.0.0.1:8080',
                                    'https://staging-gateway.nexlify-scm.internal',
                                    'https://api.nexlify-scm.com',
                                ].map(presetUrl => (
                                    <button
                                        key={presetUrl}
                                        type='button'
                                        onClick={() => {
                                            setGatewayUrl(presetUrl);
                                            setSelectedEnv('custom');
                                        }}
                                        className='text-[10px] font-mono px-2 py-0.5 rounded border border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors'
                                    >
                                        {presetUrl.replace('https://', '').replace('http://', '')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Keycloak / Auth Realm URL */}
                        <div className='space-y-1.5 rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/40 dark:bg-slate-900/40'>
                            <Label htmlFor='custom-keycloak-url' className='text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5'>
                                <Shield className='h-3.5 w-3.5 text-blue-600' />
                                Keycloak OIDC Realm URL
                            </Label>
                            <Input
                                id='custom-keycloak-url'
                                value={keycloakUrl}
                                onChange={e => setKeycloakUrl(e.target.value)}
                                placeholder='http://localhost:9090/realms/nexlify'
                                className='h-8 text-xs font-mono bg-white dark:bg-slate-950'
                            />
                            <p className='text-[10px] text-muted-foreground'>
                                Используется для валидации JWT Bearer токенов и аутентификации пользователей.
                            </p>
                        </div>

                        {/* Ping / Connectivity Test Section */}
                        <div className='flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950'>
                            <div className='flex items-center gap-2.5'>
                                {pingStatus === 'online' && <Wifi className='h-4 w-4 text-emerald-600' />}
                                {pingStatus === 'warning' && <Activity className='h-4 w-4 text-amber-500' />}
                                {pingStatus === 'offline' && <WifiOff className='h-4 w-4 text-rose-600' />}
                                {pingStatus === 'testing' && <RefreshCw className='h-4 w-4 text-indigo-600 animate-spin' />}
                                {pingStatus === 'idle' && <Cpu className='h-4 w-4 text-slate-400' />}

                                <div>
                                    <div className='text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5'>
                                        Статус шлюза:
                                        {pingStatus === 'online' && (
                                            <Badge variant='outline' className='bg-emerald-500/15 text-emerald-700 border-emerald-300 py-0 text-[10px]'>
                                                ONLINE {pingLatency ? `(${pingLatency}ms)` : ''}
                                            </Badge>
                                        )}
                                        {pingStatus === 'warning' && (
                                            <Badge variant='outline' className='bg-amber-500/15 text-amber-700 border-amber-300 py-0 text-[10px]'>
                                                LIMITED {pingLatency ? `(${pingLatency}ms)` : ''}
                                            </Badge>
                                        )}
                                        {pingStatus === 'offline' && (
                                            <Badge variant='outline' className='bg-rose-500/15 text-rose-700 border-rose-300 py-0 text-[10px]'>
                                                OFFLINE
                                            </Badge>
                                        )}
                                        {pingStatus === 'idle' && (
                                            <span className='text-slate-500 text-[11px] font-normal'>Не тестировалось</span>
                                        )}
                                    </div>
                                    {pingMessage && (
                                        <p className='text-[10px] text-muted-foreground mt-0.5 truncate max-w-sm'>{pingMessage}</p>
                                    )}
                                </div>
                            </div>

                            <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                onClick={handleTestConnection}
                                disabled={pingStatus === 'testing'}
                                className='h-7 text-xs gap-1.5 shrink-0'
                            >
                                <RefreshCw className={`h-3 w-3 ${pingStatus === 'testing' ? 'animate-spin' : ''}`} />
                                Проверить связь
                            </Button>
                        </div>

                        {/* Mock Mode Checkbox */}
                        <div className='flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50'>
                            <div className='space-y-0.5'>
                                <Label htmlFor='mock-mode-toggle' className='text-xs font-semibold cursor-pointer'>
                                    Автономный режим с мок-данными (Offline Mock Fallback)
                                </Label>
                                <p className='text-[10px] text-muted-foreground'>
                                    При недоступности бэкенда использовать встроенные генераторы заказов, карточек товаров и телематики.
                                </p>
                            </div>
                            <input
                                id='mock-mode-toggle'
                                type='checkbox'
                                checked={mockEnabled}
                                onChange={e => setMockEnabled(e.target.checked)}
                                className='h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500'
                            />
                        </div>
                    </TabsContent>

                    {/* Tab 2: Tenant Context */}
                    <TabsContent value='tenant' className='space-y-4 text-xs'>
                        <div className='flex items-center gap-2 border-b pb-2'>
                            <button
                                type='button'
                                onClick={() => setTenantMode('preset')}
                                className={`text-xs font-semibold px-3 py-1 rounded-md transition-colors ${
                                    tenantMode === 'preset'
                                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                                }`}
                            >
                                Польские хабы (Пресеты)
                            </button>
                            <button
                                type='button'
                                onClick={() => setTenantMode('custom')}
                                className={`text-xs font-semibold px-3 py-1 rounded-md transition-colors ${
                                    tenantMode === 'custom'
                                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                                }`}
                            >
                                Ручной ввод организации
                            </button>
                        </div>

                        {tenantMode === 'preset' ? (
                            <div className='space-y-2'>
                                {AVAILABLE_TENANTS.map(tenant => {
                                    const isSelected = selectedPresetTenant.id === tenant.id;
                                    return (
                                        <div
                                            key={tenant.id}
                                            onClick={() => setSelectedPresetTenant(tenant)}
                                            className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                                                isSelected
                                                    ? 'border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/40 ring-1 ring-indigo-600'
                                                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 bg-card'
                                            }`}
                                        >
                                            <div className='space-y-1'>
                                                <div className='font-semibold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-2'>
                                                    {tenant.name}
                                                    <Badge variant='outline' className='text-[9px] py-0'>
                                                        NIP: {tenant.nip}
                                                    </Badge>
                                                </div>
                                                <div className='text-[11px] text-muted-foreground flex items-center gap-2'>
                                                    <span className='font-medium text-emerald-600 dark:text-emerald-400'>
                                                        {tenant.warehouseCode}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{tenant.warehouseName}</span>
                                                </div>
                                            </div>
                                            {isSelected && <Check className='h-4 w-4 text-indigo-600 shrink-0' />}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className='space-y-3 rounded-lg border p-3.5 bg-slate-50/40 dark:bg-slate-900/40'>
                                <div className='grid grid-cols-2 gap-3'>
                                    <div className='space-y-1'>
                                        <Label className='text-xs'>Название компании / Контрагента</Label>
                                        <Input
                                            value={customTenantName}
                                            onChange={e => setCustomTenantName(e.target.value)}
                                            placeholder='Nexlify Polska Sp. z o.o.'
                                            className='h-8 text-xs bg-white dark:bg-slate-950'
                                        />
                                    </div>
                                    <div className='space-y-1'>
                                        <Label className='text-xs'>Налоговый номер (NIP / Tax ID)</Label>
                                        <Input
                                            value={customNip}
                                            onChange={e => setCustomNip(e.target.value)}
                                            placeholder='8522619472'
                                            className='h-8 text-xs font-mono bg-white dark:bg-slate-950'
                                        />
                                    </div>
                                </div>
                                <div className='grid grid-cols-3 gap-3'>
                                    <div className='space-y-1'>
                                        <Label className='text-xs'>Страна</Label>
                                        <Input
                                            value={customCountry}
                                            onChange={e => setCustomCountry(e.target.value)}
                                            placeholder='PL'
                                            className='h-8 text-xs bg-white dark:bg-slate-950'
                                        />
                                    </div>
                                    <div className='space-y-1'>
                                        <Label className='text-xs'>Код склада (WMS)</Label>
                                        <Input
                                            value={customWhCode}
                                            onChange={e => setCustomWhCode(e.target.value)}
                                            placeholder='WH-CUST-01'
                                            className='h-8 text-xs font-mono bg-white dark:bg-slate-950'
                                        />
                                    </div>
                                    <div className='space-y-1'>
                                        <Label className='text-xs'>Название терминала</Label>
                                        <Input
                                            value={customWhName}
                                            onChange={e => setCustomWhName(e.target.value)}
                                            placeholder='Central Logistics Hub'
                                            className='h-8 text-xs bg-white dark:bg-slate-950'
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                <DialogFooter className='flex flex-row items-center justify-between sm:justify-between pt-3 border-t mt-2'>
                    <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={handleReset}
                        className='text-slate-500 hover:text-rose-600 text-xs gap-1.5 h-8'
                    >
                        <RotateCcw className='h-3.5 w-3.5' />
                        Сбросить по умолчанию
                    </Button>

                    <div className='flex items-center gap-2'>
                        <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => onOpenChange(false)}
                            className='text-xs h-8'
                        >
                            Отмена
                        </Button>
                        <Button
                            type='button'
                            size='sm'
                            onClick={handleSaveAndApply}
                            className='text-xs gap-1.5 h-8 bg-indigo-600 hover:bg-indigo-700 text-white'
                        >
                            <Save className='h-3.5 w-3.5' />
                            Сохранить и применить
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default ManualEnvironmentModal;
