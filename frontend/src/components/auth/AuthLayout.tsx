import { Link } from '@tanstack/react-router';
import React from 'react';

import { NexlifyIcon } from '@/components/brand/NexlifyLogo';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useLocale } from '@/hooks/useLocale';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Header - exactly matching WorkspaceHome and project header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-sm font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <NexlifyIcon size={32} />
          Nexlify SCM
        </Link>
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center bg-muted/30 px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-4 px-4 sm:px-6 text-center text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Nexlify SCM Enterprise Platform</span>
        <span>© {new Date().getFullYear()} Nexlify Logistics</span>
      </footer>
    </div>
  );
}

export default AuthLayout;
