import useEnvironmentStore from '@/service/env/environment-store';

export interface RouteCalculationPayload {
    origin: string;
    destination: string;
    optimalProfile?: string;
}

export interface RouteCalculationResult {
    distanceKm: number;
    timeMinutes: number;
    co2EmissionsKg: number;
    estimatedCostPln: number;
    profile: string;
    viaExpressways: boolean;
    tollRoadsUsed: boolean;
}

export const logisticsClient = {
    async getShipments(status?: string, page: number = 0, size: number = 20): Promise<any> {
        const { getBaseUrl, currentTenant } = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
        if (status) params.set('status', status);

        const res = await fetch(`${getBaseUrl()}/api/v1/logistics/shipments?${params.toString()}`, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'X-Tenant-Id': currentTenant.id,
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch shipments: ${res.statusText}`);
        }
        return res.json();
    },

    async getShipmentById(id: string): Promise<any> {
        const { getBaseUrl, currentTenant } = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/v1/logistics/shipments/${id}`, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'X-Tenant-Id': currentTenant.id,
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch shipment ${id}: ${res.statusText}`);
        }
        return res.json();
    },

    async dispatchShipment(id: string): Promise<any> {
        const { getBaseUrl, currentTenant } = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/v1/logistics/shipments/${id}/dispatch`, {
            method: 'PATCH',
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'X-Tenant-Id': currentTenant.id,
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to dispatch shipment: ${res.statusText}`);
        }
        return res.json();
    },

    async calculateRoute(payload: RouteCalculationPayload): Promise<RouteCalculationResult> {
        const { getBaseUrl, currentTenant } = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/v1/logistics/routes/calculate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'X-Tenant-Id': currentTenant.id,
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            throw new Error(`Failed to calculate GraphHopper route: ${res.statusText}`);
        }
        return res.json();
    },

    async getFleet(): Promise<any[]> {
        const { getBaseUrl, currentTenant } = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/v1/logistics/fleet`, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'X-Tenant-Id': currentTenant.id,
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch fleet: ${res.statusText}`);
        }
        return res.json();
    },
};

export default logisticsClient;
