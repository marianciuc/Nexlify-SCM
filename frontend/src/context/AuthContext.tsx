import {useMatchRoute, useNavigate} from '@tanstack/react-router';
import {useEffect, useState, type ReactNode} from 'react';

import useAuthStore from '@/service/auth/auth-store';

const AuthProvider = ({children}: { children: ReactNode }) => {
    const {isAuthenticated} = useAuthStore();
    const matchRoute = useMatchRoute();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        useAuthStore
            .getState()
            .init()
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        if (
            !isAuthenticated &&
            !matchRoute({
                to: '/auth/login',
            }) &&
            !matchRoute({
                to: '/auth/register',
            }) &&
            !matchRoute({to: '/'})
        ) {
            navigate({to: '/auth/login'});
        }
        if (
            (isAuthenticated && matchRoute({to: '/auth/login'})) ||
            matchRoute({to: '/auth/register'})
        ) {
            navigate({to: '/dashboard'});
        }
    }, [isAuthenticated, matchRoute, navigate]);

    if (isLoading) {
        return <div className='flex items-center justify-center h-screen'>Loading...</div>;
    }

    return <> {children}</>;
};

export default AuthProvider;
