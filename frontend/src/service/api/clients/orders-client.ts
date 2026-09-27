import useEnvironmentStore from '@/service/env/environment-store';

export interface OrderItemPayload {
    sku: string;
    productName: string;
    quantity: number;
    unitPrice: number;
}

export interface CreateOrderPayload {
    customerId?: string;
    supplierId?: string;
    deliveryAddress: string;
    deliveryCity: string;
    currency?: string;
    incoterms?: string;
    paymentTerms?: string;
    items: OrderItemPayload[];
}

export const ordersClient = {
    async getOrders(params?: { status?: string; page?: number; size?: number }): Promise<any> {
        const { getBaseUrl, currentTenant } = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.set('status', params.status);
        if (params?.page !== undefined) queryParams.set('page', params.page.toString());
        if (params?.size !== undefined) queryParams.set('size', params.size.toString());

        const url = `${getBaseUrl()}/api/v1/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const res = await fetch(url, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'X-Tenant-Id': currentTenant.id,
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch orders: ${res.statusText}`);
        }
        return res.json();
    },

    async getOrderById(orderId: string): Promise<any> {
        const { getBaseUrl, currentTenant } = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/v1/orders/${orderId}`, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'X-Tenant-Id': currentTenant.id,
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch order ${orderId}: ${res.statusText}`);
        }
        return res.json();
    },

    async createOrder(payload: CreateOrderPayload): Promise<any> {
        const { getBaseUrl, currentTenant } = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/v1/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'X-Tenant-Id': currentTenant.id,
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            throw new Error(`Failed to create order: ${res.statusText}`);
        }
        return res.json();
    },

    async submitOrder(orderId: string): Promise<any> {
        const { getBaseUrl, currentTenant } = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/v1/orders/${orderId}/submit`, {
            method: 'POST',
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'X-Tenant-Id': currentTenant.id,
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to submit order: ${res.statusText}`);
        }
        return res.json();
    },

    async cancelOrder(orderId: string, reason?: string): Promise<any> {
        const { getBaseUrl, currentTenant } = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/v1/orders/${orderId}/cancel`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'X-Tenant-Id': currentTenant.id,
            },
            body: JSON.stringify({ reason: reason || 'Cancelled by user' }),
        });

        if (!res.ok) {
            throw new Error(`Failed to cancel order: ${res.statusText}`);
        }
        return res.json();
    },
};

export default ordersClient;
