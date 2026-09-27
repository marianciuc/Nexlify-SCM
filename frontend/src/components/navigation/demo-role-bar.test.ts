import { describe, it, expect, beforeEach } from 'vitest';
import { DEMO_ROLES } from './DemoRoleBar';
import useAuthStore from '@/service/auth/auth-store';
import useEnvironmentStore from '@/service/env/environment-store';

describe('DemoRoleBar configuration and role models', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().logout();
  });

  it('should define exactly 4 key enterprise demo roles', () => {
    expect(DEMO_ROLES).toHaveLength(4);
    const roleIds = DEMO_ROLES.map((r) => r.id);
    expect(roleIds).toEqual(['buyer', 'supplier', 'logistics', 'admin']);
  });

  it('should provide Polish enterprise company names and NIPs for all roles', () => {
    DEMO_ROLES.forEach((role) => {
      expect(role.companyName).toBeTruthy();
      expect(role.nip).toMatch(/^\d{10}$/); // 10-digit NIP
      expect(role.persona).toBeTruthy();
      expect(role.roleCode).toMatch(/^ROLE_/);
      expect(role.targetRoute).toMatch(/^\//);
    });
  });

  it('should switch role and update simulated user and tenant', () => {
    const buyerRole = DEMO_ROLES[0]!;
    useEnvironmentStore.getState().setTenant({
      id: `ten-${buyerRole.id}-01`,
      name: buyerRole.companyName,
      nip: buyerRole.nip,
      country: 'PL',
      warehouseCode: `WH-${buyerRole.id.toUpperCase()}-01`,
      warehouseName: `${buyerRole.companyName} Central Hub`,
    });

    useAuthStore.setState({
      userData: {
        id: `usr-${buyerRole.id}-01`,
        email: `${buyerRole.id}@nexlify-scm.pl`,
        firstName: 'Tomasz',
        lastName: 'Kowalski',
        companyName: buyerRole.companyName,
        roles: [buyerRole.roleCode],
      },
      isAuthenticated: true,
      accessToken: 'test-token',
    });

    expect(useEnvironmentStore.getState().currentTenant.name).toBe(buyerRole.companyName);
    expect(useAuthStore.getState().userData?.roles).toContain('ROLE_BUYER');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });
});
