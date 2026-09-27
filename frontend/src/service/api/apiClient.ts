import createClient, {type Middleware} from 'openapi-fetch';

import useEnvironmentStore from '@/service/env/environment-store';
import type {paths} from '@/types/api';

const UNPROTECTED_ROUTES = ['/auth/login', '/auth/register'];

const authAndEnvMiddleware: Middleware = {
    async onRequest({request}) {
        const envStore = useEnvironmentStore.getState();
        const tenant = envStore.currentTenant;
        const env = envStore.currentEnvironment;
        const targetBase = envStore.getBaseUrl();

        request.headers.set('X-Tenant-Id', tenant?.id || 'ten-waw-01');
        request.headers.set('X-Environment', env || 'development');

        let modifiedRequest = request;
        try {
            const currentUrl = new URL(request.url);
            const targetUrl = new URL(targetBase);
            if (currentUrl.origin !== targetUrl.origin) {
                const rewrittenUrl = new URL(currentUrl.pathname + currentUrl.search, targetUrl.origin);
                modifiedRequest = new Request(rewrittenUrl.toString(), request);
            }
        } catch {
            // Keep original request if URL parsing fails
        }

        if (!UNPROTECTED_ROUTES.some(route => modifiedRequest.url.includes(route))) {
            const {default: useAuthStore} = await import('@/service/auth/auth-store');
            return useAuthStore.getState().addAuthHeader(modifiedRequest);
        }
        return modifiedRequest;
    },
};

const client = createClient<paths>({
    baseUrl: typeof window !== 'undefined' ? useEnvironmentStore.getState().getBaseUrl() : 'http://localhost:8080',
});

client.use(authAndEnvMiddleware);

export default client;
