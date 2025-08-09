import {LogOut, Settings, User} from 'lucide-react';
import {useTranslation} from 'react-i18next';

import {Button} from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import useAuthStore from '../../service/auth/auth-store';

export function UserMenu() {
    const {userData, logout} = useAuthStore();
    const {t} = useTranslation();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='w-full justify-start'>
                    <User className='mr-2 h-4 w-4'/>
                    <span className='truncate'>{userData?.email}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
                <DropdownMenuLabel className='font-normal'>
                    <div className='flex flex-col space-y-1'>
                        <p className='text-sm font-medium leading-none'>{userData?.id}</p>
                        <p className='text-xs leading-none text-muted-foreground'>{userData?.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator/>
                <DropdownMenuItem>
                    <Settings className='mr-2 h-4 w-4'/>
                    <span>{t('menu.settings')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator/>
                <DropdownMenuItem onClick={logout}>
                    <LogOut className='mr-2 h-4 w-4'/>
                    <span>{t('auth.logout')}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
