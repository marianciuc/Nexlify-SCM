import createClient, {type Middleware} from 'openapi-fetch';

import type {paths} from '@/types/api';

const BASE_URL = 'http://localhost:8888';
const UNPROTECTED_ROUTES = ['auth'];

const myMiddleware: Middleware = {
    async onRequest({request}) {
        if (!UNPROTECTED_ROUTES.some(route => request.url.includes(route))) {
            const {default: useAuthStore} = await import('@/service/auth/auth-store');
            return useAuthStore.getState().addAuthHeader(request);
        }
        return request;
    },
};

const client = createClient<paths>({baseUrl: BASE_URL});

client.use(myMiddleware);

export default client;
