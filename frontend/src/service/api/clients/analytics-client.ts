import useEnvironmentStore from '@/service/env/environment-store';

export const analyticsClient = {
    async getKpiSnapshot(): Promise<any> {
        const { getBaseUrl, currentTenant } = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/v1/analytics/kpi`, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'X-Tenant-Id': currentTenant.id,
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch analytics KPIs: ${res.statusText}`);
        }
        return res.json();
    },

    async getOtifTrends(): Promise<any[]> {
        const { getBaseUrl, currentTenant } = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/v1/analytics/otif`, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'X-Tenant-Id': currentTenant.id,
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch OTIF trends: ${res.statusText}`);
        }
        return res.json();
    },

    async getLeadTimeDistribution(): Promise<any[]> {
        const { getBaseUrl, currentTenant } = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/v1/analytics/lead-time`, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'X-Tenant-Id': currentTenant.id,
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch lead time distribution: ${res.statusText}`);
        }
        return res.json();
    },

    async getAbcAnalysis(): Promise<any> {
        const { getBaseUrl, currentTenant } = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/v1/analytics/abc-analysis`, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'X-Tenant-Id': currentTenant.id,
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch ABC analysis: ${res.statusText}`);
        }
        return res.json();
    },

    async getTurnover(): Promise<any[]> {
        const { getBaseUrl, currentTenant } = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/v1/analytics/turnover`, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'X-Tenant-Id': currentTenant.id,
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch inventory turnover: ${res.statusText}`);
        }
        return res.json();
    },
};

export default analyticsClient;
