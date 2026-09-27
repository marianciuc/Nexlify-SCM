import useEnvironmentStore from '@/service/env/environment-store';

export const settingsClient = {
    async getSecurityScopes(): Promise<string[]> {
        const {getBaseUrl} = useEnvironmentStore.getState();
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const res = await fetch(`${getBaseUrl()}/api/security-scopes`, {
            headers: {
                ...(token ? {Authorization: `Bearer ${token}`} : {}),
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch security scopes: ${res.statusText}`);
        }
        return res.json();
    },
};

export default settingsClient;
