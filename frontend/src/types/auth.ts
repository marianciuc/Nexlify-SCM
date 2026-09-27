export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    companyId?: string;
    role?: string;
    securityScopes?: string[];
}

export class AuthError extends Error {
    code: string;

    constructor(message: string, code = 'AUTH_ERROR') {
        super(message);
        this.name = 'AuthError';
        this.code = code;
    }
}
