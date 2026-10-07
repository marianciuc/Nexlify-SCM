import { useNavigate, useLocation } from '@tanstack/react-router';
import { ShoppingCart, Factory, Truck, ShieldCheck, ChevronDown, ChevronUp, Sparkles, Building2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

import '@/components/ui/badge';
import { useLocale } from '@/hooks/useLocale';
import useAuthStore from '@/service/auth/auth-store';
import useEnvironmentStore from '@/service/env/environment-store';

export interface DemoRoleConfig {
    id: 'buyer' | 'supplier' | 'logistics' | 'admin';
    name: string;
    shortLabel: string;
    companyName: string;
    nip: string;
    persona: string;
    roleCode: string;
    targetRoute: string;
    icon: React.ComponentType<{ className?: string }>;
    hotkey: string;
}

// Internal raw demo seed data — labels stay in code because they describe a specific demo persona.
const RAW_DEMO_ROLES: DemoRoleConfig[] = [
    {
        id: 'buyer',
        name: 'Procurement Manager',
        shortLabel: 'Procurement',
        companyName: 'Baltic Retail Group Sp. z o.o.',
        nip: '8522619472',
        persona: 'Tomasz Kowalski',
        roleCode: 'ROLE_BUYER',
        targetRoute: '/buyer/orders',
        icon: ShoppingCart,
        hotkey: 'Alt+1',
    },
    {
        id: 'supplier',
        name: 'Supplier',
        shortLabel: 'Supplier',
        companyName: 'Drewnex Palety & Packaging Sp. z o.o.',
        nip: '7822910483',
        persona: 'Marek Wiśniewski',
        roleCode: 'ROLE_SUPPLIER',
        targetRoute: '/supplier/bids/board',
        icon: Factory,
        hotkey: 'Alt+2',
    },
    {
        id: 'logistics',
        name: 'Logistics Dispatcher',
        shortLabel: 'Logistics',
        companyName: 'Nexlify Fleet Express Sp. z o.o.',
        nip: '5219902341',
        persona: 'Krzysztof Nowak',
        roleCode: 'ROLE_CARRIER',
        targetRoute: '/logistics/routes/planner',
        icon: Truck,
        hotkey: 'Alt+3',
    },
    {
        id: 'admin',
        name: 'Platform Admin',
        shortLabel: 'Admin',
        companyName: 'Nexlify SCM Headquarters Poland',
        nip: '1112223344',
        persona: 'System Superadmin',
        roleCode: 'ROLE_ADMIN',
        targetRoute: '/admin/analytics',
        icon: ShieldCheck,
        hotkey: 'Alt+4',
    },
];

export const DEMO_ROLES: DemoRoleConfig[] = RAW_DEMO_ROLES;

export const DemoRoleBar: React.FC = () => {
    const { t } = useLocale();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMinimized, setIsMinimized] = useState(false);

    const isDemoEnabled =
        typeof window !== 'undefined' &&
        (import.meta.env.VITE_DEMO_MODE === 'true' ||
            window.localStorage.getItem('nexlify_demo_mode') === 'true');

    const activeRole =
        DEMO_ROLES.find((r) => location.pathname.startsWith(`/${r.id}`)) || DEMO_ROLES[0]!;

    const handleSwitchRole = (role: DemoRoleConfig) => {
        useEnvironmentStore.getState().setTenant({
            id: `ten-${role.id}-01`,
            name: role.companyName,
            nip: role.nip,
            country: 'PL',
            warehouseCode: `WH-${role.id.toUpperCase()}-01`,
            warehouseName: `${role.companyName} Central Hub`,
        });

        useAuthStore.setState({
            userData: {
                id: `usr-${role.id}-01`,
                email: `${role.id}@nexlify-scm.pl`,
                firstName: role.persona.split(' ')[0] || 'Demo',
                lastName: role.persona.split(' ')[1] || 'User',
                companyName: role.companyName,
                roles: [role.roleCode],
            },
            isAuthenticated: true,
            accessToken: `opq_demo_token_${role.id}`,
        });

        navigate({ to: role.targetRoute });

        toast.success(t('common.success'), {
            description: `${role.persona} • ${role.companyName} (NIP: ${role.nip})`,
        });
    };

    useEffect(() => {
        if (!isDemoEnabled) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.altKey && !e.ctrlKey && !e.metaKey) {
                const slot = e.key;
                const found = DEMO_ROLES.find((r) => r.hotkey.endsWith(`+${slot}`));
                if (found) {
                    e.preventDefault();
                    handleSwitchRole(found);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDemoEnabled]);

    if (!isDemoEnabled) {
        return null;
    }

    if (isMinimized) {
        return (
            <div className="fixed bottom-4 right-4 z-[9999] pointer-events-auto">
                <button
                    onClick={() => setIsMinimized(false)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/90 text-white border border-slate-700 shadow-2xl backdrop-blur-md text-xs hover:bg-slate-900 transition-all"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="font-bold font-mono text-[10px] uppercase tracking-wider text-slate-300">
                        Demo · {activeRole.shortLabel}
                    </span>
                    <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
                </button>
            </div>
        );
    }

    return (
        <aside
            aria-label="Demo role selector"
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto transition-all duration-300"
        >
            <div className="flex items-center gap-2 p-1.5 px-3 rounded-full bg-slate-950/92 backdrop-blur-xl border border-slate-700/80 shadow-2xl text-white">
                <div className="hidden sm:flex items-center gap-1.5 pr-2 border-r border-slate-800 text-xs font-semibold">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                        Demo
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    {DEMO_ROLES.map((role) => {
                        const Icon = role.icon;
                        const isActive = activeRole.id === role.id;

                        return (
                            <button
                                key={role.id}
                                onClick={() => handleSwitchRole(role)}
                                title={`${role.persona} (${role.companyName}) [${role.hotkey}]`}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                                    isActive
                                        ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-white/30 scale-105'
                                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                                }`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                <span>{role.shortLabel}</span>
                                <span className="hidden md:inline-block text-[9px] font-mono opacity-70 bg-black/30 px-1 py-0.5 rounded">
                                    {role.hotkey}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-slate-800 text-[10px] text-slate-400 font-mono truncate max-w-xs">
                    <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className="truncate">{activeRole.companyName.split(' ')[0]}</span>
                </div>

                <button
                    onClick={() => setIsMinimized(true)}
                    className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Minimize"
                >
                    <ChevronDown className="h-3.5 w-3.5" />
                </button>
            </div>
        </aside>
    );
};

export default DemoRoleBar;