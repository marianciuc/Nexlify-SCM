import {createFileRoute, Outlet} from '@tanstack/react-router';
import {AppSidebar} from '@/components/app-sidebar';
import Breadcrumbs from '@/components/breadcrumbs';
import {EnvironmentSwitcher} from '@/components/env/EnvironmentSwitcher';
import {WorkspaceHeaderNav} from '@/components/navigation/WorkspaceHeaderNav';
import {NotificationBell} from '@/components/navigation/NotificationBell';
import {Separator} from '@/components/ui/separator';
import {SidebarInset, SidebarProvider, SidebarTrigger} from '@/components/ui/sidebar';

import {adminMenu} from '@/types/menu/menu';

export const Route = createFileRoute('/admin')({
    component: AdminLayout,
    staticData: { crumb: { label: 'admin' } },
});

function AdminLayout() {
    return (
        <SidebarProvider>
            {/* Accessibility: Skip to Content Link */}
            <a href="#main-content" className="skip-to-content">
                Перейти к основному содержимому
            </a>

            <AppSidebar menu={adminMenu} />
            <SidebarInset>
                <header
                    role='banner'
                    aria-label='Панель управления администратора'
                    className='bg-background/95 backdrop-blur-sm sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b px-4 transition-colors'
                >
                    <div className='flex items-center gap-2 min-w-0'>
                        <SidebarTrigger className='-ml-1 shrink-0' aria-label='Переключить боковое меню' />
                        <Separator orientation='vertical' className='mr-2 h-4 shrink-0' />
                        <Breadcrumbs />
                    </div>
                    <div className='flex items-center gap-3 shrink-0'>
                        <WorkspaceHeaderNav />
                        <Separator orientation='vertical' className='h-4 hidden sm:block' />
                        <NotificationBell />
                        <EnvironmentSwitcher />
                    </div>
                </header>
                <main
                    id='main-content'
                    tabIndex={-1}
                    role='main'
                    className='flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-50/40 dark:bg-slate-950/40 min-h-[calc(100vh-4rem)] outline-none'
                >
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
