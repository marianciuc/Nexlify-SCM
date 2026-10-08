import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/supplier/pricing')({
  component: Outlet,
  staticData: {
    crumb: {
      label: 'nav.supplier.pricing',
    },
  },
});
