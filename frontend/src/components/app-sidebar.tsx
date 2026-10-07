import { Link, useRouterState } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';
import * as React from 'react';

import { WorkspaceViewSwitcher } from '@/components/navigation/WorkspaceViewSwitcher';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useLocale } from '@/hooks/useLocale';
import { MenuItemType, type Item } from '@/types/menu/types';

export function AppSidebar({
  menu,
  ...props
}: React.ComponentProps<typeof Sidebar> & { menu: Item[] }) {
  const { t } = useLocale();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const renderLabel = (raw: string) => t(raw as Parameters<typeof t>[0]);

  return (
    <Sidebar {...props} className="border-r border-sidebar-border">
      {/* Sidebar Branding Header */}
      <SidebarHeader className="border-b border-sidebar-border p-3.5 space-y-3">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-extrabold text-sm shadow-2xs">
            N
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-sidebar-foreground">
              Nexlify-SCM
            </span>
            <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[150px]">
              {t('workspace.buyer.subtitle')}
            </span>
          </div>
        </Link>

        {/* Interactive Workspace View Switcher */}
        <WorkspaceViewSwitcher variant="sidebar" />
      </SidebarHeader>

      <SidebarContent className="gap-0 py-2">
        <SidebarGroup className="pb-2">
          <SidebarGroupLabel className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-1.5">
            {t('nav.sections')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menu.map((item) => {
                if (item.type === MenuItemType.ITEM) {
                  const isActive = currentPath === item.url || (item.url !== '/' && currentPath.startsWith(item.url));
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={`transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground font-semibold shadow-xs hover:bg-primary hover:text-primary-foreground'
                            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-2.5 px-3 py-2">
                          {item.icon}
                          <span>{renderLabel(item.title)}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                if (item.type === MenuItemType.GROUP) {
                  return (
                    <Collapsible
                      key={item.title}
                      title={renderLabel(item.title)}
                      defaultOpen={item.children?.some(
                        (child) => currentPath === child.url || currentPath.startsWith(`${child.url}/`)
                      ) ?? false}
                      className="group/collapsible"
                    >
                      <SidebarGroup className="p-0">
                        <SidebarGroupLabel
                          asChild
                          className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-xs py-1.5 px-3"
                        >
                          <CollapsibleTrigger>
                            <div className="flex items-center gap-2">
                              {item.icon} {renderLabel(item.title)}
                            </div>
                            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                          </CollapsibleTrigger>
                        </SidebarGroupLabel>
                        <CollapsibleContent>
                          <SidebarGroupContent>
                            <SidebarMenu className="pl-3">
                              {item.children?.map((_child) => {
                                const isChildActive =
                                  currentPath === _child.url || currentPath.startsWith(`${_child.url}/`);
                                return (
                                  <SidebarMenuItem key={_child.url}>
                                    <SidebarMenuButton
                                      asChild
                                      isActive={isChildActive}
                                      className="text-xs py-1.5 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                    >
                                      <Link to={_child.url} aria-current={isChildActive ? 'page' : undefined}>
                                        {_child.icon}
                                        <span>{renderLabel(_child.title)}</span>
                                      </Link>
                                    </SidebarMenuButton>
                                  </SidebarMenuItem>
                                );
                              })}
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

      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;