import { redirect } from '@tanstack/react-router';

import type { User } from '@/service/auth/auth-store';
import useAuthStore from '@/service/auth/auth-store';

export type WorkspaceId = 'buyer' | 'supplier' | 'logistics' | 'admin';

const WORKSPACE_ROLES: Record<WorkspaceId, string[]> = {
  buyer: ['BUYER', 'PURCHASER', 'CUSTOMER'],
  supplier: ['SUPPLIER', 'VENDOR', 'WAREHOUSE_MANAGER'],
  logistics: ['CARRIER', 'LOGISTICS', 'DISPATCHER', 'TRANSPORT_MANAGER'],
  admin: ['ADMIN', 'SUPER_ADMIN'],
};

export function canAccessWorkspace(user: Pick<User, 'roles'> | null | undefined, workspace: WorkspaceId): boolean {
  const roles = new Set((user?.roles ?? []).map((role) => role.toUpperCase().replace(/^ROLE_/, '')));
  return WORKSPACE_ROLES[workspace].some((role) => roles.has(role));
}

export async function requireWorkspaceAccess(workspace: WorkspaceId): Promise<void> {
  const auth = useAuthStore.getState();
  await auth.init();
  const { isAuthenticated, userData } = useAuthStore.getState();
  if (!isAuthenticated) throw redirect({ to: '/auth/login' });
  if (!canAccessWorkspace(userData, workspace)) {
    throw redirect({ to: getDefaultWorkspacePath(userData) });
  }
}

/** Pick the first workspace that matches the account's actual role. */
export function getDefaultWorkspacePath(user: Pick<User, 'roles'> | null | undefined):
  '/admin/analytics' | '/buyer/catalog' | '/logistics/map' | '/supplier/dashboard' {
  const roles = new Set((user?.roles ?? []).map((role) => role.toUpperCase().replace(/^ROLE_/, '')));

  if (roles.has('ADMIN') || roles.has('SUPER_ADMIN')) return '/admin/analytics';
  if (['CARRIER', 'LOGISTICS', 'DISPATCHER', 'TRANSPORT_MANAGER'].some((role) => roles.has(role))) {
    return '/logistics/map';
  }
  if (['SUPPLIER', 'VENDOR', 'WAREHOUSE_MANAGER'].some((role) => roles.has(role))) {
    return '/supplier/dashboard';
  }
  return '/buyer/catalog';
}
