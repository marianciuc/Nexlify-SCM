import useEnvironmentStore from '@/service/env/environment-store';

export interface RouteOptimizationRequest {
    origin: string;
    destination: string;
    vehicleType?: string;
    maxWeightKg?: number;
}

export const warehouseClient = {
    async getInventoryItems(): Promise<any[]> {
        const {getBaseUrl, currentTenant} = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/v1/inventory/items`, {
            headers: {
                ...(token ? {Authorization: `Bearer ${token}`} : {}),
                'X-Tenant-Id': currentTenant.id,
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch inventory items: ${res.statusText}`);
        }
        return res.json();
    },

    async reserveStock(sku: string, quantity: number): Promise<any> {
        const {getBaseUrl, currentTenant} = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/v1/inventory/reserve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? {Authorization: `Bearer ${token}`} : {}),
                'X-Tenant-Id': currentTenant.id,
            },
            body: JSON.stringify({sku, quantity}),
        });

        if (!res.ok) {
            throw new Error(`Failed to reserve stock: ${res.statusText}`);
        }
        return res.json();
    },

    async optimizeRoute(req: RouteOptimizationRequest): Promise<any> {
        const {getBaseUrl, currentTenant} = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/v1/logistics/optimize-routes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? {Authorization: `Bearer ${token}`} : {}),
                'X-Tenant-Id': currentTenant.id,
            },
            body: JSON.stringify(req),
        });

        if (!res.ok) {
            throw new Error(`Failed to optimize route: ${res.statusText}`);
        }
        return res.json();
    },
};

export default warehouseClient;
