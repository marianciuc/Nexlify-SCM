import {useRouterState, useNavigate, Link} from '@tanstack/react-router';
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
} from 'lucide-react';

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

export interface WorkspaceConfig {
    id: 'buyer' | 'supplier' | 'logistics' | 'admin';
    title: string;
    shortTitle: string;
    subtitle: string;
    roleBadge: string;
    badgeVariant: string;
    primaryUrl: string;
    icon: React.ComponentType<{className?: string}>;
    colorClasses: {
        activeBg: string;
        border: string;
        text: string;
        pillActive: string;
    };
    quickLinks: {
        title: string;
        url: string;
        icon: React.ComponentType<{className?: string}>;
    }[];
}

export const WORKSPACES: WorkspaceConfig[] = [
    {
        id: 'buyer',
        title: 'Магазин / Закупки (Buyer)',
        shortTitle: 'Магазин / Закупки',
        subtitle: 'Каталог, корзина, заказы, KSeF фактуры и тендеры RFQ',
        roleBadge: 'ПОКУПАТЕЛЬ',
        badgeVariant: 'bg-blue-500/15 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300',
        primaryUrl: '/buyer/catalog',
        icon: Store,
        colorClasses: {
            activeBg: 'bg-blue-50 dark:bg-blue-950/50',
            border: 'border-blue-500',
            text: 'text-blue-600 dark:text-blue-400',
            pillActive: 'bg-blue-600 text-white shadow-xs',
        },
        quickLinks: [
            {title: 'Каталог товаров (Магазин)', url: '/buyer/catalog', icon: Package},
            {title: 'Корзина покупок B2B', url: '/buyer/cart', icon: ShoppingCart},
            {title: 'Мои B2B Заказы', url: '/buyer/orders', icon: ListChecks},
            {title: 'Тендеры на закупку (RFQ)', url: '/buyer/requests', icon: Target},
        ],
    },
    {
        id: 'supplier',
        title: 'Кабинет поставщика (Supplier)',
        shortTitle: 'Поставщик',
        subtitle: 'Склад WMS, комплектация, оптовые цены, биржа тендеров',
        roleBadge: 'ПОСТАВЩИК',
        badgeVariant: 'bg-emerald-500/15 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300',
        primaryUrl: '/supplier/dashboard',
        icon: Building2,
        colorClasses: {
            activeBg: 'bg-emerald-50 dark:bg-emerald-950/50',
            border: 'border-emerald-500',
            text: 'text-emerald-600 dark:text-emerald-400',
            pillActive: 'bg-emerald-600 text-white shadow-xs',
        },
        quickLinks: [
            {title: 'Сводный дашборд продаж', url: '/supplier/dashboard', icon: BarChart3},
            {title: 'Складская номенклатура', url: '/supplier/products', icon: Package},
            {title: 'WMS Сборка заказов', url: '/supplier/orders', icon: ListChecks},
            {title: 'Тендерная биржа (RFQ)', url: '/supplier/bids/board', icon: Target},
        ],
    },
    {
        id: 'logistics',
        title: 'Логистика и TMS (Dispatcher)',
        shortTitle: 'Логистика',
        subtitle: 'Карта автопарка, VRP планировщик 3D LIFO, водители, e-CMR',
        roleBadge: 'ДИСПЕТЧЕР',
        badgeVariant: 'bg-amber-500/15 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300',
        primaryUrl: '/logistics/map',
        icon: Truck,
        colorClasses: {
            activeBg: 'bg-amber-50 dark:bg-amber-950/50',
            border: 'border-amber-500',
            text: 'text-amber-600 dark:text-amber-400',
            pillActive: 'bg-amber-600 text-white shadow-xs',
        },
        quickLinks: [
            {title: 'Карта автопарка онлайн', url: '/logistics/map', icon: MapPin},
            {title: 'VRP Планировщик (3D LIFO)', url: '/logistics/routes/planner', icon: Cpu},
            {title: 'Маршрутные листы', url: '/logistics/routes', icon: ListChecks},
            {title: 'Электронные накладные e-CMR', url: '/logistics/ecmr', icon: Package},
        ],
    },
    {
        id: 'admin',
        title: 'Админ-панель (Admin Platform)',
        shortTitle: 'Админ панель',
        subtitle: 'BI Аналитика, верификация тенантов, Kafka DLT, аудит',
        roleBadge: 'АДМИНИСТРАТОР',
        badgeVariant: 'bg-rose-500/15 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300',
        primaryUrl: '/admin/analytics',
        icon: ShieldAlert,
        colorClasses: {
            activeBg: 'bg-rose-50 dark:bg-rose-950/50',
            border: 'border-rose-500',
            text: 'text-rose-600 dark:text-rose-400',
            pillActive: 'bg-rose-600 text-white shadow-xs',
        },
        quickLinks: [
            {title: 'Глобальная BI Аналитика GMV', url: '/admin/analytics', icon: BarChart3},
            {title: 'Верификация организаций (KYC)', url: '/admin/users/verification', icon: Check},
            {title: 'Kafka Dead Letter Topics (DLT)', url: '/admin/system-audit/kafka-dlt', icon: Cpu},
            {title: 'Системные настройки шлюза', url: '/admin/settings', icon: Layers},
        ],
    },
];

export function getActiveWorkspace(pathname: string): WorkspaceConfig {
    if (pathname.startsWith('/supplier')) return WORKSPACES[1]!;
    if (pathname.startsWith('/logistics')) return WORKSPACES[2]!;
    if (pathname.startsWith('/admin')) return WORKSPACES[3]!;
    return WORKSPACES[0]!; // Default to buyer
}

interface WorkspaceViewSwitcherProps {
    variant?: 'sidebar' | 'header' | 'compact';
    className?: string;
}

export function WorkspaceViewSwitcher({variant = 'sidebar', className = ''}: WorkspaceViewSwitcherProps) {
    const router = useRouterState();
    const navigate = useNavigate();
    const currentPath = router.location.pathname;
    const activeWorkspace = getActiveWorkspace(currentPath);
    const ActiveIcon = activeWorkspace.icon;

    const handleSelectWorkspace = (targetUrl: string) => {
        navigate({to: targetUrl});
    };

    if (variant === 'compact') {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant='outline'
                        size='sm'
                        aria-label={`Сменить рабочее пространство. Текущий вид: ${activeWorkspace.shortTitle}`}
                        className={`h-8 gap-2 border-slate-200 dark:border-slate-800 px-2.5 text-xs font-medium shadow-2xs hover:bg-slate-100 dark:hover:bg-slate-800 ${className}`}
                    >
                        <ActiveIcon className={`h-4 w-4 ${activeWorkspace.colorClasses.text}`} />
                        <span className='font-semibold text-slate-800 dark:text-slate-200 hidden md:inline'>
                            {activeWorkspace.shortTitle}
                        </span>
                        <ChevronDown className='h-3 w-3 opacity-60' />
                    </Button>
                </DropdownMenuTrigger>
                <WorkspaceDropdownMenuContent
                    activeWorkspaceId={activeWorkspace.id}
                    onSelect={handleSelectWorkspace}
                />
            </DropdownMenu>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type='button'
                    aria-label={`Сменить рабочее пространство платформы. Текущий вид: ${activeWorkspace.title}`}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all text-left shadow-2xs group cursor-pointer ${className}`}
                >
                    <div className='flex items-center gap-2.5 min-w-0'>
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 border ${activeWorkspace.colorClasses.border} ${activeWorkspace.colorClasses.activeBg}`}>
                            <ActiveIcon className={`h-4 w-4 ${activeWorkspace.colorClasses.text}`} />
                        </div>
                        <div className='flex flex-col min-w-0'>
                            <div className='flex items-center gap-1.5'>
                                <span className='text-xs font-bold text-slate-900 dark:text-slate-100 truncate'>
                                    {activeWorkspace.shortTitle}
                                </span>
                            </div>
                            <span className='text-[10px] text-muted-foreground truncate'>
                                Нажмите для смены вида
                            </span>
                        </div>
                    </div>
                    <div className='flex items-center gap-1 shrink-0'>
                        <Badge variant='outline' className={`text-[9px] py-0 px-1 font-bold ${activeWorkspace.badgeVariant}`}>
                            {activeWorkspace.roleBadge}
                        </Badge>
                        <ChevronDown className='h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition-colors ml-0.5' />
                    </div>
                </button>
            </DropdownMenuTrigger>

            <WorkspaceDropdownMenuContent
                activeWorkspaceId={activeWorkspace.id}
                onSelect={handleSelectWorkspace}
            />
        </DropdownMenu>
    );
}

function WorkspaceDropdownMenuContent({
    activeWorkspaceId,
    onSelect,
}: {
    activeWorkspaceId: string;
    onSelect: (url: string) => void;
}) {
    return (
        <DropdownMenuContent align='start' className='w-84 p-2 shadow-2xl border-slate-200 dark:border-slate-800'>
            <DropdownMenuLabel className='text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center justify-between'>
                <span>Смена рабочего пространства (Вид)</span>
                <Sparkles className='h-3 w-3 text-indigo-500' />
            </DropdownMenuLabel>

            {/* 4 Main Workspace Cards */}
            <DropdownMenuGroup className='space-y-1 my-1'>
                {WORKSPACES.map(ws => {
                    const isSelected = activeWorkspaceId === ws.id;
                    const Icon = ws.icon;
                    return (
                        <DropdownMenuItem
                            key={ws.id}
                            onClick={() => onSelect(ws.primaryUrl)}
                            className={`flex items-start justify-between p-2.5 cursor-pointer rounded-lg border transition-all ${
                                isSelected
                                    ? `${ws.colorClasses.border} ${ws.colorClasses.activeBg} ring-1 ring-offset-0`
                                    : 'border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                            }`}
                        >
                            <div className='flex items-start gap-2.5 min-w-0'>
                                <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border ${ws.colorClasses.border} ${ws.colorClasses.activeBg} mt-0.5`}>
                                    <Icon className={`h-3.5 w-3.5 ${ws.colorClasses.text}`} />
                                </div>
                                <div className='flex flex-col min-w-0'>
                                    <div className='flex items-center gap-1.5'>
                                        <span className='text-xs font-bold text-slate-900 dark:text-slate-100'>
                                            {ws.title}
                                        </span>
                                    </div>
                                    <span className='text-[10px] text-muted-foreground line-clamp-1 mt-0.5'>
                                        {ws.subtitle}
                                    </span>
                                </div>
                            </div>
                            <div className='flex items-center shrink-0 ml-2'>
                                {isSelected ? (
                                    <Badge variant='outline' className={`text-[9px] py-0 px-1 font-bold ${ws.badgeVariant}`}>
                                        АКТИВНО
                                    </Badge>
                                ) : (
                                    <ArrowRight className='h-3.5 w-3.5 text-slate-400 opacity-60' />
                                )}
                            </div>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuGroup>

            <DropdownMenuSeparator className='my-2' />

            {/* Quick jump to popular views */}
            <DropdownMenuLabel className='text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-0.5 flex items-center gap-1.5'>
                <Layers className='h-3 w-3' />
                <span>Быстрый переход к разделам</span>
            </DropdownMenuLabel>

            <div className='grid grid-cols-2 gap-1 p-1'>
                <Link
                    to='/buyer/catalog'
                    className='flex items-center gap-1.5 p-1.5 rounded-md text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                >
                    <Package className='h-3.5 w-3.5 text-blue-600' />
                    <span className='truncate'>Магазин / Каталог</span>
                </Link>
                <Link
                    to='/buyer/orders'
                    className='flex items-center gap-1.5 p-1.5 rounded-md text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                >
                    <ListChecks className='h-3.5 w-3.5 text-blue-600' />
                    <span className='truncate'>Заказы покупателя</span>
                </Link>
                <Link
                    to='/supplier/orders'
                    className='flex items-center gap-1.5 p-1.5 rounded-md text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                >
                    <ListChecks className='h-3.5 w-3.5 text-emerald-600' />
                    <span className='truncate'>Сборка заказов (WMS)</span>
                </Link>
                <Link
                    to='/buyer/requests'
                    className='flex items-center gap-1.5 p-1.5 rounded-md text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                >
                    <Target className='h-3.5 w-3.5 text-indigo-600' />
                    <span className='truncate'>Тендеры RFQ</span>
                </Link>
                <Link
                    to='/logistics/map'
                    className='flex items-center gap-1.5 p-1.5 rounded-md text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                >
                    <MapPin className='h-3.5 w-3.5 text-amber-600' />
                    <span className='truncate'>Карта автопарка</span>
                </Link>
                <Link
                    to='/admin/analytics'
                    className='flex items-center gap-1.5 p-1.5 rounded-md text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                >
                    <BarChart3 className='h-3.5 w-3.5 text-rose-600' />
                    <span className='truncate'>Админ-панель</span>
                </Link>
            </div>
        </DropdownMenuContent>
    );
}

export default WorkspaceViewSwitcher;
