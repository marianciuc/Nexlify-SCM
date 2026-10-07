import { Globe } from 'lucide-react';
import React from 'react';

import { useLocale } from '../hooks/useLocale';
import { LOCALE_NAMES, SUPPORTED_LOCALES, type Locale } from '../types/generated-locale';

import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';

export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className }) => {
    const { t, locale, setLocale } = useLocale();

    const handleLocaleChange = (newLocale: Locale) => {
        setLocale(newLocale);
    };

    const shortCode = locale ? locale.toUpperCase() : 'EN';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={`h-9 px-2 gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${className || ''}`}
                    aria-label={t('header.languageCurrent', { name: LOCALE_NAMES[locale] ?? shortCode })}
                >
                    <Globe className="h-4 w-4 text-slate-500" />
                    <span className="font-semibold">{shortCode}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-xs min-w-[160px]">
                {SUPPORTED_LOCALES.map((supportedLocale) => (
                    <DropdownMenuItem
                        key={supportedLocale}
                        onClick={() => handleLocaleChange(supportedLocale)}
                        className={`cursor-pointer ${
                            locale === supportedLocale
                                ? 'font-bold text-emerald-600 dark:text-emerald-400 bg-slate-50 dark:bg-slate-900'
                                : ''
                        }`}
                    >
                        <span>{LOCALE_NAMES[supportedLocale]}</span>
                        <span className="ml-auto font-mono text-[10px] text-muted-foreground uppercase">
                            {supportedLocale}
                        </span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default LanguageSwitcher;