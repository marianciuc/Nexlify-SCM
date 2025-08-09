import {jwtDecode} from 'jwt-decode';

import {AuthError, type User} from '../types/auth';

// JWT payload interface
interface JWTPayload {
    sub: string; // user ID
    email: string;
    exp: number; // expiration timestamp
    iat: number; // issued at timestamp
    firstName?: string;
    lastName?: string;
    companyId?: string;
    role?: string;
    scopes?: string[];
}

/**
 * Check if a JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
    try {
        const decoded = jwtDecode<JWTPayload>(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    } catch {
        return true; // Consider invalid tokens as expired
    }
}

/**
 * Check if a token will expire within the given minutes
 */
export function willTokenExpireSoon(token: string, minutesBeforeExpiry = 5): boolean {
    try {
        const decoded = jwtDecode<JWTPayload>(token);
        const currentTime = Date.now() / 1000;
        const timeUntilExpiry = decoded.exp - currentTime;
        return timeUntilExpiry < minutesBeforeExpiry * 60;
    } catch {
        return true;
    }
}

/**
 * Extract user information from JWT token
 */
export function getUserFromToken(token: string): User {
    try {
        const decoded = jwtDecode<JWTPayload>(token);

        return {
            id: decoded.sub,
            email: decoded.email,
            firstName: decoded.firstName || '',
            lastName: decoded.lastName || '',
            companyId: decoded.companyId,
            role: decoded.role,
            securityScopes: decoded.scopes,
        };
    } catch (error) {
        throw new AuthError('Invalid token format', 'INVALID_TOKEN');
    }
}

/**
 * Validate token format (basic JWT structure check)
 */
export function isValidTokenFormat(token: string): boolean {
    if (!token || typeof token !== 'string') {
        return false;
    }

    // Basic JWT format check (3 parts separated by dots)
    const parts = token.split('.');
    return parts.length === 3;
}

/**
 * Get token expiration time in milliseconds
 */
export function getTokenExpirationTime(token: string): number {
    try {
        const decoded = jwtDecode<JWTPayload>(token);
        return decoded.exp * 1000; // Convert to milliseconds
    } catch {
        return 0;
    }
}

/**
 * Calculate time until token expires (in seconds)
 */
export function getTimeUntilExpiry(token: string): number {
    try {
        const decoded = jwtDecode<JWTPayload>(token);
        const currentTime = Date.now() / 1000;
        return Math.max(0, decoded.exp - currentTime);
    } catch {
        return 0;
    }
}

/**
 * Check if user has required security scope
 */
export function hasSecurityScope(user: User | null, requiredScope: string): boolean {
    if (!user || !user.securityScopes) {
        return false;
    }

    return user.securityScopes.includes(requiredScope);
}

/**
 * Check if user has any of the required security scopes
 */
export function hasAnySecurityScope(user: User | null, requiredScopes: string[]): boolean {
    if (!user || !user.securityScopes || requiredScopes.length === 0) {
        return false;
    }

    return requiredScopes.some(scope => user.securityScopes!.includes(scope));
}

/**
 * Get user display name
 */
export function getUserDisplayName(user: User | null): string {
    if (!user) return '';

    const fullName = `${user.firstName} ${user.lastName}`.trim();
    return fullName || user.email;
}

/**
 * Generate a random state string for CSRF protection
 */
export function generateRandomState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}
