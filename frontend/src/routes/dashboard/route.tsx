import {createFileRoute} from '@tanstack/react-router';

import {AppSidebar} from '@/components/app-sidebar';
import Breadcrumbs from '@/components/breadcrumbs';
import {Separator} from '@/components/ui/separator';
import {SidebarInset, SidebarProvider, SidebarTrigger} from '@/components/ui/sidebar';
import Menu from '@/types/menu';

export const Route = createFileRoute('/dashboard')({
    component: RouteComponent,
    staticData: {
        crumb: {
            label: 'menu.dashboard',
        },
    },
});

function RouteComponent() {
    return (
        <SidebarProvider>
            <AppSidebar menu={Menu.main}/>
            <SidebarInset>
                <header className='bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4'>
                    <SidebarTrigger className='-ml-1'/>
                    <Separator orientation='vertical' className='mr-2 h-4'/>
                    <Breadcrumbs/>
                </header>
                <div className='flex flex-1 flex-col gap-4 p-4'>
                    {Array.from({length: 24}).map((_, index) => (
                        <div key={index} className='bg-muted/50 aspect-video h-12 w-full rounded-lg'/>
                    ))}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
