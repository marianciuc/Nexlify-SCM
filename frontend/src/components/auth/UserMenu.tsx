import { useRouterState, Link } from '@tanstack/react-router';
import { LogOut, Settings, Building2 } from 'lucide-react';

import '@/components/ui/badge';
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
import useAuthStore from '@/service/auth/auth-store';
import useEnvironmentStore from '@/service/env/environment-store';

interface UserMenuProps {
    variant?: 'header' | 'sidebar';
}

export function UserMenu({ variant = 'header' }: UserMenuProps) {
    const { t } = useLocale();
    const { userData, logout, isAuthenticated } = useAuthStore();
    const { currentTenant } = useEnvironmentStore();
    const router = useRouterState();
    const currentPath = router.location.pathname;

    const settingsUrl = currentPath.startsWith('/supplier')
        ? '/supplier/settings'
        : currentPath.startsWith('/logistics')
            ? '/logistics/settings'
            : currentPath.startsWith('/admin')
                ? '/admin/settings'
                : '/buyer/settings';

    const userDisplayName =
        userData?.firstName && userData?.lastName
            ? `${userData.firstName} ${userData.lastName}`
            : userData?.email?.split('@')[0] || 'Nexlify';

    const userEmail = userData?.email || 'operator@nexlify.io';

    const initials = (
        userData?.firstName?.[0]
            ? `${userData.firstName[0]}${userData.lastName?.[0] || ''}`
            : userDisplayName.slice(0, 2)
    ).toUpperCase();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {variant === 'header' ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-2 gap-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label={t('header.userMenu', { name: userDisplayName })}
                    >
                        <div className="w-7 h-7 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {initials}
                        </div>
                        <span className="hidden xl:inline-block max-w-[120px] truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {userDisplayName}
                        </span>
                    </Button>
                ) : (
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2.5 h-10 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                    >
                        <div className="w-7 h-7 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {initials}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                                {userDisplayName}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                {userEmail}
                            </span>
                        </div>
                    </Button>
                )}
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-64 p-2 shadow-xl border-slate-200 dark:border-slate-800"
            >
                <DropdownMenuLabel className="font-normal px-2 py-1.5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                            {initials}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                {userDisplayName}
                            </span>
                            <span className="text-[11px] text-slate-500 truncate">{userEmail}</span>
                        </div>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="my-1.5" />

                <div className="px-2 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs space-y-1 mb-1 border border-slate-200/60 dark:border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                        <Building2 className="h-3 w-3 text-slate-400" />
                        <span>{t('header.activeOrg')}</span>
                    </div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 truncate text-[11px]">
                        {currentTenant.name}
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                        NIP: {currentTenant.nip} • {currentTenant.warehouseCode}
                    </div>
                </div>

                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link
                            to={settingsUrl}
                            className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                        >
                            <Settings className="h-3.5 w-3.5 text-slate-500" />
                            <span>{t('header.settingsAndCompany')}</span>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-2 px-2 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md cursor-pointer"
                >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>{isAuthenticated ? t('header.logout') : t('header.login')}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default UserMenu;