import {createFileRoute} from '@tanstack/react-router';

import {AppSidebar} from '@/components/app-sidebar';
import {Breadcrumbs} from '@/components/breadcrumbs';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Separator} from '@/components/ui/separator';
import {SidebarInset, SidebarProvider, SidebarTrigger} from '@/components/ui/sidebar';
import {useAuthRoute} from '@/hooks/useAuthRoute';
import {SecurityScope} from '@/types/api';
import menu from '@/types/menu';

export const Route = createFileRoute('/dashboard/settings')({
    component: SettingsPage,
    staticData: {
        crumb: {
            label: 'menu.settings',
        },
    },
});

function SettingsPage() {
    // Используем хук для защиты маршрута с требуемыми scope'ами
    // Например, требуем права на управление настройками системы
    const {isLoading, shouldShowContent} = useAuthRoute([
        SecurityScope.MOD_001_001, // Системное администрирование
        SecurityScope.MOD_001_002, // Управление пользователями
    ]);

    // Показываем загрузку
    if (isLoading) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            </div>
        );
    }

    // Не показываем контент, если пользователь не авторизован или не имеет нужных прав
    if (!shouldShowContent) {
        return null;
    }

    return (
        <SidebarProvider>
            <AppSidebar menu={menu.settings}/>
            <SidebarInset>
                <header className='bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4'>
                    <SidebarTrigger className='-ml-1'/>
                    <Separator orientation='vertical' className='mr-2 h-4'/>
                    <Breadcrumbs/>
                </header>
                <div className='flex flex-1 flex-col gap-4 p-4'>
                    <div className='grid gap-4'>
                        <Card>
                            <CardHeader>
                                <CardTitle>System Settings</CardTitle>
                                <CardDescription>
                                    Configure system-wide settings. This page requires MOD_001_001 or MOD_001_002
                                    permissions.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className='text-sm text-muted-foreground'>
                                    This is a protected route that demonstrates the useAuthRoute hook with required
                                    security scopes. Only users with the appropriate permissions can access this page.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Required Permissions</CardTitle>
                                <CardDescription>
                                    The following security scopes are required to access this page:
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className='list-disc list-inside space-y-1 text-sm'>
                                    <li>MOD_001_001 - System Administration</li>
                                    <li>MOD_001_002 - User Management</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
