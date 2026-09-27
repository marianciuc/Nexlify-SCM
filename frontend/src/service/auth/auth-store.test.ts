import {describe, it, expect, beforeEach} from 'vitest';

import {SecurityScope} from '@/types/api';
import useAuthStore from './auth-store';

describe('auth-store unit tests', () => {
    beforeEach(() => {
        localStorage.clear();
        useAuthStore.getState().clearAuth();
    });

    it('should initialize with unauthenticated state', () => {
        const state = useAuthStore.getState();
        expect(state.isAuthenticated).toBe(false);
        expect(state.accessToken).toBeNull();
        expect(state.userData).toBeNull();
        expect(state.userScope).toEqual([]);
    });

    it('should handle opaque token parsing with fallback payload and default scopes', () => {
        const opaqueToken = 'opq_acc_sample_opaque_token_string';
        const payload = useAuthStore.getState().parseToken(opaqueToken);

        expect(payload).not.toBeNull();
        expect(payload?.email).toBe('user@nexlify.com');
        expect(payload?.sub).toBe('opaque-user-id');

        const state = useAuthStore.getState();
        expect(state.userScope).toContain(SecurityScope.MOD_001_001);
        expect(state.accessTokenExpirationDate).toBeInstanceOf(Date);
    });

    it('should update auth state on updateAuth and persist tokens in localStorage', () => {
        useAuthStore.getState().updateAuth({
            access_token: 'opq_acc_12345',
            refresh_token: 'opq_ref_67890',
            expires_in: 3600,
            user: {
                id: 'usr-1',
                email: 'jan.kowalski@balticfreight.pl',
                firstName: 'Jan',
                lastName: 'Kowalski',
                roles: ['LOGISTICS_OPERATOR'],
            },
        });

        const state = useAuthStore.getState();
        expect(state.isAuthenticated).toBe(true);
        expect(state.accessToken).toBe('opq_acc_12345');
        expect(state.userData?.email).toBe('jan.kowalski@balticfreight.pl');
        expect(localStorage.getItem('access_token')).toBe('opq_acc_12345');
        expect(localStorage.getItem('refresh_token')).toBe('opq_ref_67890');
    });

    it('should clear all tokens and user context on logout', () => {
        useAuthStore.getState().updateAuth({
            access_token: 'sample_token',
            refresh_token: 'sample_refresh',
            expires_in: 3600,
            user: {
                id: 'usr-9',
                email: 'admin@nexlify.pl',
                firstName: 'Admin',
                lastName: 'System',
            },
        });

        expect(useAuthStore.getState().isAuthenticated).toBe(true);

        useAuthStore.getState().logout();

        const state = useAuthStore.getState();
        expect(state.isAuthenticated).toBe(false);
        expect(state.accessToken).toBeNull();
        expect(state.userData).toBeNull();
        expect(localStorage.getItem('access_token')).toBeNull();
        expect(localStorage.getItem('refresh_token')).toBeNull();
    });

    it('should check permissions using hasPermissions', () => {
        useAuthStore.setState({
            userScope: [SecurityScope.MOD_001_001, SecurityScope.MOD_001_002],
        });

        expect(useAuthStore.getState().hasPermissions([SecurityScope.MOD_001_001])).toBe(true);
        expect(useAuthStore.getState().hasPermissions([])).toBe(true);
    });
});
