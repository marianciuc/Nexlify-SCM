import {Link, useRouterState} from '@tanstack/react-router';
import {ChevronRight} from 'lucide-react';
import * as React from 'react';

import {UserMenu} from '@/components/auth/UserMenu';
import {WorkspaceViewSwitcher} from '@/components/navigation/WorkspaceViewSwitcher';
import {Badge} from '@/components/ui/badge';
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from '@/components/ui/collapsible';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar';
import {MenuItemType, type Item} from '@/types/menu/types';
import {useLocale} from '@/hooks/useLocale';

export function AppSidebar({
    menu,
    ...props
}: React.ComponentProps<typeof Sidebar> & { menu: Item[] }) {
    const {t} = useLocale();
    const router = useRouterState();
    const currentPath = router.location.pathname;

    return (
        <Sidebar {...props} className='border-r border-slate-200/80 dark:border-slate-800'>
            {/* Sidebar Branding Header */}
            <SidebarHeader className='border-b border-slate-200/60 dark:border-slate-800 p-3.5 space-y-3'>
                <Link to='/' className='flex items-center gap-3'>
                    <div className='w-9 h-9 bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-indigo-500/20'>
                        N
                    </div>
                    <div className='flex flex-col'>
                        <div className='flex items-center gap-1.5'>
                            <span className='font-bold text-base tracking-tight text-slate-900 dark:text-slate-100'>
                                Nexlify-SCM
                            </span>
                            <Badge variant='outline' className='text-[9px] py-0 px-1 font-bold text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:text-blue-300'>
                                MVP
                            </Badge>
                        </div>
                        <span className='text-[10px] text-slate-500 font-medium truncate max-w-[150px]'>
                            B2B Supply Chain Platform
                        </span>
                    </div>
                </Link>

                {/* Interactive Workspace View Switcher */}
                <WorkspaceViewSwitcher variant='sidebar' />
            </SidebarHeader>

            <SidebarContent className='gap-0 py-2'>
                {/* Core Navigation from Props */}
                <SidebarGroup className='pb-2'>
                    <SidebarGroupLabel className='text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5'>
                        Workspace Modules
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menu.map(item => {
                                if (item.type === MenuItemType.ITEM) {
                                    const isActive = currentPath === item.url || (item.url !== '/' && currentPath.startsWith(item.url));
                                    return (
                                        <SidebarMenuItem key={item.url}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive}
                                                className={`transition-colors ${
                                                    isActive
                                                        ? 'bg-primary text-white font-semibold shadow-xs hover:bg-primary hover:text-white'
                                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                }`}
                                            >
                                                <Link to={item.url} className='flex items-center gap-2.5 px-3 py-2'>
                                                    {item.icon}
                                                    <span>{typeof item.title === 'string' ? item.title : t(item.title)}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                }
                                
                                if (item.type === MenuItemType.GROUP) {
                                    return (
                                        <Collapsible
                                            key={item.title}
                                            title={typeof item.title === 'string' ? item.title : t(item.title)}
                                            defaultOpen={false}
                                            className='group/collapsible'
                                        >
                                            <SidebarGroup className='p-0'>
                                                <SidebarGroupLabel
                                                    asChild
                                                    className='group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-xs py-1.5 px-3'
                                                >
                                                    <CollapsibleTrigger>
                                                        <div className='flex items-center gap-2'>
                                                            {item.icon} {typeof item.title === 'string' ? item.title : t(item.title)}
                                                        </div>
                                                        <ChevronRight className='ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
                                                    </CollapsibleTrigger>
                                                </SidebarGroupLabel>
                                                <CollapsibleContent>
                                                    <SidebarGroupContent>
                                                        <SidebarMenu className='pl-3'>
                                                            {item.children?.map(_child => (
                                                                <SidebarMenuItem key={_child.title}>
                                                                    <SidebarMenuButton asChild className='text-xs py-1.5'>
                                                                        <Link to={_child.url}>
                                                                            {_child.icon}
                                                                            <span>{typeof _child.title === 'string' ? _child.title : t(_child.title)}</span>
                                                                        </Link>
                                                                    </SidebarMenuButton>
                                                                </SidebarMenuItem>
                                                            ))}
                                                        </SidebarMenu>
                                                    </SidebarGroupContent>
                                                </CollapsibleContent>
                                            </SidebarGroup>
                                        </Collapsible>
                                    );
                                }
                                return null;
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className='border-t border-slate-200/60 dark:border-slate-800 p-2'>
                <UserMenu />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}

export default AppSidebar;
