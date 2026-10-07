import { createFileRoute } from '@tanstack/react-router';

import { WorkspaceLayout } from '@/components/navigation/WorkspaceLayout';
import { requireWorkspaceAccess } from '@/lib/workspace-routing';
import { adminMenu } from '@/types/menu/menu';

export const Route = createFileRoute('/admin')({
  beforeLoad: () => requireWorkspaceAccess('admin'),
  component: AdminRouteLayout,
  staticData: { crumb: { label: 'admin' } },
});

function AdminRouteLayout() {
  return (
    <WorkspaceLayout
      menu={adminMenu}
      bannerAriaLabel="Панель администратора и комплаенс-контроля HQ (Admin Workspace)"
    />
  );
}

export default AdminRouteLayout;
