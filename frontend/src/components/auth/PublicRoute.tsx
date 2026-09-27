import {useNavigate} from '@tanstack/react-router';
import {useEffect} from 'react';
import type {ReactNode} from 'react';

import {useAuth} from '@/hooks/useAuthContext';

interface PublicRouteProps {
    children: ReactNode;
    redirectPath?: string;
}

export function PublicRoute({children, redirectPath = '/supplier/dashboard'}: PublicRouteProps) {
    const {isAuthenticated, isLoading} = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        // Redirect authenticated users away from public routes like login/register
        if (!isLoading && isAuthenticated) {
            navigate({to: redirectPath});
        }
    }, [isAuthenticated, isLoading, redirectPath, navigate]);

    // Show loading state
    if (isLoading) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            </div>
        );
    }

    // Don't render children if authenticated (will redirect)
    if (isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}
