import { Outlet, Link, useRouterState } from '@tanstack/react-router';
import { ShoppingCart } from 'lucide-react';

import { AppSidebar } from '@/components/app-sidebar';
import { UserMenu } from '@/components/auth/UserMenu';
import Breadcrumbs from '@/components/breadcrumbs';
import { NotificationBell } from '@/components/navigation/NotificationBell';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useLocale } from '@/hooks/useLocale';
import { useCartStore } from '@/service/cart/cart-store';
import type { Item } from '@/types/menu/types';

interface WorkspaceLayoutProps {
  menu: Item[];
  bannerAriaLabel: string;
}

export function WorkspaceLayout({ menu, bannerAriaLabel }: WorkspaceLayoutProps) {
  const { t } = useLocale();
  const cartItemsCount = useCartStore((s) => s.getTotalItemsCount());
  const currentPath = useRouterState({ select: (state) => state.location.pathname });
  const isBuyerWorkspace = currentPath.startsWith('/buyer');

  return (
    <SidebarProvider>
      {/* Accessibility: Skip to Content Link */}
      <a href="#main-content" className="skip-to-content">
        {t('header.skipToContent')}
      </a>

      <AppSidebar menu={menu} />

      <SidebarInset className="min-w-0 flex flex-col flex-1">
        <header
          role="banner"
          aria-label={bannerAriaLabel}
          className="bg-background/95 backdrop-blur-md sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-3 border-b px-3 sm:px-4 transition-colors min-w-0"
        >
          {/* Left: Sidebar toggle & Hierarchical Breadcrumbs */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <SidebarTrigger
              className="-ml-1 shrink-0"
              aria-label={t('header.toggleSidebar')}
            />
            <Separator orientation="vertical" className="mr-2 h-4 shrink-0" />
            <div className="truncate min-w-0">
              <Breadcrumbs />
            </div>
          </div>

          {/* Workspace actions and account controls */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {isBuyerWorkspace && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 px-2.5 text-xs font-medium border-border shadow-2xs hover:bg-accent"
              >
                <Link
                  to="/buyer/cart"
                  aria-label={t('header.cartAria', { count: cartItemsCount })}
                >
                  <ShoppingCart className="h-3.5 w-3.5 text-foreground" />
                  <span className="hidden md:inline font-medium">
                    {cartItemsCount > 0
                      ? t('header.cartWithCount', { count: cartItemsCount })
                      : t('header.cart')}
                  </span>
                  {cartItemsCount > 0 && (
                    <Badge
                      variant="default"
                      className="h-4 px-1 text-[10px] font-mono font-bold bg-primary text-primary-foreground ml-0.5"
                    >
                      {cartItemsCount}
                    </Badge>
                  )}
                </Link>
              </Button>
            )}

            {isBuyerWorkspace && (
              <Separator orientation="vertical" className="h-4 hidden sm:block" />
            )}

            <ThemeToggle />
            <NotificationBell />
            <Separator orientation="vertical" className="h-4" />
            <UserMenu variant="header" />
          </div>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          role="main"
          className="flex-1 p-3 sm:p-5 lg:p-6 overflow-y-auto overflow-x-hidden min-w-0 bg-muted/20 min-h-[calc(100vh-3.5rem)] outline-none"
        >
          <div className="max-w-7xl mx-auto w-full min-w-0">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default WorkspaceLayout;