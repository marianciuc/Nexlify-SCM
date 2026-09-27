import useEnvironmentStore from '@/service/env/environment-store';

export interface RfqItemPayload {
    sku?: string;
    productName: string;
    quantity: number;
    unitOfMeasure?: string;
    description?: string;
    allowAlternatives?: boolean;
}

export interface CreateRfqPayload {
    title: string;
    description?: string;
    category?: string;
    deadline: string; // ISO date string
    deliveryDate?: string;
    deliveryAddress?: string;
    deliveryCity?: string;
    budgetAmount?: number;
    budgetHidden?: boolean;
    currency?: string;
    paymentTerms?: string;
    items: RfqItemPayload[];
}

export interface BidItemPayload {
    rfqItemId: string;
    offeredSku?: string;
    productName?: string;
    quantity: number;
    unitPrice: number;
    isAlternative?: boolean;
    alternativeReason?: string;
    leadTimeDays?: number;
}

export interface SubmitBidPayload {
    totalPrice: number;
    currency?: string;
    deliveryDate?: string;
    paymentTerms?: string;
    validityDays?: number;
    notes?: string;
    items: BidItemPayload[];
}

export const rfqClient = {
    async getBuyerRfqs(page: number = 0, size: number = 20): Promise<any> {
        const { getBaseUrl, currentTenant } = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/v1/rfq?page=${page}&size=${size}`, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'X-Tenant-Id': currentTenant.id,
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch RFQs: ${res.statusText}`);
        }
        return res.json();
    },

    async getOpenBoardRfqs(page: number = 0, size: number = 20): Promise<any> {
        const { getBaseUrl, currentTenant } = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/v1/rfq/board/open?page=${page}&size=${size}`, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'X-Tenant-Id': currentTenant.id,
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch open RFQs: ${res.statusText}`);
        }
        return res.json();
    },

    async getRfqById(id: string): Promise<any> {
        const { getBaseUrl, currentTenant } = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/v1/rfq/${id}`, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'X-Tenant-Id': currentTenant.id,
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch RFQ ${id}: ${res.statusText}`);
        }
        return res.json();
    },

    async createRfq(payload: CreateRfqPayload): Promise<any> {
        const { getBaseUrl, currentTenant } = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/v1/rfq`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'X-Tenant-Id': currentTenant.id,
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            throw new Error(`Failed to create RFQ: ${res.statusText}`);
        }
        return res.json();
    },

    async publishRfq(id: string): Promise<any> {
        const { getBaseUrl, currentTenant } = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/v1/rfq/${id}/publish`, {
            method: 'POST',
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'X-Tenant-Id': currentTenant.id,
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to publish RFQ: ${res.statusText}`);
        }
        return res.json();
    },

    async submitBid(rfqId: string, payload: SubmitBidPayload): Promise<any> {
        const { getBaseUrl, currentTenant } = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/v1/rfq/${rfqId}/bids`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'X-Tenant-Id': currentTenant.id,
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            throw new Error(`Failed to submit bid: ${res.statusText}`);
        }
        return res.json();
    },

    async awardBid(rfqId: string, bidId: string): Promise<any> {
        const { getBaseUrl, currentTenant } = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/v1/rfq/${rfqId}/award/${bidId}`, {
            method: 'POST',
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'X-Tenant-Id': currentTenant.id,
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to award bid: ${res.statusText}`);
        }
        return res.json();
    },

    async cancelRfq(id: string): Promise<any> {
        const { getBaseUrl, currentTenant } = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/v1/rfq/${id}/cancel`, {
            method: 'POST',
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'X-Tenant-Id': currentTenant.id,
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to cancel RFQ: ${res.statusText}`);
        }
        return res.json();
    },
};

export default rfqClient;
