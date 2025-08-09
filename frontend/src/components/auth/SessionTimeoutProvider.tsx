import {useState} from 'react';
import {useTranslation} from 'react-i18next';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {useAuth} from '@/hooks/useAuthContext';
import {useSessionTimeout} from '@/hooks/useSessionTimeout';

export function SessionTimeoutProvider({children}: { children: React.ReactNode }) {
    const {t} = useTranslation();
    const {logout} = useAuth();
    const [showWarning, setShowWarning] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const {resetTimer} = useSessionTimeout({
        timeoutMinutes: 30,
        warningMinutes: 5,
        onWarning: () => setShowWarning(true),
        onTimeout: () => {
            setShowWarning(false);
            handleLogout();
        },
    });

    const handleExtendSession = () => {
        setShowWarning(false);
        resetTimer();
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
        } catch {
            // Handle logout error
        } finally {
            setIsLoggingOut(false);
            setShowWarning(false);
        }
    };

    return (
        <>
            {children}

            <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t('auth.sessionTimeout.title', 'Session Timeout Warning')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t(
                                'auth.sessionTimeout.message',
                                'Your session will expire in 5 minutes due to inactivity. Would you like to extend your session?'
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleLogout} disabled={isLoggingOut}>
                            {t('auth.sessionTimeout.logout', 'Logout Now')}
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleExtendSession} disabled={isLoggingOut}>
                            {t('auth.sessionTimeout.extend', 'Extend Session')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
