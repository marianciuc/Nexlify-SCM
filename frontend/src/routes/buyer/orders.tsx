import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/buyer/orders')({
    component: Outlet,
    staticData: { crumb: { label: 'nav.buyer.orders' } },
});
