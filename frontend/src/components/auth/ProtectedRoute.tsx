import {useNavigate} from '@tanstack/react-router';
import {useEffect} from 'react';
import type {ReactNode} from 'react';

import {useAuth} from '@/hooks/useAuthContext';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredScopes?: string[];
    fallbackPath?: string;
}

export function ProtectedRoute({
                                   children,
                                   requiredScopes = [],
                                   fallbackPath = '/auth/login',
                               }: ProtectedRouteProps) {
    const {isAuthenticated, isLoading, user} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate({to: fallbackPath});
            return;
        } // Check if user has required scopes
        if (
            isAuthenticated &&
            requiredScopes.length > 0 &&
            user?.securityScopes &&
            !requiredScopes.some(scope => user.securityScopes?.includes(scope))
        ) {
            // User doesn't have required permissions - redirect to home
            navigate({to: '/'});
            return;
        }
    }, [isAuthenticated, isLoading, user, requiredScopes, navigate, fallbackPath]);

    // Show loading state
    if (isLoading) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            </div>
        );
    }

    // Don't render children if not authenticated
    if (!isAuthenticated) {
        return null;
    }
    // Don't render if user doesn't have required scopes
    if (
        requiredScopes.length > 0 &&
        user?.securityScopes &&
        !requiredScopes.some(scope => user.securityScopes?.includes(scope))
    ) {
        return null;
    }

    return <>{children}</>;
}
