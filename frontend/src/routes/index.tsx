import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, Building2, Package, ShieldCheck, ShoppingCart, Truck } from 'lucide-react';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useLocale } from '@/hooks/useLocale';
import { canAccessWorkspace } from '@/lib/workspace-routing';
import useAuthStore from '@/service/auth/auth-store';

export const Route = createFileRoute('/')({ component: WorkspaceHome });

type WorkspaceLink = {
    translationKey: 'workspace.buyer' | 'workspace.supplier' | 'workspace.logistics' | 'workspace.admin';
    href: string;
    icon: typeof ShoppingCart;
};

const workspaces: WorkspaceLink[] = [
    { translationKey: 'workspace.buyer', href: '/buyer/catalog', icon: ShoppingCart },
    { translationKey: 'workspace.supplier', href: '/supplier/dashboard', icon: Package },
    { translationKey: 'workspace.logistics', href: '/logistics/map', icon: Truck },
    { translationKey: 'workspace.admin', href: '/admin/analytics', icon: ShieldCheck },
];

function WorkspaceHome() {
    const { t } = useLocale();
    const { isAuthenticated, userData } = useAuthStore();
    const availableWorkspaces = workspaces.filter(({ href }) => {
        if (!isAuthenticated) return true;
        const workspace = href.split('/')[1] as 'buyer' | 'supplier' | 'logistics' | 'admin';
        return canAccessWorkspace(userData, workspace);
    });

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="flex h-14 items-center justify-between border-b px-4 sm:px-6">
                <Link
                    to="/"
                    className="flex items-center gap-2.5 rounded-sm font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <span className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                        N
                    </span>
                    Nexlify SCM
                </Link>
                <div className="flex items-center gap-1">
                    <LanguageSwitcher />
                    <ThemeToggle />
                    <Link
                        to="/auth/login"
                        className="ml-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                        {isAuthenticated ? userData?.firstName || t('menu.profile') : t('auth.login')}
                    </Link>
                </div>
            </header>

            <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
                <div className="mb-8 max-w-2xl">
                    <p className="mb-2 text-sm font-medium text-muted-foreground">
                        {t('buyer.home.platformName')}
                    </p>
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        {t('buyer.home.chooseWorkspace')}
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {t('buyer.home.platformDesc')}
                    </p>
                </div>

                <ul className="divide-y divide-border border-y border-border">
                    {availableWorkspaces.map(({ translationKey, href, icon: Icon }) => (
                        <li key={href}>
                            <Link
                                to={href}
                                className="group flex min-h-24 items-center gap-4 py-5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:gap-5"
                            >
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
                                    <Icon className="size-5" aria-hidden="true" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                        <span className="font-semibold">
                                            {t(`${translationKey}.title`)}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {t(`${translationKey}.role`)}
                                        </span>
                                    </span>
                                    <span className="mt-1 block text-sm leading-5 text-muted-foreground">
                                        {t(`${translationKey}.subtitle`)}
                                    </span>
                                </span>
                                <span className="flex shrink-0 items-center gap-2 text-sm font-medium text-primary">
                                    <span className="hidden sm:inline">{t('common.open')}</span>
                                    <ArrowRight
                                        className="size-4 transition-transform group-hover:translate-x-0.5"
                                        aria-hidden="true"
                                    />
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>

                <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                    <Building2 className="size-4 shrink-0" aria-hidden="true" />
                    {t('buyer.home.footerNote')}
                </p>
            </main>
        </div>
    );
}

export default WorkspaceHome;