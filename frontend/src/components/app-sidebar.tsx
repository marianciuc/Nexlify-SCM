import {ChevronRight, Menu} from 'lucide-react';
import * as React from 'react';

import {UserMenu} from '@/components/auth/UserMenu';
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from '@/components/ui/collapsible';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar';

import {useLocale} from '../hooks/useLocale';
import {MenuItemType, type Item} from '../types/menu/types';

export function AppSidebar({
                               menu,
                               ...props
                           }: React.ComponentProps<typeof Sidebar> & { menu: Item[] }) {
    const {t} = useLocale();

    return (
        <Sidebar {...props}>
            <SidebarContent className='gap-0'>
                {menu.map(item =>
                    item.type === MenuItemType.GROUP ? (
                        <Collapsible
                            key={item.title}
                            title={item.title}
                            defaultOpen
                            className='group/collapsible'
                        >
                            <SidebarGroup>
                                <SidebarGroupLabel
                                    asChild
                                    className='group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm'
                                >
                                    <CollapsibleTrigger>
                                        <div className='flex items-center gap-2'>
                                            {item.icon} {t(item.title)}
                                        </div>
                                        <ChevronRight
                                            className='ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90'/>
                                    </CollapsibleTrigger>
                                </SidebarGroupLabel>
                                <CollapsibleContent>
                                    <SidebarGroupContent>
                                        <SidebarMenu>
                                            {item.children?.map(_child => (
                                                <SidebarMenuItem key={_child.title}>
                                                    <SidebarMenuButton asChild>
                                                        <a href={_child.url}>
                                                            {_child.icon}
                                                            {t(_child.title)}
                                                        </a>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            ))}
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </CollapsibleContent>
                            </SidebarGroup>
                        </Collapsible>
                    ) : (
                        <SidebarMenu key={item.title} className='group/item'>
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild>
                                    <a href={item.url}>
                                        {item.icon}
                                        {t(item.title)}
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    )
                )}
            </SidebarContent>
            <SidebarFooter>
                <UserMenu/>
            </SidebarFooter>
            <SidebarRail/>
        </Sidebar>
    );
}
