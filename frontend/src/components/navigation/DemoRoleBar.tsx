import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import {
  ShoppingCart,
  Factory,
  Truck,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Command,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
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
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
  hotkey: string;
}

export const DEMO_ROLES: DemoRoleConfig[] = [
  {
    id: 'buyer',
    name: 'Kupiec (Buyer)',
    shortLabel: 'Kupiec',
    companyName: 'Baltic Retail Group Sp. z o.o.',
    nip: '8522619472',
    persona: 'Tomasz Kowalski (Dyrektor Zakupów)',
    roleCode: 'ROLE_BUYER',
    targetRoute: '/buyer/orders',
    badgeColor: 'from-blue-600 to-indigo-600',
    icon: ShoppingCart,
    hotkey: 'Alt+1',
  },
  {
    id: 'supplier',
    name: 'Dostawca (Supplier)',
    shortLabel: 'Dostawca',
    companyName: 'Drewnex Palety & Packaging Sp. z o.o.',
    nip: '7822910483',
    persona: 'Marek Wiśniewski (Kierownik B2B)',
    roleCode: 'ROLE_SUPPLIER',
    targetRoute: '/supplier/bids/board',
    badgeColor: 'from-amber-500 to-orange-600',
    icon: Factory,
    hotkey: 'Alt+2',
  },
  {
    id: 'logistics',
    name: 'Spedytor (TMS Logistics)',
    shortLabel: 'Logistyka',
    companyName: 'Nexlify Fleet Express Sp. z o.o.',
    nip: '5219902341',
    persona: 'Krzysztof Nowak (Dyspozytor TMS)',
    roleCode: 'ROLE_CARRIER',
    targetRoute: '/logistics/routes/planner',
    badgeColor: 'from-emerald-500 to-teal-600',
    icon: Truck,
    hotkey: 'Alt+3',
  },
  {
    id: 'admin',
    name: 'Audytor / Admin (HQ)',
    shortLabel: 'Audytor',
    companyName: 'Nexlify SCM Headquarters Poland',
    nip: '1112223344',
    persona: 'Dr inż. Operator ZUT WI (System Owner)',
    roleCode: 'ROLE_ADMIN',
    targetRoute: '/admin/analytics',
    badgeColor: 'from-purple-600 to-pink-600',
    icon: ShieldCheck,
    hotkey: 'Alt+4',
  },
];

export const DemoRoleBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isMinimized, setIsMinimized] = useState(false);

  // Determine active role from current URL pathname
  const activeRole =
    DEMO_ROLES.find((r) => location.pathname.startsWith(`/${r.id}`)) || DEMO_ROLES[0]!;

  const handleSwitchRole = (role: DemoRoleConfig) => {
    // 1. Update Tenant in environment store
    useEnvironmentStore.getState().setTenant({
      id: `ten-${role.id}-01`,
      name: role.companyName,
      nip: role.nip,
      country: 'PL',
      warehouseCode: `WH-${role.id.toUpperCase()}-01`,
      warehouseName: `${role.companyName} Central Hub`,
    });

    // 2. Update simulated auth user
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

    // 3. Navigate to role route
    navigate({ to: role.targetRoute });

    // 4. Notify
    toast.success(`Przełączono profil: ${role.name}`, {
      description: `${role.persona} • ${role.companyName} (NIP: ${role.nip})`,
    });
  };

  // Global hotkeys (Alt+1, Alt+2, Alt+3, Alt+4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        if (e.key === '1') {
          e.preventDefault();
          handleSwitchRole(DEMO_ROLES[0]!);
        } else if (e.key === '2') {
          e.preventDefault();
          handleSwitchRole(DEMO_ROLES[1]!);
        } else if (e.key === '3') {
          e.preventDefault();
          handleSwitchRole(DEMO_ROLES[2]!);
        } else if (e.key === '4') {
          e.preventDefault();
          handleSwitchRole(DEMO_ROLES[3]!);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-[9999] pointer-events-auto">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/90 text-white border border-slate-700 shadow-2xl backdrop-blur-md text-xs hover:bg-slate-900 transition-all hover:scale-105"
          title="Rozwiń Demo Role Bar do obrony dyplomu"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-bold font-mono text-2xs uppercase tracking-wider text-slate-300">
            Demo Bar: <strong className="text-white">{activeRole.shortLabel}</strong>
          </span>
          <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label="Tryb prezentacji dyplomowej"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto transition-all duration-300"
    >
      <div className="flex items-center gap-2 p-1.5 px-3 rounded-full bg-slate-950/92 backdrop-blur-xl border border-slate-700/80 shadow-2xl text-white">
        {/* Left Label */}
        <div className="hidden sm:flex items-center gap-1.5 pr-2 border-r border-slate-800 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            Dyplom WI ZUT
          </span>
        </div>

        {/* 4 Role Buttons */}
        <div className="flex items-center gap-1">
          {DEMO_ROLES.map((role) => {
            const Icon = role.icon;
            const isActive = activeRole.id === role.id;

            return (
              <button
                key={role.id}
                onClick={() => handleSwitchRole(role)}
                title={`${role.persona} (${role.companyName}) [Skrót: ${role.hotkey}]`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? `bg-gradient-to-r ${role.badgeColor} text-white shadow-lg shadow-indigo-500/25 ring-2 ring-white/30 scale-105`
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{role.shortLabel}</span>
                <span className="hidden md:inline-block text-[9px] font-mono opacity-70 bg-black/30 px-1 py-0.2 rounded">
                  {role.hotkey}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Persona Pill (Desktop) */}
        <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-slate-800 text-2xs text-slate-400 font-mono truncate max-w-xs">
          <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
          <span className="truncate">{activeRole.companyName.split(' ')[0]}</span>
        </div>

        {/* Minimize Button */}
        <button
          onClick={() => setIsMinimized(true)}
          className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Zwiń pasek"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
};

export default DemoRoleBar;
