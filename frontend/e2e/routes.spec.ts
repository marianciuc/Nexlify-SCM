import { expect, test } from '@playwright/test';

type Role = 'BUYER' | 'SUPPLIER' | 'CARRIER' | 'ADMIN' | null;
const routes: Array<{ path: string; role: Role }> = [
  { path: '/', role: null },
  { path: '/auth/login', role: null },
  { path: '/auth/register', role: null },
  { path: '/auth/callback?error=access_denied&error_description=Test', role: null },
  ...[
    '/buyer', '/buyer/catalog', '/buyer/catalog/SKU-PAL-01', '/buyer/cart', '/buyer/checkout',
    '/buyer/claims', '/buyer/contracts', '/buyer/invoices', '/buyer/invoices/1', '/buyer/orders',
    '/buyer/orders/11111111-1111-1111-1111-111111111111', '/buyer/requests',
    '/buyer/requests/10000000-0000-0000-0000-000000000001', '/buyer/requests/new', '/buyer/settings',
  ].map((path) => ({ path, role: 'BUYER' as const })),
  ...[
    '/supplier', '/supplier/dashboard', '/supplier/bids/board',
    '/supplier/bids/10000000-0000-0000-0000-000000000001/submit', '/supplier/edi',
    '/supplier/inventory/abc-xyz', '/supplier/inventory/map', '/supplier/inventory/transfers',
    '/supplier/orders', '/supplier/orders/11111111-1111-1111-1111-111111111111/fulfillment',
    '/supplier/pricing', '/supplier/pricing/contract-demo', '/supplier/products',
    '/supplier/products/SKU-PAL-01', '/supplier/products/new', '/supplier/scorecard', '/supplier/settings',
  ].map((path) => ({ path, role: 'SUPPLIER' as const })),
  ...[
    '/logistics', '/logistics/drivers', '/logistics/ecmr', '/logistics/fleet', '/logistics/fleet/veh-01',
    '/logistics/fleet/new', '/logistics/map', '/logistics/routes', '/logistics/routes/rot-01',
    '/logistics/routes/planner', '/logistics/settings',
  ].map((path) => ({ path, role: 'CARRIER' as const })),
  ...[
    '/admin', '/admin/analytics', '/admin/settings', '/admin/system-audit',
    '/admin/users', '/admin/users/tenant-demo', '/admin/users/verification',
  ].map((path) => ({ path, role: 'ADMIN' as const })),
];

for (const { path, role } of routes) {
  test(`route renders without runtime errors: ${path}`, async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    if (role) {
      await page.addInitScript((roles) => {
        localStorage.setItem('access_token', 'e2e-local-token');
        localStorage.setItem('user_data', JSON.stringify({
          id: 'e2e-user', email: 'e2e@example.test', firstName: 'Test', lastName: 'User', roles,
        }));
      }, [role]);
    }

    await page.goto(path);
    await expect(page.locator('#app')).not.toBeEmpty();
    await expect(page.getByText('Application Error', { exact: false })).toHaveCount(0);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    await page.setViewportSize({ width: 1440, height: 900 });
    expect(pageErrors, `uncaught errors on ${path}`).toEqual([]);
  });
}

test('workspace routes redirect unauthenticated visitors to login', async ({ page }) => {
  await page.goto('/admin/analytics');
  await expect(page).toHaveURL(/\/auth\/login/);
});

test('a buyer cannot enter the admin workspace', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('access_token', 'e2e-local-token');
    localStorage.setItem('user_data', JSON.stringify({
      id: 'buyer', email: 'buyer@example.test', firstName: 'Buyer', lastName: 'Test', roles: ['BUYER'],
    }));
  });
  await page.goto('/admin/analytics');
  await expect(page).toHaveURL(/\/buyer\/catalog/);
});
