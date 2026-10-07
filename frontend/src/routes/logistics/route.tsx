import { createFileRoute } from '@tanstack/react-router';

import { WorkspaceLayout } from '@/components/navigation/WorkspaceLayout';
import { requireWorkspaceAccess } from '@/lib/workspace-routing';
import { logisticsMenu } from '@/types/menu/menu';

export const Route = createFileRoute('/logistics')({
  beforeLoad: () => requireWorkspaceAccess('logistics'),
  component: LogisticsRouteLayout,
  staticData: { crumb: { label: 'logistics' } },
});

function LogisticsRouteLayout() {
  return (
    <WorkspaceLayout
      menu={logisticsMenu}
      bannerAriaLabel="Панель диспетчера транспортной логистики TMS (Logistics Workspace)"
    />
  );
}

export default LogisticsRouteLayout;
