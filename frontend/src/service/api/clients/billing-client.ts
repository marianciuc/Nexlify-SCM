import useEnvironmentStore from '@/service/env/environment-store';

export interface InvoiceItemPayload {
    sku: string;
    description: string;
    quantity: number;
    unitPriceNetto: number;
    vatRate: number;
}

export interface CreateInvoicePayload {
    orderId: string;
    buyerCompanyId: string;
    sellerCompanyId: string;
    currency?: string;
    paymentTerms?: string;
    items: InvoiceItemPayload[];
}

export const billingClient = {
    async getInvoices(params?: { status?: string; page?: number; size?: number }): Promise<any> {
        const { getBaseUrl, currentTenant } = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.set('status', params.status);
        if (params?.page !== undefined) queryParams.set('page', params.page.toString());
        if (params?.size !== undefined) queryParams.set('size', params.size.toString());

        const url = `${getBaseUrl()}/api/v1/billing/invoices${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const res = await fetch(url, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'X-Tenant-Id': currentTenant.id,
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch invoices: ${res.statusText}`);
        }
        return res.json();
    },

    async getInvoiceById(id: string): Promise<any> {
        const { getBaseUrl, currentTenant } = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/v1/billing/invoices/${id}`, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'X-Tenant-Id': currentTenant.id,
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch invoice ${id}: ${res.statusText}`);
        }
        return res.json();
    },

    async getInvoiceByOrderId(orderId: string): Promise<any> {
        const { getBaseUrl, currentTenant } = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/v1/billing/invoices/order/${orderId}`, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'X-Tenant-Id': currentTenant.id,
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch invoice for order ${orderId}: ${res.statusText}`);
        }
        return res.json();
    },

    async payInvoice(id: string, paymentMethod: string = 'SPLIT_PAYMENT', transactionId?: string): Promise<any> {
        const { getBaseUrl, currentTenant } = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const params = new URLSearchParams({ paymentMethod });
        if (transactionId) params.set('transactionId', transactionId);

        const res = await fetch(`${getBaseUrl()}/api/v1/billing/invoices/${id}/pay?${params.toString()}`, {
            method: 'POST',
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'X-Tenant-Id': currentTenant.id,
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to process payment: ${res.statusText}`);
        }
        return res.json();
    },

    async createPaymentIntent(id: string): Promise<any> {
        const { getBaseUrl, currentTenant } = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/v1/billing/invoices/${id}/payment-intent`, {
            method: 'POST',
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'X-Tenant-Id': currentTenant.id,
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to create Stripe payment intent: ${res.statusText}`);
        }
        return res.json();
    },
};

export default billingClient;
