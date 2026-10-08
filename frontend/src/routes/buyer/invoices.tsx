import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/buyer/invoices')({
    component: Outlet,
    staticData: { crumb: { label: 'nav.buyer.invoices' } },
});
