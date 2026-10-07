import { expect, test } from '@playwright/test';

async function signInAs(page: import('@playwright/test').Page, role: string) {
  await page.addInitScript((roles) => {
    localStorage.setItem('access_token', 'e2e-local-token');
    localStorage.setItem('user_data', JSON.stringify({
      id: 'e2e-user', email: 'e2e@example.test', firstName: 'Test', lastName: 'User', roles,
    }));
  }, [role]);
}

test('demo sign-in takes a supplier to the supplier workspace', async ({ page }) => {
  await page.goto('/auth/login');
  await page.locator('input[type="email"]').fill('supplier@example.test');
  await page.locator('input[type="password"]').fill('admin');
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(/\/supplier\/dashboard/);
});

test('route planner reports API failure and shows real calculated metrics on success', async ({ page }) => {
  await signInAs(page, 'CARRIER');
  await page.route('**/routes/calculate**', (route) => route.fulfill({
    status: 503,
    contentType: 'application/json',
    body: JSON.stringify({ message: 'Service unavailable' }),
  }));
  await page.goto('/logistics/routes/planner');
  await page.getByLabel('Откуда', { exact: true }).fill('Warszawa DC');
  await page.getByLabel('Куда', { exact: true }).fill('Gdańsk Port');
  await page.getByRole('button', { name: 'Рассчитать маршрут' }).click();
  await expect(page.getByRole('alert')).toContainText('Не удалось рассчитать маршрут');

  await page.unroute('**/routes/calculate**');
  await page.route('**/routes/calculate**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ distanceKm: 120.5, timeMinutes: 105, estimatedCostPln: 640, co2EmissionsKg: 22.4 }),
  }));
  await page.getByRole('button', { name: 'Рассчитать маршрут' }).click();
  await expect(page.getByRole('region', { name: 'Результат расчёта' })).toContainText('120,5 км');
  await expect(page.getByRole('region', { name: 'Результат расчёта' })).toContainText('640 PLN');
});

test('a new buyer reaches checkout with an empty basket and a clear next step', async ({ page }) => {
  await signInAs(page, 'BUYER');
  await page.goto('/buyer/checkout');
  await expect(page.getByRole('heading', { name: 'Корзина пуста' })).toBeVisible();
  await expect(page.getByRole('link', { name: /перейти в каталог/i })).toBeVisible();
});

test('buyer can search by SKU/name, edit MOQ quantity, and add the result to the cart', async ({ page }) => {
  await signInAs(page, 'BUYER');
  await page.goto('/buyer/catalog');
  const search = page.getByRole('searchbox', { name: 'Поиск товаров' });
  await search.fill('EPAL');
  await expect(page).toHaveURL(/q=EPAL/);

  const product = page.getByRole('row').filter({ hasText: 'SKU-PAL-01' });
  await expect(product).toBeVisible();
  const quantity = product.getByRole('spinbutton');
  await quantity.fill('37');
  await product.getByRole('button', { name: 'Добавить' }).click();
  await expect(page.getByRole('link', { name: /открыть корзину, 1/i })).toBeVisible();
  await page.getByRole('link', { name: /открыть корзину, 1/i }).click();
  await expect(page.getByRole('spinbutton', { name: /количество epal/i })).toHaveValue('37');
});

test('catalog adapts between table and compact list across viewport sizes', async ({ page }) => {
  await signInAs(page, 'BUYER');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/buyer/catalog');
  await page.getByRole('searchbox', { name: 'Поиск товаров' }).fill('SKU-PAL-01');
  const tableToggle = page.getByRole('button', { name: /таблица/i });
  const productLink = page.getByRole('link', { name: /EPAL Euro-Pallet Standard/ });
  const productAction = page.getByRole('button', { name: /Добавить EPAL Euro-Pallet Standard.*в корзину/ });

  for (const width of [1440, 1280, 1024, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByRole('searchbox', { name: 'Поиск товаров' })).toBeVisible();
    if (width > 1100) {
      await expect(tableToggle).toBeVisible();
      await expect(page.getByRole('row').filter({ hasText: 'SKU-PAL-01' })).toBeVisible();
    } else {
      await expect(tableToggle).not.toBeVisible();
      await expect(productLink).toBeVisible();
      await expect(productAction).toBeVisible();
    }
  }
});

test('buyer creates and publishes an RFQ with its line item through the API', async ({ page }) => {
  await signInAs(page, 'BUYER');
  let createdPayload: Record<string, unknown> | undefined;
  await page.route('**/api/v1/rfq', async (route) => {
    if (route.request().method() !== 'POST') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: [] }) });
    createdPayload = route.request().postDataJSON();
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ id: 'e2e-rfq', rfqNumber: 'RFQ-E2E-1', status: 'DRAFT', items: [{ id: 'e2e-line-1' }] }),
    });
  });
  await page.route('**/api/v1/rfq/e2e-rfq/publish', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ id: 'e2e-rfq', rfqNumber: 'RFQ-E2E-1', status: 'OPEN' }),
  }));

  await page.goto('/buyer/requests/new');
  await page.getByLabel('Наименование тендера:').fill('Закупка упаковки');
  await page.getByLabel('Логистический хаб назначения:').fill('ул. Тестовая 10, Gdańsk');
  await page.getByLabel('Срок подачи предложений:').fill('2026-10-20');
  await page.getByLabel('Item name 1').fill('Европоддон EPAL');
  await page.getByLabel('SKU code item 1').fill('SKU-E2E-PAL');
  await page.getByLabel('Quantity item 1').fill('25');
  await page.getByLabel('Target price item 1').fill('40');
  await page.getByRole('button', { name: /опубликовать тендер/i }).click();
  await expect(page).toHaveURL(/\/buyer\/requests$/);
  expect(createdPayload).toMatchObject({
    title: 'Закупка упаковки',
    budgetAmount: 1000,
    items: [{ sku: 'SKU-E2E-PAL', productName: 'Европоддон EPAL', quantity: 25, unitOfMeasure: 'pcs' }],
  });
});

test('buyer can complete checkout choices with keyboard and creates an order through the API', async ({ page }) => {
  await signInAs(page, 'BUYER');
  await page.addInitScript(() => {
    localStorage.setItem('nexlify-buyer-cart', JSON.stringify({
      state: { items: [{
        sku: 'SKU-E2E-1', name: 'E2E paper', category: 'Paper', unitPrice: 10, quantity: 2, moq: 1,
        unit: 'pcs', vendorId: 'vendor-e2e', vendorName: 'Test supplier', vendorNip: '0000000000',
        weightKg: 1, volumeM3: 0.1,
      }] }, version: 0,
    }));
  });
  let submittedOrder: Record<string, unknown> | undefined;
  await page.route('**/api/v1/orders', async (route) => {
    if (route.request().method() === 'POST') {
      submittedOrder = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'e2e-order', orderNumber: 'ORD-E2E-1', status: 'DRAFT', totalAmount: 24.6 }),
      });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: [] }) });
  });
  await page.goto('/buyer/checkout');

  await page.getByLabel('Адрес склада или точки приёмки').fill('ul. Testowa 10');
  await page.getByLabel('Город').fill('Gdańsk');
  await page.getByRole('button', { name: /перейти к условиям доставки/i }).click();

  const incoterms = page.locator('input[name="incoterms"]');
  await incoterms.first().focus();
  await page.keyboard.press('ArrowDown');
  await expect(incoterms.nth(1)).toBeChecked();
  await page.getByLabel(/нужен гидроборт/i).check();
  await page.getByRole('button', { name: /к условиям оплаты/i }).click();

  const payment = page.locator('input[name="payment-method"]');
  await payment.first().focus();
  await page.keyboard.press('ArrowDown');
  await expect(payment.nth(1)).toBeChecked();
  await page.getByRole('button', { name: /проверить заказ/i }).click();
  await page.getByRole('button', { name: /создать заказ/i }).click();
  await expect(page).toHaveURL(/\/buyer\/orders/);
  expect(submittedOrder).toMatchObject({ deliveryCity: 'Gdańsk', deliveryAddress: 'ul. Testowa 10' });
  expect((submittedOrder?.notes as string)).toContain('EXW');
});
