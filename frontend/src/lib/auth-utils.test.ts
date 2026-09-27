import {describe, it, expect} from 'vitest';

import {isValidTokenFormat, isTokenExpired} from './auth-utils';

describe('auth-utils unit tests', () => {
    describe('isValidTokenFormat', () => {
        it('should return false for empty or non-string inputs', () => {
            expect(isValidTokenFormat('')).toBe(false);
            // @ts-expect-error test invalid type
            expect(isValidTokenFormat(null)).toBe(false);
            // @ts-expect-error test invalid type
            expect(isValidTokenFormat(undefined)).toBe(false);
        });

        it('should return true for a valid 3-part dot separated JWT string', () => {
            expect(isValidTokenFormat('header.payload.signature')).toBe(true);
        });

        it('should return false for malformed tokens', () => {
            expect(isValidTokenFormat('invalid-token')).toBe(false);
            expect(isValidTokenFormat('only.two')).toBe(false);
            expect(isValidTokenFormat('four.parts.here.extra')).toBe(false);
        });
    });

    describe('isTokenExpired', () => {
        it('should consider invalid tokens as expired', () => {
            expect(isTokenExpired('not-a-valid-jwt')).toBe(true);
        });
    });
});
