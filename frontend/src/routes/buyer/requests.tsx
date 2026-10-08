import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/buyer/requests')({
    component: Outlet,
    staticData: { crumb: { label: 'nav.buyer.rfq' } },
});
