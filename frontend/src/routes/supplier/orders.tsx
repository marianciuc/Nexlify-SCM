import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/supplier/orders')({
  component: Outlet,
  staticData: {
    crumb: {
      label: 'nav.supplier.fulfillment',
    },
  },
});
