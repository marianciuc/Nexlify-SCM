import {Outlet, createRootRoute} from '@tanstack/react-router';
import {TanStackRouterDevtools} from '@tanstack/react-router-devtools';

import AuthProvider from '../context/AuthContext.tsx';
import DemoRoleBar from '../components/navigation/DemoRoleBar.tsx';

const Root = () => {
    return (
        <AuthProvider>
            <Outlet/>
            <DemoRoleBar/>
            <TanStackRouterDevtools/>
        </AuthProvider>
    );
};

export const Route = createRootRoute({
    component: Root,
});
