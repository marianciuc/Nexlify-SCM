import {decodeJwt} from 'jose';
import {create} from 'zustand';

import {SecurityScope, type SchemaCredentialsRequest, type SchemaTokenPair} from '@/types/api';

interface JWTPayload {
    sub: string;
    email: string;
    given_name: string;
    family_name: string;
    realm_access: { roles: string[] };
    exp: number;
    iat: number;
    iss?: string;
}

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
}

interface AuthState {
    userData: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    accessToken: string | null;
    accessTokenExpirationDate: Date | null;
    userScope: SecurityScope[];
    isTokenRefreshing: Promise<boolean> | null;

    login: (credentials: SchemaCredentialsRequest) => Promise<void>;
    logout: () => void;
    refreshToken: () => Promise<boolean>;
    hasPermissions: (scopes: SecurityScope[]) => boolean;
    addAuthHeader: (request: Request) => Promise<Request>;
    clearAuth: () => void;
    updateAuth: (response: SchemaTokenPair) => void;
    parseToken: (token: string) => JWTPayload | null;
    init: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set, get) => ({
    userData: null,
    isAuthenticated: false,
    isLoading: false,
    accessToken: null,
    accessTokenExpirationDate: null,
    userScope: [],
    isTokenRefreshing: null,

    parseToken: (token: string): JWTPayload | null => {
        try {
            const payload = decodeJwt(token) as JWTPayload;
            const expirationDate = new Date(payload.exp * 1000);
            const scopes = payload.realm_access.roles.filter((scope): scope is SecurityScope =>
                Object.values(SecurityScope).includes(scope as SecurityScope)
            ) as SecurityScope[];

            set({
                accessTokenExpirationDate: expirationDate,
                userScope: scopes,
            });

            return payload;
        } catch {
            return null;
        }
    },

    clearAuth: () => {
        localStorage.removeItem('refresh_token');
        set({
            userData: null,
            isAuthenticated: false,
            accessToken: null,
            accessTokenExpirationDate: null,
            userScope: [],
            isLoading: false,
            isTokenRefreshing: null,
        });
    },

    updateAuth: (response: SchemaTokenPair) => {
        const {parseToken} = get();
        const payload = parseToken(response.access_token);

        if (payload === null) {
            get().clearAuth();
            return;
        }

        const userData = {
            id: payload.sub,
            email: payload.email,
            firstName: payload.given_name,
            lastName: payload.family_name,
        };

        set({
            userData,
            accessToken: response.access_token,
            isAuthenticated: true,
        });

        localStorage.setItem('refresh_token', response.refresh_token);
    },

    login: async (credentials: SchemaCredentialsRequest) => {
        set({isLoading: true});

        const {default: apiClient} = await import('@/service/api/apiClient');

        try {
            const response = await apiClient.POST('/api/v1/auth/login', {
                body: credentials,
            });

            if (response.error) throw new Error('Login failed');

            get().updateAuth(response.data);
        } catch (error) {
            get().clearAuth();
            throw error;
        } finally {
            set({isLoading: false});
        }
    },

    logout: () => {
        get().clearAuth();
    },

    refreshToken: async (): Promise<boolean> => {
        const {isTokenRefreshing} = get();

        set({isLoading: true});

        if (isTokenRefreshing) return isTokenRefreshing;

        const refreshPromise = new Promise<boolean>(resolve => {
            (async () => {
                const refreshToken = localStorage.getItem('refresh_token');

                if (!refreshToken) {
                    set({isLoading: false});
                    resolve(false);
                    return;
                }

                try {
                    const {default: apiClient} = await import('@/service/api/apiClient');

                    const response = await apiClient.POST('/api/v1/auth/refresh', {
                        body: {refresh_token: refreshToken},
                    });

                    if (response.error) throw new Error('Refresh failed');

                    get().updateAuth(response.data);
                    set({isLoading: false, isTokenRefreshing: null});
                    resolve(true);
                } catch {
                    get().clearAuth();
                    resolve(false);
                }
            })();
        });

        set({isTokenRefreshing: refreshPromise});
        return refreshPromise;
    },

    hasPermissions: (scopes: SecurityScope[]): boolean => {
        const {userScope} = get();
        return scopes.every(scope => userScope.includes(scope));
    },

    addAuthHeader: async (request: Request): Promise<Request> => {
        const {accessToken, isTokenRefreshing, accessTokenExpirationDate} = get();

        if (!accessToken) return request;
        if (isTokenRefreshing == null) await get().refreshToken();

        if (isTokenRefreshing) {
            await isTokenRefreshing;
            const {accessToken: newToken} = get();
            if (newToken) {
                return new Request(request, {
                    headers: {
                        ...request.headers,
                        Authorization: `Bearer ${newToken}`,
                    },
                });
            }
            return request;
        }

        if (accessTokenExpirationDate && accessTokenExpirationDate < new Date() && !isTokenRefreshing) {
            const refreshed = await get().refreshToken();
            if (refreshed) {
                const {accessToken: newToken} = get();
                return new Request(request, {
                    headers: {
                        ...request.headers,
                        Authorization: `Bearer ${newToken}`,
                    },
                });
            }
            return request;
        }

        return new Request(request, {
            headers: {
                ...request.headers,
                Authorization: `Bearer ${accessToken}`,
            },
        });
    },
    init: async () => {
        if (get().isAuthenticated) return;
        if (get().isTokenRefreshing) {
            await get().isTokenRefreshing;
            return;
        }
        if (localStorage.getItem('refresh_token')) {
            await get().refreshToken();
        }
    },
}));

const initializeAuth = () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
        useAuthStore.getState().refreshToken();
    }
};

if (typeof window !== 'undefined') {
    initializeAuth();
}

export default useAuthStore;
