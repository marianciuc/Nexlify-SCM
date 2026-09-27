import {useNavigate} from '@tanstack/react-router';
import {useEffect} from 'react';

import useAuthStore from '@/service/auth/auth-store';
import {SecurityScope} from '@/types/api';

export function useAuthRoute(requiredScopes?: SecurityScope[]) {
    const {isAuthenticated, isLoading, hasPermissions} = useAuthStore();
    const navigate = useNavigate();

    const hasRequiredScopes = requiredScopes && requiredScopes.length > 0 
        ? hasPermissions(requiredScopes) 
        : true;

    const shouldShowContent = isAuthenticated && hasRequiredScopes;

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate({to: '/auth/login'});
        }
    }, [isLoading, isAuthenticated, navigate]);

    return {
        isLoading,
        isAuthenticated,
        hasRequiredScopes,
        shouldShowContent,
    };
}
