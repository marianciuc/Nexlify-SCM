import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/buyer/catalog')({
    validateSearch: (search: Record<string, unknown>) => ({
        q: typeof search.q === 'string' ? search.q : '',
        category: typeof search.category === 'string' ? search.category : 'ALL',
        brand: typeof search.brand === 'string' ? search.brand : 'ALL',
        manufacturer: typeof search.manufacturer === 'string' ? search.manufacturer : 'ALL',
        stock: typeof search.stock === 'string' ? search.stock : 'ALL',
    }),
    component: Outlet,
    staticData: { crumb: { label: 'nav.buyer.catalog' } },
});
