import {describe, it, expect, beforeEach} from 'vitest';

import {
    useEnvironmentStore,
    AVAILABLE_ENVIRONMENTS,
    AVAILABLE_TENANTS,
} from './environment-store';

describe('environment-store unit tests', () => {
    beforeEach(() => {
        localStorage.clear();
        useEnvironmentStore.getState().resetDefaults();
    });

    it('should initialize with development environment and default tenant', () => {
        const state = useEnvironmentStore.getState();
        expect(state.currentEnvironment).toBe('development');
        expect(state.currentTenant.id).toBe('ten-waw-01');
        expect(state.getBaseUrl()).toBe(AVAILABLE_ENVIRONMENTS.development.url);
    });

    it('should switch environments and update base URL', () => {
        const {setEnvironment, getBaseUrl} = useEnvironmentStore.getState();

        setEnvironment('staging');
        expect(useEnvironmentStore.getState().currentEnvironment).toBe('staging');
        expect(getBaseUrl()).toBe(AVAILABLE_ENVIRONMENTS.staging.url);
        expect(localStorage.getItem('nexlify_active_environment')).toBe('staging');

        setEnvironment('production');
        expect(useEnvironmentStore.getState().currentEnvironment).toBe('production');
        expect(getBaseUrl()).toBe(AVAILABLE_ENVIRONMENTS.production.url);
        expect(localStorage.getItem('nexlify_active_environment')).toBe('production');
    });

    it('should switch to custom manual environment and return custom URL', () => {
        const {setEnvironment, setCustomUrl, getBaseUrl} = useEnvironmentStore.getState();

        setCustomUrl('http://192.168.1.150:8080');
        setEnvironment('custom');

        expect(useEnvironmentStore.getState().currentEnvironment).toBe('custom');
        expect(getBaseUrl()).toBe('http://192.168.1.150:8080');
        expect(localStorage.getItem('nexlify_custom_gateway_url')).toBe('http://192.168.1.150:8080');
        expect(localStorage.getItem('nexlify_active_environment')).toBe('custom');
    });

    it('should support manual batch configuration with setManualConfig', () => {
        const {setManualConfig, getBaseUrl} = useEnvironmentStore.getState();

        setManualConfig({
            env: 'custom',
            customUrl: 'http://localhost:8082',
            customKeycloakUrl: 'http://localhost:9095/realms/custom',
            isMockMode: true,
            tenant: {
                id: 'ten-custom-99',
                name: 'Custom Baltic Transport Sp. z o.o.',
                nip: '1112223344',
                country: 'PL',
                warehouseCode: 'WH-TEST-99',
                warehouseName: 'Custom Hub',
            },
        });

        const state = useEnvironmentStore.getState();
        expect(state.currentEnvironment).toBe('custom');
        expect(getBaseUrl()).toBe('http://localhost:8082');
        expect(state.customKeycloakUrl).toBe('http://localhost:9095/realms/custom');
        expect(state.isMockMode).toBe(true);
        expect(state.currentTenant.id).toBe('ten-custom-99');
        expect(state.currentTenant.warehouseCode).toBe('WH-TEST-99');
    });

    it('should reset defaults cleanly', () => {
        const {setManualConfig, resetDefaults, getBaseUrl} = useEnvironmentStore.getState();

        setManualConfig({
            env: 'custom',
            customUrl: 'http://foo:9999',
            isMockMode: true,
        });

        resetDefaults();

        const state = useEnvironmentStore.getState();
        expect(state.currentEnvironment).toBe('development');
        expect(getBaseUrl()).toBe(AVAILABLE_ENVIRONMENTS.development.url);
        expect(state.isMockMode).toBe(false);
    });

    it('should switch tenants and persist to localStorage', () => {
        const {setTenant} = useEnvironmentStore.getState();
        const targetTenant = AVAILABLE_TENANTS[1]!; // Szczecin

        setTenant(targetTenant);
        const state = useEnvironmentStore.getState();
        expect(state.currentTenant.id).toBe('ten-szc-02');
        expect(state.currentTenant.warehouseCode).toBe('WH-SZC-02');

        const savedTenant = JSON.parse(localStorage.getItem('nexlify_active_tenant') || '{}');
        expect(savedTenant.id).toBe('ten-szc-02');
        expect(savedTenant.name).toBe('Baltic Freight & Cargo S.A.');
    });

    it('should contain all standard European logistics deployment targets plus custom', () => {
        expect(AVAILABLE_ENVIRONMENTS.development.url).toBeDefined();
        expect(AVAILABLE_ENVIRONMENTS.staging.url).toBeDefined();
        expect(AVAILABLE_ENVIRONMENTS.production.url).toBeDefined();
        expect(AVAILABLE_ENVIRONMENTS.custom).toBeDefined();
    });
});
