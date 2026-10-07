import { createFileRoute } from '@tanstack/react-router';

import { WorkspaceLayout } from '@/components/navigation/WorkspaceLayout';
import { requireWorkspaceAccess } from '@/lib/workspace-routing';
import { supplierMenu } from '@/types/menu/menu';

export const Route = createFileRoute('/supplier')({
  beforeLoad: () => requireWorkspaceAccess('supplier'),
  component: SupplierRouteLayout,
  staticData: { crumb: { label: 'supplier' } },
});

function SupplierRouteLayout() {
  return (
    <WorkspaceLayout
      menu={supplierMenu}
      bannerAriaLabel="Панель управления поставщика и склада WMS (Supplier Workspace)"
    />
  );
}

export default SupplierRouteLayout;
