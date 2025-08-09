import {Globe} from 'lucide-react';
import React from 'react';

import {useLocale} from '../hooks/useLocale';
import {LOCALE_NAMES, SUPPORTED_LOCALES, type Locale} from '../types/generated-locale';

import {Button} from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';

export const LanguageSwitcher: React.FC = () => {
    const {locale, setLocale} = useLocale();

    const handleLocaleChange = (newLocale: Locale) => {
        setLocale(newLocale);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant='outline' size='sm' className='gap-2'>
                    <Globe className='h-4 w-4'/>
                    {LOCALE_NAMES[locale]}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
                {SUPPORTED_LOCALES.map(supportedLocale => (
                    <DropdownMenuItem
                        key={supportedLocale}
                        onClick={() => handleLocaleChange(supportedLocale)}
                        className={locale === supportedLocale ? 'bg-accent' : ''}
                    >
                        {LOCALE_NAMES[supportedLocale]}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
