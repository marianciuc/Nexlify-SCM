import useEnvironmentStore from '@/service/env/environment-store';

export const authClient = {
    async getCurrentUser(): Promise<any> {
        const {getBaseUrl} = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/v1/users/me`, {
            headers: {
                ...(token ? {Authorization: `Bearer ${token}`} : {}),
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch current user: ${res.statusText}`);
        }
        return res.json();
    },

    async getCompanyProfile(countryCode: string, taxId: string): Promise<any> {
        const {getBaseUrl} = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/v1/companies/company/${countryCode}/${taxId}`, {
            headers: {
                ...(token ? {Authorization: `Bearer ${token}`} : {}),
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch company profile: ${res.statusText}`);
        }
        return res.json();
    },
};

export default authClient;
