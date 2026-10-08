import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/logistics/fleet')({
  component: Outlet,
  staticData: {
    crumb: {
      label: 'nav.logistics.fleet',
    },
  },
});
