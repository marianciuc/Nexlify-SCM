import useEnvironmentStore from '@/service/env/environment-store';

export interface OrderItemPayload {
    sku: string;
    name: string;
    quantity: number;
    unitPrice: number;
}

export interface CreateOrderPayload {
    customerName: string;
    deliveryCity: string;
    items: OrderItemPayload[];
}

export const storeClient = {
    async getOrders(): Promise<any[]> {
        const {getBaseUrl, currentTenant} = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/v1/orders`, {
            headers: {
                ...(token ? {Authorization: `Bearer ${token}`} : {}),
                'X-Tenant-Id': currentTenant.id,
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch orders: ${res.statusText}`);
        }
        return res.json();
    },

    async createOrder(payload: CreateOrderPayload): Promise<any> {
        const {getBaseUrl, currentTenant} = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/v1/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? {Authorization: `Bearer ${token}`} : {}),
                'X-Tenant-Id': currentTenant.id,
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            throw new Error(`Failed to create order: ${res.statusText}`);
        }
        return res.json();
    },

    async getInvoices(): Promise<any[]> {
        const {getBaseUrl, currentTenant} = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/v1/billing/invoices`, {
            headers: {
                ...(token ? {Authorization: `Bearer ${token}`} : {}),
                'X-Tenant-Id': currentTenant.id,
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch invoices: ${res.statusText}`);
        }
        return res.json();
    },
};

export default storeClient;
