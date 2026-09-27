import {useState} from 'react';
import {
    ChevronDown,
    Server,
    Building2,
    Check,
    RefreshCw,
    Sliders,
    Wifi,
    Radio,
} from 'lucide-react';
import {toast} from 'sonner';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    useEnvironmentStore,
    AVAILABLE_ENVIRONMENTS,
    AVAILABLE_TENANTS,
    type EnvironmentType,
    type TenantContext,
} from '@/service/env/environment-store';
import {ManualEnvironmentModal} from './ManualEnvironmentModal';

export function EnvironmentSwitcher() {
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const {
        currentEnvironment,
        currentTenant,
        customUrl,
        isMockMode,
        getBaseUrl,
        setEnvironment,
        setTenant,
    } = useEnvironmentStore();

    const envInfo = AVAILABLE_ENVIRONMENTS[currentEnvironment];
    const activeUrl = getBaseUrl();

    const handleSwitchEnvironment = (env: EnvironmentType) => {
        setEnvironment(env);
        toast.info(`Окружение изменено: ${AVAILABLE_ENVIRONMENTS[env].label}`, {
            description: `Базовый адрес: ${env === 'custom' ? customUrl : AVAILABLE_ENVIRONMENTS[env].url}`,
        });
    };

    const handleSwitchTenant = (tenant: TenantContext) => {
        setTenant(tenant);
        toast.success(`Активный контекст: ${tenant.name}`, {
            description: `Склад: ${tenant.warehouseCode} (NIP: ${tenant.nip})`,
        });
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant='outline'
                        size='sm'
                        aria-label={`Выбор окружения и тенанта. Текущее окружение: ${currentEnvironment}, организация: ${currentTenant.name}`}
                        className='h-8 gap-2 border-slate-200 bg-slate-50/50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/50 px-2.5 text-xs font-medium'
                    >
                        <Server className='h-3.5 w-3.5 text-slate-500' />
                        <span className='hidden sm:inline-block max-w-[130px] truncate text-slate-700 dark:text-slate-300 font-semibold'>
                            {currentTenant.name.split(' ')[0]}
                        </span>
                        <Badge variant='outline' className={`text-[10px] py-0 px-1.5 font-bold ${envInfo.badgeColor}`}>
                            {currentEnvironment === 'custom' ? 'CUSTOM' : currentEnvironment.toUpperCase().slice(0, 4)}
                        </Badge>
                        {isMockMode && (
                            <Badge variant='secondary' className='text-[9px] py-0 px-1 font-mono bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'>
                                MOCK
                            </Badge>
                        )}
                        <ChevronDown className='h-3 w-3 opacity-50 ml-0.5' />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align='end' className='w-80 p-2 shadow-xl border-slate-200 dark:border-slate-800'>
                    {/* Environments Header */}
                    <div className='flex items-center justify-between px-2 py-1'>
                        <span className='text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5'>
                            <Radio className='h-3 w-3' />
                            Окружение (Runtime Environment)
                        </span>
                        <span className='text-[10px] font-mono text-muted-foreground truncate max-w-[100px]'>
                            {activeUrl.replace('https://', '').replace('http://', '')}
                        </span>
                    </div>

                    <DropdownMenuGroup>
                        {(Object.keys(AVAILABLE_ENVIRONMENTS) as EnvironmentType[]).map(envKey => {
                            const env = AVAILABLE_ENVIRONMENTS[envKey];
                            const isSelected = currentEnvironment === envKey;
                            const displayUrl = envKey === 'custom' ? customUrl : env.url;

                            return (
                                <DropdownMenuItem
                                    key={envKey}
                                    onClick={() => handleSwitchEnvironment(envKey)}
                                    className='flex items-center justify-between py-2 px-2.5 cursor-pointer rounded-md'
                                >
                                    <div className='flex flex-col'>
                                        <div className='flex items-center gap-1.5'>
                                            <span className='text-xs font-semibold text-slate-900 dark:text-slate-100'>
                                                {env.label}
                                            </span>
                                            {envKey === 'custom' && (
                                                <Badge variant='outline' className='text-[9px] py-0 px-1 text-purple-600 border-purple-300'>
                                                    USER
                                                </Badge>
                                            )}
                                        </div>
                                        <span className='text-[10px] text-slate-500 font-mono truncate max-w-[210px]'>
                                            {displayUrl}
                                        </span>
                                    </div>
                                    {isSelected && <Check className='h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0' />}
                                </DropdownMenuItem>
                            );
                        })}
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator className='my-1.5' />

                    {/* Manual Settings Quick Action */}
                    <DropdownMenuItem
                        onClick={() => setIsConfigModalOpen(true)}
                        className='flex items-center justify-between py-2 px-2.5 cursor-pointer rounded-md bg-indigo-50/70 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium text-xs transition-colors'
                    >
                        <div className='flex items-center gap-2'>
                            <Sliders className='h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400' />
                            <span>Настроить окружение вручную...</span>
                        </div>
                        <span className='text-[10px] font-mono text-indigo-500 opacity-70'>Ctrl+E</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className='my-1.5' />

                    {/* Tenant / Company Context */}
                    <DropdownMenuLabel className='text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5'>
                        <Building2 className='h-3 w-3' />
                        <span>Контекст контрагента / Склада</span>
                    </DropdownMenuLabel>
                    <DropdownMenuGroup>
                        {AVAILABLE_TENANTS.map(tenant => {
                            const isSelected = currentTenant.id === tenant.id;
                            return (
                                <DropdownMenuItem
                                    key={tenant.id}
                                    onClick={() => handleSwitchTenant(tenant)}
                                    className='flex items-center justify-between py-2 px-2.5 cursor-pointer rounded-md'
                                >
                                    <div className='flex flex-col'>
                                        <span className='text-xs font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[210px]'>
                                            {tenant.name}
                                        </span>
                                        <div className='flex items-center gap-2 mt-0.5 text-[10px] text-slate-500'>
                                            <span>NIP: {tenant.nip}</span>
                                            <span>•</span>
                                            <span className='text-emerald-600 dark:text-emerald-400 font-medium truncate max-w-[120px]'>
                                                {tenant.warehouseCode}
                                            </span>
                                        </div>
                                    </div>
                                    {isSelected && <Check className='h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 ml-1' />}
                                </DropdownMenuItem>
                            );
                        })}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Manual Configuration Modal */}
            <ManualEnvironmentModal
                open={isConfigModalOpen}
                onOpenChange={setIsConfigModalOpen}
            />
        </>
    );
}

export default EnvironmentSwitcher;
