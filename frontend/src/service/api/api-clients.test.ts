import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';

import {dashboardClient} from './clients/dashboard-client';
import {storeClient} from './clients/store-client';
import {warehouseClient} from './clients/warehouse-client';
import useEnvironmentStore from '../env/environment-store';

describe('API clients unit tests', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        localStorage.clear();
        useEnvironmentStore.setState({
            currentEnvironment: 'development',
        });
        localStorage.setItem('access_token', 'opq_acc_mock_test_token');
    });

    afterEach(() => {
        global.fetch = originalFetch;
        vi.restoreAllMocks();
    });

    describe('storeClient', () => {
        it('should send GET /api/v1/orders with Bearer token and X-Tenant-Id', async () => {
            const mockOrders = [{id: 'ord-1', orderNumber: 'ORD-2026-001'}];
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => mockOrders,
            });

            const data = await storeClient.getOrders();
            expect(data).toEqual(mockOrders);

            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:8080/api/v1/orders',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer opq_acc_mock_test_token',
                        'X-Tenant-Id': 'ten-waw-01',
                    }),
                })
            );
        });

        it('should throw an error when server returns non-ok status', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                statusText: 'Internal Server Error',
            });

            await expect(storeClient.getOrders()).rejects.toThrow('Failed to fetch orders: Internal Server Error');
        });

        it('should send POST /api/v1/orders with payload and JSON headers', async () => {
            const payload = {
                customerName: 'Baltic Retail S.A.',
                deliveryCity: 'Gdańsk',
                items: [{sku: 'SKU-01', name: 'Pallet', quantity: 10, unitPrice: 100}],
            };

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({id: 'new-id', ...payload}),
            });

            const result = await storeClient.createOrder(payload);
            expect(result.id).toBe('new-id');

            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:8080/api/v1/orders',
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer opq_acc_mock_test_token',
                        'X-Tenant-Id': 'ten-waw-01',
                    }),
                    body: JSON.stringify(payload),
                })
            );
        });
    });

    describe('warehouseClient', () => {
        it('should send POST /api/v1/inventory/reserve for stock reservation', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({success: true, reservedSku: 'SKU-PAL-01'}),
            });

            const result = await warehouseClient.reserveStock('SKU-PAL-01', 50);
            expect(result.success).toBe(true);

            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:8080/api/v1/inventory/reserve',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({sku: 'SKU-PAL-01', quantity: 50}),
                })
            );
        });

        it('should send POST /api/v1/logistics/optimize-routes for GraphHopper VRP dispatch', async () => {
            const routeReq = {
                origin: 'Warszawa Central DC (DC-01)',
                destination: 'Szczecin Port Logistics Hub (DC-03)',
            };

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({distanceKm: 565.2, durationHours: 6.2, costPln: 2940.0, co2Kg: 68.4}),
            });

            const result = await warehouseClient.optimizeRoute(routeReq);
            expect(result.distanceKm).toBe(565.2);
            expect(result.co2Kg).toBe(68.4);
        });
    });

    describe('dashboardClient', () => {
        it('should fetch OTIF and SLA KPIs from /api/v1/analytics/kpi', async () => {
            const mockKpis = {otifRate: 98.4, serviceLevelSla: 99.2};
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => mockKpis,
            });

            const data = await dashboardClient.getKpis();
            expect(data.otifRate).toBe(98.4);
            expect(data.serviceLevelSla).toBe(99.2);
        });
    });

    describe('microservice clients', () => {
        it('ordersClient should submit and cancel orders', async () => {
            const { ordersClient } = await import('./clients/orders-client');
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ id: 'ord-123', status: 'SUBMITTED' }),
            });

            const res = await ordersClient.submitOrder('ord-123');
            expect(res.status).toBe('SUBMITTED');
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:8080/api/v1/orders/ord-123/submit',
                expect.objectContaining({ method: 'POST' })
            );

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ id: 'ord-123', status: 'CANCELLED' }),
            });
            const cancelRes = await ordersClient.cancelOrder('ord-123', 'Price changed');
            expect(cancelRes.status).toBe('CANCELLED');
        });

        it('billingClient should fetch and pay invoices with Split Payment', async () => {
            const { billingClient } = await import('./clients/billing-client');
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ success: true, paymentStatus: 'PAID' }),
            });

            const payRes = await billingClient.payInvoice('inv-01', 'SPLIT_PAYMENT');
            expect(payRes.paymentStatus).toBe('PAID');
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:8080/api/v1/billing/invoices/inv-01/pay?paymentMethod=SPLIT_PAYMENT',
                expect.objectContaining({
                    method: 'POST',
                })
            );
        });

        it('logisticsClient should dispatch shipments and call GraphHopper VRP', async () => {
            const { logisticsClient } = await import('./clients/logistics-client');
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ id: 'shp-1', status: 'DISPATCHED' }),
            });

            const dispRes = await logisticsClient.dispatchShipment('shp-1');
            expect(dispRes.status).toBe('DISPATCHED');

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ distanceKm: 340, timeMinutes: 270, estimatedCostPln: 1500, co2EmissionsKg: 42 }),
            });
            const optRes = await logisticsClient.calculateRoute({ origin: 'Warszawa', destination: 'Gdańsk' });
            expect(optRes.distanceKm).toBe(340);
        });

        it('rfqClient should fetch tenders and award bids', async () => {
            const { rfqClient } = await import('./clients/rfq-client');
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ content: [{ id: 'rfq-1', title: 'Pallets' }] }),
            });

            const rfqs = await rfqClient.getBuyerRfqs();
            expect(rfqs.content).toHaveLength(1);

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ id: 'rfq-1', status: 'AWARDED' }),
            });
            const awardRes = await rfqClient.awardBid('rfq-1', 'bid-1');
            expect(awardRes.status).toBe('AWARDED');
        });

        it('analyticsClient should fetch KPI snapshot and OTIF trends', async () => {
            const { analyticsClient } = await import('./clients/analytics-client');
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ otifRate: 98.4, totalSpendPln: 2500000 }),
            });

            const kpis = await analyticsClient.getKpiSnapshot();
            expect(kpis.otifRate).toBe(98.4);

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => [{ period: '2026-09', otif: 98.4 }],
            });
            const trends = await analyticsClient.getOtifTrends();
            expect(trends).toHaveLength(1);
        });
    });
});
