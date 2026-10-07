import useEnvironmentStore from '@/service/env/environment-store';
import type { CategoryNode, Brand, Manufacturer } from '@/types/scm-domain';

export interface CreateCategoryPayload {
    name: string;
    slug?: string;
    description?: string;
    parentId?: string | null;
    sortOrder?: number;
}

export interface CreateBrandPayload {
    name: string;
    code?: string;
    description?: string;
    website?: string;
}

export interface CreateManufacturerPayload {
    name: string;
    code?: string;
    country?: string;
    website?: string;
    contactEmail?: string;
}

export interface ProductQueryParams {
    search?: string;
    categoryId?: string;
    brandId?: string;
    manufacturerId?: string;
}

export interface ProductCatalogRecord {
    id: string;
    sku: string;
    name: string;
    description?: string;
    categoryId?: string;
    categoryName?: string;
    unit?: string;
    unitPrice?: number | string;
    currency?: string;
    weightKg?: number | string;
    dimensions?: string;
    manufacturer?: string;
    brand?: string;
    brandId?: string;
    manufacturerId?: string;
    minOrderQuantity?: number;
    reorderPoint?: number;
    totalAvailable?: number;
    totalReserved?: number;
    isActive?: boolean;
}

function getAuthHeaders() {
    const { getBaseUrl, currentTenant } = useEnvironmentStore.getState();
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    return {
        baseUrl: getBaseUrl(),
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            'X-Tenant-Id': currentTenant?.id || 'ten-waw-01',
        },
    };
}

export const inventoryClient = {
    async getCategories(): Promise<CategoryNode[]> {
        const { baseUrl, headers } = getAuthHeaders();
        const res = await fetch(`${baseUrl}/api/v1/inventory/categories`, { headers });
        if (!res.ok) throw new Error(`Failed to fetch categories: ${res.statusText}`);
        return res.json();
    },

    async getRootCategories(): Promise<CategoryNode[]> {
        const { baseUrl, headers } = getAuthHeaders();
        const res = await fetch(`${baseUrl}/api/v1/inventory/categories/root`, { headers });
        if (!res.ok) throw new Error(`Failed to fetch root categories: ${res.statusText}`);
        return res.json();
    },

    async createCategory(payload: CreateCategoryPayload): Promise<CategoryNode> {
        const { baseUrl, headers } = getAuthHeaders();
        const res = await fetch(`${baseUrl}/api/v1/inventory/categories`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`Failed to create category: ${res.statusText}`);
        return res.json();
    },

    async getBrands(): Promise<Brand[]> {
        const { baseUrl, headers } = getAuthHeaders();
        const res = await fetch(`${baseUrl}/api/v1/inventory/brands`, { headers });
        if (!res.ok) throw new Error(`Failed to fetch brands: ${res.statusText}`);
        return res.json();
    },

    async createBrand(payload: CreateBrandPayload): Promise<Brand> {
        const { baseUrl, headers } = getAuthHeaders();
        const res = await fetch(`${baseUrl}/api/v1/inventory/brands`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`Failed to create brand: ${res.statusText}`);
        return res.json();
    },

    async getManufacturers(): Promise<Manufacturer[]> {
        const { baseUrl, headers } = getAuthHeaders();
        const res = await fetch(`${baseUrl}/api/v1/inventory/manufacturers`, { headers });
        if (!res.ok) throw new Error(`Failed to fetch manufacturers: ${res.statusText}`);
        return res.json();
    },

    async createManufacturer(payload: CreateManufacturerPayload): Promise<Manufacturer> {
        const { baseUrl, headers } = getAuthHeaders();
        const res = await fetch(`${baseUrl}/api/v1/inventory/manufacturers`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`Failed to create manufacturer: ${res.statusText}`);
        return res.json();
    },

    async getProducts(params?: ProductQueryParams): Promise<ProductCatalogRecord[]> {
        const { baseUrl, headers } = getAuthHeaders();
        const query = new URLSearchParams();
        if (params?.search) query.set('search', params.search);
        if (params?.categoryId) query.set('categoryId', params.categoryId);
        if (params?.brandId) query.set('brandId', params.brandId);
        if (params?.manufacturerId) query.set('manufacturerId', params.manufacturerId);

        const url = `${baseUrl}/api/v1/inventory/products${query.toString() ? `?${query.toString()}` : ''}`;
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error(`Failed to fetch products: ${res.statusText}`);
        return res.json();
    },

    async createProduct(payload: any): Promise<any> {
        const { baseUrl, headers } = getAuthHeaders();
        const res = await fetch(`${baseUrl}/api/v1/inventory/products`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`Failed to create product: ${res.statusText}`);
        return res.json();
    },
};

export default inventoryClient;
