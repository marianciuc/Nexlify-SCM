import useEnvironmentStore from '@/service/env/environment-store';

export interface DashboardKpis {
    otifRate: number;
    otifTarget: number;
    averageLeadTimeDays: number;
    leadTimeTargetDays: number;
    serviceLevelSla: number;
    totalThroughputTons: number;
    activeSuppliers: number;
    warehouseUtilizationRate: number;
    costSavingsTotal: number;
    currency: string;
    activeRoutesCount: number;
    fleetEfficiencyScore: number;
}

export interface OtifTrendPoint {
    period: string;
    otif: number;
    onTime: number;
    inFull: number;
    delayed: number;
}

export const dashboardClient = {
    async getKpis(): Promise<DashboardKpis> {
        const {getBaseUrl, currentTenant} = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/v1/analytics/kpi`, {
            headers: {
                ...(token ? {Authorization: `Bearer ${token}`} : {}),
                'X-Tenant-Id': currentTenant.id,
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch analytics KPIs: ${res.statusText}`);
        }
        return res.json();
    },

    async getOtifTrends(): Promise<OtifTrendPoint[]> {
        const {getBaseUrl, currentTenant} = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/v1/analytics/trends`, {
            headers: {
                ...(token ? {Authorization: `Bearer ${token}`} : {}),
                'X-Tenant-Id': currentTenant.id,
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch OTIF trends: ${res.statusText}`);
        }
        return res.json();
    },
};

export default dashboardClient;
