import {Outlet, createRootRoute} from '@tanstack/react-router';
import {TanStackRouterDevtools} from '@tanstack/react-router-devtools';

import AuthProvider from '../context/AuthContext.tsx';

const Root = () => {
    return (
        <AuthProvider>
            <Outlet/>
            <TanStackRouterDevtools/>
        </AuthProvider>
    );
};

export const Route = createRootRoute({
    component: Root,
});
