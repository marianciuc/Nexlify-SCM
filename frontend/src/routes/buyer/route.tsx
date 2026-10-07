import { createFileRoute } from '@tanstack/react-router';

import { WorkspaceLayout } from '@/components/navigation/WorkspaceLayout';
import { requireWorkspaceAccess } from '@/lib/workspace-routing';
import { buyerMenu } from '@/types/menu/menu';

export const Route = createFileRoute('/buyer')({
  beforeLoad: () => requireWorkspaceAccess('buyer'),
  component: BuyerRouteLayout,
  staticData: { crumb: { label: 'buyer' } },
});

function BuyerRouteLayout() {
  return (
    <WorkspaceLayout
      menu={buyerMenu}
      bannerAriaLabel="Панель управления закупками и снабжением (Buyer Workspace)"
    />
  );
}

export default BuyerRouteLayout;
