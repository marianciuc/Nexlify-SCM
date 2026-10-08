import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/logistics/routes')({
    component: Outlet,
    staticData: { crumb: { label: 'nav.logistics.routes' } },
});
