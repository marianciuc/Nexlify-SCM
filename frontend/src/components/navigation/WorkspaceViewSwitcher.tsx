import { useRouterState, useNavigate, Link } from '@tanstack/react-router';
import {
    ShoppingCart,
    Store,
    Building2,
    Truck,
    ShieldAlert,
    ChevronDown,
    Check,
    ArrowRight,
    Package,
    ListChecks,
    Target,
    MapPin,
    Cpu,
    BarChart3,
    Layers,
    Sparkles,
    AlertTriangle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocale } from '@/hooks/useLocale';
import { canAccessWorkspace } from '@/lib/workspace-routing';
import useAuthStore from '@/service/auth/auth-store';

type WorkspaceId = 'buyer' | 'supplier' | 'logistics' | 'admin';

export interface WorkspaceConfig {
    id: WorkspaceId;
    translationKey: 'workspace.buyer' | 'workspace.supplier' | 'workspace.logistics' | 'workspace.admin';
    roleCode: string;
    primaryUrl: string;
    icon: React.ComponentType<{ className?: string }>;
    colorClasses: {
        activeBg: string;
        border: string;
        text: string;
        pillActive: string;
    };
}

export const WORKSPACES: WorkspaceConfig[] = [
    {
        id: 'buyer',
        translationKey: 'workspace.buyer',
        roleCode: 'BUYER',
        primaryUrl: '/buyer/catalog',
        icon: Store,
        colorClasses: {
            activeBg: 'bg-blue-50 dark:bg-blue-950/50',
            border: 'border-blue-500',
            text: 'text-blue-600 dark:text-blue-400',
            pillActive: 'bg-blue-600 text-white shadow-xs',
        },
    },
    {
        id: 'supplier',
        translationKey: 'workspace.supplier',
        roleCode: 'SUPPLIER',
        primaryUrl: '/supplier/dashboard',
        icon: Building2,
        colorClasses: {
            activeBg: 'bg-emerald-50 dark:bg-emerald-950/50',
            border: 'border-emerald-500',
            text: 'text-emerald-600 dark:text-emerald-400',
            pillActive: 'bg-emerald-600 text-white shadow-xs',
        },
    },
    {
        id: 'logistics',
        translationKey: 'workspace.logistics',
        roleCode: 'CARRIER',
        primaryUrl: '/logistics/map',
        icon: Truck,
        colorClasses: {
            activeBg: 'bg-amber-50 dark:bg-amber-950/50',
            border: 'border-amber-500',
            text: 'text-amber-600 dark:text-amber-400',
            pillActive: 'bg-amber-600 text-white shadow-xs',
        },
    },
    {
        id: 'admin',
        translationKey: 'workspace.admin',
        roleCode: 'ADMIN',
        primaryUrl: '/admin/analytics',
        icon: ShieldAlert,
        colorClasses: {
            activeBg: 'bg-rose-50 dark:bg-rose-950/50',
            border: 'border-rose-500',
            text: 'text-rose-600 dark:text-rose-400',
            pillActive: 'bg-rose-600 text-white shadow-xs',
        },
    },
];

export function getActiveWorkspace(pathname: string): WorkspaceConfig {
    if (pathname.startsWith('/supplier')) return WORKSPACES[1]!;
    if (pathname.startsWith('/logistics')) return WORKSPACES[2]!;
    if (pathname.startsWith('/admin')) return WORKSPACES[3]!;
    return WORKSPACES[0]!;
}

interface WorkspaceViewSwitcherProps {
    variant?: 'sidebar' | 'header' | 'compact';
    className?: string;
}

export function WorkspaceViewSwitcher({ variant = 'sidebar', className = '' }: WorkspaceViewSwitcherProps) {
    const { t } = useLocale();
    const router = useRouterState();
    const navigate = useNavigate();
    const currentPath = router.location.pathname;
    const activeWorkspace = getActiveWorkspace(currentPath);
    const ActiveIcon = activeWorkspace.icon;
    const { isAuthenticated, userData } = useAuthStore();
    const demoEnabled =
        typeof window !== 'undefined' &&
        (import.meta.env.VITE_DEMO_MODE === 'true' ||
            window.localStorage.getItem('nexlify_demo_mode') === 'true');
    const availableWorkspaces =
        !isAuthenticated || demoEnabled
            ? WORKSPACES
            : WORKSPACES.filter((workspace) => canAccessWorkspace(userData, workspace.id));

    const handleSelectWorkspace = (targetUrl: string) => {
        navigate({ to: targetUrl });
    };

    const activeTitle = t(`${activeWorkspace.translationKey}.title`);
    const activeShort = t(`${activeWorkspace.translationKey}.shortTitle`);

    if (variant === 'compact') {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        aria-label={t('workspace.switcher.current', { title: activeTitle })}
                        className={`h-8 gap-2 border-slate-200 dark:border-slate-800 px-2.5 text-xs font-medium shadow-2xs hover:bg-slate-100 dark:hover:bg-slate-800 ${className}`}
                    >
                        <ActiveIcon className={`h-4 w-4 ${activeWorkspace.colorClasses.text}`} />
                        <span className="font-semibold text-slate-800 dark:text-slate-200 hidden md:inline">
                            {activeShort}
                        </span>
                        <ChevronDown className="h-3 w-3 opacity-60" />
                    </Button>
                </DropdownMenuTrigger>
                <WorkspaceDropdownMenuContent
                    activeWorkspaceId={activeWorkspace.id}
                    onSelect={handleSelectWorkspace}
                    workspaces={availableWorkspaces}
                />
            </DropdownMenu>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label={t('workspace.switcher.current', { title: activeTitle })}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all text-left shadow-2xs group cursor-pointer ${className}`}
                >
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div
                            className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 border ${activeWorkspace.colorClasses.border} ${activeWorkspace.colorClasses.activeBg}`}
                        >
                            <ActiveIcon className={`h-4 w-4 ${activeWorkspace.colorClasses.text}`} />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                {activeShort}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate">
                                {t('workspace.switcher.clickToChange')}
                            </span>
                        </div>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </button>
            </DropdownMenuTrigger>

            <WorkspaceDropdownMenuContent
                activeWorkspaceId={activeWorkspace.id}
                onSelect={handleSelectWorkspace}
                workspaces={availableWorkspaces}
            />
        </DropdownMenu>
    );
}

function WorkspaceDropdownMenuContent({
    activeWorkspaceId,
    onSelect,
    workspaces,
}: {
    activeWorkspaceId: string;
    onSelect: (url: string) => void;
    workspaces: WorkspaceConfig[];
}) {
    const { t } = useLocale();
    return (
        <DropdownMenuContent
            align="start"
            className="w-72 p-2 shadow-2xl border-slate-200 dark:border-slate-800"
        >
            <DropdownMenuLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
                <span>{t('workspace.switcher.label')}</span>
                <Sparkles className="h-3 w-3 text-indigo-500" />
            </DropdownMenuLabel>

            <DropdownMenuGroup className="space-y-1 my-1">
                {workspaces.map((ws) => {
                    const isSelected = activeWorkspaceId === ws.id;
                    const Icon = ws.icon;
                    return (
                        <DropdownMenuItem
                            key={ws.id}
                            onClick={() => onSelect(ws.primaryUrl)}
                            className={`flex items-start justify-between p-2.5 cursor-pointer rounded-lg border transition-all ${
                                isSelected
                                    ? `${ws.colorClasses.border} ${ws.colorClasses.activeBg}`
                                    : 'border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                            }`}
                        >
                            <div className="flex items-start gap-2.5 min-w-0">
                                <div
                                    className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border ${ws.colorClasses.border} ${ws.colorClasses.activeBg} mt-0.5`}
                                >
                                    <Icon className={`h-3.5 w-3.5 ${ws.colorClasses.text}`} />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                        {t(`${ws.translationKey}.title`)}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">
                                        {t(`${ws.translationKey}.subtitle`)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center shrink-0 ml-2">
                                {isSelected ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                                ) : (
                                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 opacity-60" />
                                )}
                            </div>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="my-2" />

            <DropdownMenuLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-0.5 flex items-center gap-1.5">
                <Layers className="h-3 w-3" />
                <span>{t('workspace.switcher.quickLinks')}</span>
            </DropdownMenuLabel>

            <div className="grid grid-cols-2 gap-1 p-1">
                <Link
                    to="/buyer/catalog"
                    search={{ q: '', category: 'ALL', brand: 'ALL', manufacturer: 'ALL', stock: 'ALL' }}
                    className="flex items-center gap-1.5 p-1.5 rounded-md text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <Package className="h-3.5 w-3.5 text-blue-600" />
                    <span className="truncate">{t('nav.buyer.catalog')}</span>
                </Link>
                <Link
                    to="/buyer/orders"
                    className="flex items-center gap-1.5 p-1.5 rounded-md text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <ListChecks className="h-3.5 w-3.5 text-blue-600" />
                    <span className="truncate">{t('nav.buyer.orders')}</span>
                </Link>
                <Link
                    to="/supplier/orders"
                    className="flex items-center gap-1.5 p-1.5 rounded-md text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <ListChecks className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="truncate">{t('nav.supplier.fulfillment')}</span>
                </Link>
                <Link
                    to="/buyer/requests"
                    className="flex items-center gap-1.5 p-1.5 rounded-md text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <Target className="h-3.5 w-3.5 text-indigo-600" />
                    <span className="truncate">{t('nav.buyer.rfq')}</span>
                </Link>
                <Link
                    to="/logistics/map"
                    className="flex items-center gap-1.5 p-1.5 rounded-md text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <MapPin className="h-3.5 w-3.5 text-amber-600" />
                    <span className="truncate">{t('nav.logistics.map')}</span>
                </Link>
                <Link
                    to="/admin/analytics"
                    className="flex items-center gap-1.5 p-1.5 rounded-md text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <BarChart3 className="h-3.5 w-3.5 text-rose-600" />
                    <span className="truncate">{t('nav.admin.analytics')}</span>
                </Link>
            </div>
        </DropdownMenuContent>
    );
}

export default WorkspaceViewSwitcher;