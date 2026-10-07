import {Outlet, createRootRoute} from '@tanstack/react-router';
import {TanStackRouterDevtools} from '@tanstack/react-router-devtools';

import DemoRoleBar from '../components/navigation/DemoRoleBar.tsx';
import AuthProvider from '../context/AuthContext.tsx';

const Root = () => {
    return (
        <AuthProvider>
            <Outlet/>
            <DemoRoleBar/>
            {import.meta.env.DEV && <TanStackRouterDevtools/>}
        </AuthProvider>
    );
};

export const Route = createRootRoute({
    component: Root,
});
