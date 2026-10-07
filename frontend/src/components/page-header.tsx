import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
    /** Already-translated title or any inline element (e.g. icon + text) */
    title: React.ReactNode;
    /** Already-translated optional subtitle */
    subtitle?: React.ReactNode;
    /** Right-aligned actions (buttons, filters, etc.) */
    actions?: React.ReactNode;
    /** Optional breadcrumb slot rendered above title */
    eyebrow?: React.ReactNode;
    className?: string;
}

/**
 * Page header — establishes the primary content area for a route.
 * Uses semantic h1 + secondary subtitle so screen readers and visual
 * hierarchy are aligned.
 */
export function PageHeader({ title, subtitle, actions, eyebrow, className }: PageHeaderProps) {
    return (
        <header
            className={cn(
                'flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between',
                className
            )}
        >
            <div className="min-w-0">
                {eyebrow}
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {title}
                </h1>
                {subtitle && (
                    <p className="mt-1 text-sm text-muted-foreground">
                        {subtitle}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {actions}
                </div>
            )}
        </header>
    );
}