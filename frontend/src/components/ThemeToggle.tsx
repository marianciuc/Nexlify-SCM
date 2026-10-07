import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocale } from '@/hooks/useLocale';

export function ThemeToggle({ className }: { className?: string }) {
    const { t } = useLocale();
    const { setTheme, theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 text-slate-500 ${className || ''}`}
                aria-label={t('header.theme')}
            >
                <Sun className="h-4 w-4" />
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={`h-9 w-9 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${className || ''}`}
                    aria-label={`${t('header.theme')}: ${theme ?? ''}`}
                >
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-sky-400" />
                    <span className="sr-only">{t('header.theme')}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-xs min-w-[130px]">
                <DropdownMenuItem
                    onClick={() => setTheme('light')}
                    className={`flex items-center gap-2 cursor-pointer ${theme === 'light' ? 'font-semibold text-emerald-600 dark:text-emerald-400' : ''}`}
                >
                    <Sun className="h-3.5 w-3.5 text-amber-500" />
                    <span>{t('header.themeLight')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme('dark')}
                    className={`flex items-center gap-2 cursor-pointer ${theme === 'dark' ? 'font-semibold text-emerald-600 dark:text-emerald-400' : ''}`}
                >
                    <Moon className="h-3.5 w-3.5 text-sky-400" />
                    <span>{t('header.themeDark')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme('system')}
                    className={`flex items-center gap-2 cursor-pointer ${theme === 'system' ? 'font-semibold text-emerald-600 dark:text-emerald-400' : ''}`}
                >
                    <Monitor className="h-3.5 w-3.5 text-slate-400" />
                    <span>{t('header.themeSystem')}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default ThemeToggle;