import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/supplier/products')({
    component: Outlet,
    staticData: { crumb: { label: 'nav.supplier.products' } },
});
