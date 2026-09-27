import { create } from 'zustand';

export type EnvironmentType = 'development' | 'staging' | 'production' | 'custom';

export interface TenantContext {
    id: string;
    name: string;
    nip: string;
    country: string;
    warehouseCode: string;
    warehouseName: string;
}

export const AVAILABLE_ENVIRONMENTS: Record<EnvironmentType, { label: string; url: string; badgeColor: string; description: string }> = {
    development: {
        label: 'Development (Local)',
        url: 'http://localhost:8080',
        badgeColor: 'bg-emerald-500/15 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400',
        description: 'Local Docker & Spring Gateway environment',
    },
    staging: {
        label: 'Staging (Pre-Prod)',
        url: 'http://localhost:8080',
        badgeColor: 'bg-amber-500/15 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400',
        description: 'Kubernetes Pre-production Testbed (ZUT Lab)',
    },
    production: {
        label: 'Production (Cloud)',
        url: 'http://localhost:8080',
        badgeColor: 'bg-indigo-500/15 text-indigo-700 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-400',
        description: 'Live High-Availability B2B Network',
    },
    custom: {
        label: 'Custom (Manual URL)',
        url: 'http://localhost:8080',
        badgeColor: 'bg-purple-500/15 text-purple-700 border-purple-300 dark:bg-purple-950/40 dark:text-purple-400',
        description: 'User-specified API Gateway and Auth endpoints',
    },
};

export const AVAILABLE_TENANTS: TenantContext[] = [
    {
        id: 'ten-waw-01',
        name: 'Nexlify Logistics Polska Sp. z o.o.',
        nip: '8522619472',
        country: 'PL',
        warehouseCode: 'WH-WAW-01',
        warehouseName: 'Central DC Warszawa (12,000 pal.)',
    },
    {
        id: 'ten-szc-02',
        name: 'Baltic Freight & Cargo S.A.',
        nip: '5213456789',
        country: 'PL',
        warehouseCode: 'WH-SZC-02',
        warehouseName: 'Port Logistics Hub Szczecin (8,500 pal.)',
    },
    {
        id: 'ten-kat-03',
        name: 'Silesia Distribution Center Sp. k.',
        nip: '6349876543',
        country: 'PL',
        warehouseCode: 'WH-KAT-03',
        warehouseName: 'Cross-docking Hub Katowice (6,200 pal.)',
    },
];

interface EnvironmentState {
    currentEnvironment: EnvironmentType;
    currentTenant: TenantContext;
    customUrl: string;
    customKeycloakUrl: string;
    isMockMode: boolean;
    getBaseUrl: () => string;
    getKeycloakUrl: () => string;
    setEnvironment: (env: EnvironmentType) => void;
    setCustomUrl: (url: string) => void;
    setCustomKeycloakUrl: (url: string) => void;
    setMockMode: (enabled: boolean) => void;
    setTenant: (tenant: TenantContext) => void;
    setManualConfig: (config: {
        env?: EnvironmentType;
        customUrl?: string;
        customKeycloakUrl?: string;
        isMockMode?: boolean;
        tenant?: TenantContext;
    }) => void;
    resetDefaults: () => void;
}

const STORAGE_ENV_KEY = 'nexlify_active_environment';
const STORAGE_TENANT_KEY = 'nexlify_active_tenant';
const STORAGE_CUSTOM_URL_KEY = 'nexlify_custom_gateway_url';
const STORAGE_CUSTOM_KEYCLOAK_KEY = 'nexlify_custom_keycloak_url';
const STORAGE_MOCK_MODE_KEY = 'nexlify_mock_mode_enabled';

const DEFAULT_CUSTOM_URL = 'http://localhost:8080';
const DEFAULT_KEYCLOAK_URL = 'http://localhost:9090/realms/nexlify';

export const useEnvironmentStore = create<EnvironmentState>((set, get) => {
    // Initial state from localStorage or defaults
    const initialEnv: EnvironmentType = (typeof window !== 'undefined' && (localStorage.getItem(STORAGE_ENV_KEY) as EnvironmentType)) || 'development';

    let initialTenant: TenantContext = AVAILABLE_TENANTS[0]!;
    let initialCustomUrl = DEFAULT_CUSTOM_URL;
    let initialCustomKeycloak = DEFAULT_KEYCLOAK_URL;
    let initialMockMode = false;

    if (typeof window !== 'undefined') {
        const savedTenant = localStorage.getItem(STORAGE_TENANT_KEY);
        if (savedTenant) {
            try {
                initialTenant = JSON.parse(savedTenant);
            } catch {
                initialTenant = AVAILABLE_TENANTS[0]!;
            }
        }
        const savedCustomUrl = localStorage.getItem(STORAGE_CUSTOM_URL_KEY);
        if (savedCustomUrl) {
            initialCustomUrl = savedCustomUrl;
        }
        const savedKeycloakUrl = localStorage.getItem(STORAGE_CUSTOM_KEYCLOAK_KEY);
        if (savedKeycloakUrl) {
            initialCustomKeycloak = savedKeycloakUrl;
        }
        const savedMockMode = localStorage.getItem(STORAGE_MOCK_MODE_KEY);
        if (savedMockMode !== null) {
            initialMockMode = savedMockMode === 'true';
        }
    }

    return {
        currentEnvironment: initialEnv,
        currentTenant: initialTenant,
        customUrl: initialCustomUrl,
        customKeycloakUrl: initialCustomKeycloak,
        isMockMode: initialMockMode,

        getBaseUrl: () => {
            const { currentEnvironment, customUrl } = get();
            if (currentEnvironment === 'custom') {
                return customUrl || DEFAULT_CUSTOM_URL;
            }
            return AVAILABLE_ENVIRONMENTS[currentEnvironment]?.url || DEFAULT_CUSTOM_URL;
        },

        getKeycloakUrl: () => {
            const { currentEnvironment, customKeycloakUrl } = get();
            if (currentEnvironment === 'custom') {
                return customKeycloakUrl || DEFAULT_KEYCLOAK_URL;
            }
            if (currentEnvironment === 'staging') {
                return 'https://staging-auth.nexlify-scm.internal/realms/nexlify';
            }
            if (currentEnvironment === 'production') {
                return 'https://auth.nexlify-scm.com/realms/nexlify';
            }
            return DEFAULT_KEYCLOAK_URL;
        },

        setEnvironment: (env: EnvironmentType) => {
            if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_ENV_KEY, env);
            }
            set({ currentEnvironment: env });
        },

        setCustomUrl: (url: string) => {
            if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_CUSTOM_URL_KEY, url);
            }
            set({ customUrl: url });
        },

        setCustomKeycloakUrl: (url: string) => {
            if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_CUSTOM_KEYCLOAK_KEY, url);
            }
            set({ customKeycloakUrl: url });
        },

        setMockMode: (enabled: boolean) => {
            if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_MOCK_MODE_KEY, String(enabled));
            }
            set({ isMockMode: enabled });
        },

        setTenant: (tenant: TenantContext) => {
            if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_TENANT_KEY, JSON.stringify(tenant));
            }
            set({ currentTenant: tenant });
        },

        setManualConfig: (config) => {
            const updates: Partial<EnvironmentState> = {};
            if (config.env) {
                updates.currentEnvironment = config.env;
                if (typeof window !== 'undefined') localStorage.setItem(STORAGE_ENV_KEY, config.env);
            }
            if (config.customUrl !== undefined) {
                updates.customUrl = config.customUrl;
                if (typeof window !== 'undefined') localStorage.setItem(STORAGE_CUSTOM_URL_KEY, config.customUrl);
            }
            if (config.customKeycloakUrl !== undefined) {
                updates.customKeycloakUrl = config.customKeycloakUrl;
                if (typeof window !== 'undefined') localStorage.setItem(STORAGE_CUSTOM_KEYCLOAK_KEY, config.customKeycloakUrl);
            }
            if (config.isMockMode !== undefined) {
                updates.isMockMode = config.isMockMode;
                if (typeof window !== 'undefined') localStorage.setItem(STORAGE_MOCK_MODE_KEY, String(config.isMockMode));
            }
            if (config.tenant) {
                updates.currentTenant = config.tenant;
                if (typeof window !== 'undefined') localStorage.setItem(STORAGE_TENANT_KEY, JSON.stringify(config.tenant));
            }
            set(updates as EnvironmentState);
        },

        resetDefaults: () => {
            if (typeof window !== 'undefined') {
                localStorage.removeItem(STORAGE_ENV_KEY);
                localStorage.removeItem(STORAGE_TENANT_KEY);
                localStorage.removeItem(STORAGE_CUSTOM_URL_KEY);
                localStorage.removeItem(STORAGE_CUSTOM_KEYCLOAK_KEY);
                localStorage.removeItem(STORAGE_MOCK_MODE_KEY);
            }
            set({
                currentEnvironment: 'development',
                currentTenant: AVAILABLE_TENANTS[0]!,
                customUrl: DEFAULT_CUSTOM_URL,
                customKeycloakUrl: DEFAULT_KEYCLOAK_URL,
                isMockMode: false,
            });
        },
    };
});

export default useEnvironmentStore;
