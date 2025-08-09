// Client types for API responses and security scopes

export interface SecurityScopesResponse {
    scopes: string[];
}

export interface ApiError {
    message: string;
    code?: string;
    status?: number;
    details?: unknown;
}

export interface ApiResponse<T = unknown> {
    data: T;
    message?: string;
    status: number;
}

// Company-related requests
export interface CompanyExistsRequest {
    country_code: string;
    tax_id: string;
}

export interface GetCompanyRequest {
    countryCode: string;
    taxId: string;
}

export interface CreateCompanyRequest {
    name: string;
    taxId: string;
    country: string;
    address?: string;
    // Add more company fields as needed
}

// Company-related responses
export interface CompanyExistsResponse {
    exists: boolean;
}

export interface GetCompanyResponse {
    id: string;
    name: string;
    taxId: string;
    country: string;
    address?: string;
    // Add more company fields as needed
}

export interface CreateCompanyResponse {
    id: string;
    name: string;
    taxId: string;
    country: string;
    address?: string;
    // Add more company fields as needed
}

// Add more client-specific types as needed
