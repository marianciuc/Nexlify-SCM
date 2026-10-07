export type OrderStatus =
    | 'DRAFT'
    | 'SUBMITTED'
    | 'RESERVED'
    | 'CANCELLED_OUT_OF_STOCK'
    | 'AWAITING_PAYMENT'
    | 'PAID'
    | 'PAYMENT_FAILED'
    | 'IN_PROCESSING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'DISPUTED';

export type IncotermsCode = 'DAP' | 'DDP' | 'FCA' | 'EXW' | 'CPT' | 'CIF';

export interface OrderItem {
    sku: string;
    name: string;
    quantity: number;
    unitPrice: number;
    unit?: string;
    brand?: string;
    brandCode?: string;
    manufacturer?: string;
    manufacturerCountry?: string;
    dimensions?: string;
    weightKg?: number;
}

export interface Order {
    id: string;
    orderNumber: string;
    customerName: string;
    status: OrderStatus;
    totalAmount: number;
    currency: string;
    itemsCount: number;
    deliveryCity: string;
    deliveryAddress?: string;
    deliveryPostalCode?: string;
    incoterms?: IncotermsCode;
    slaTargetDate?: string;
    slaMaxTransitHours?: number;
    guaranteedOtifPercent?: number;
    createdAt: string;
    items?: OrderItem[];
}

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export type UnitOfMeasure =
    | 'pcs'
    | 'kg'
    | 'g'
    | 'l'
    | 'ml'
    | 'm'
    | 'cm'
    | 'mm'
    | 'm2'
    | 'm3'
    | 'box'
    | 'pallet'
    | 'pack';

export interface CategoryNode {
    id: string;
    name: string;
    slug: string;
    description?: string;
    parentId?: string | null;
    parentName?: string | null;
    children?: CategoryNode[];
    productCount?: number;
    isActive: boolean;
    sortOrder?: number;
}

export interface Brand {
    id: string;
    code?: string;
    name: string;
    description?: string;
    website?: string;
    isActive: boolean;
    createdAt?: string;
}

export interface Manufacturer {
    id: string;
    code?: string;
    name: string;
    country?: string;
    website?: string;
    contactEmail?: string;
    isActive: boolean;
    createdAt?: string;
}

export interface ProductDimensions {
    height?: number;
    width?: number;
    depth?: number;
    unit?: 'mm' | 'cm' | 'm' | 'in';
}

export interface StockItem {
    id: string;
    sku: string;
    ean?: string;
    name: string;
    category: string;
    categoryId?: string;
    subcategory?: string;
    subcategoryId?: string;
    brand?: string;
    brandId?: string;
    manufacturer?: string;
    manufacturerId?: string;
    warehouse: string;
    warehouseId?: string;
    quantityAvailable: number;
    quantityReserved: number;
    unit: string;
    unitPrice: number;
    status: StockStatus;
    dimensions?: string;
    weightKg?: number;
    minOrderQuantity?: number;
}

export type ShipmentStatus = 'PLANNED' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED';

export interface Shipment {
    id: string;
    trackingNumber: string;
    orderNumber: string;
    carrier: string;
    origin: string;
    destination: string;
    distanceKm: number;
    eta: string;
    vehicle: string;
    status: ShipmentStatus;
}

export interface RouteOptimizationResult {
    distanceKm: number;
    durationHours: number;
    costPln: number;
    co2Kg: number;
}

export type PaymentStatus = 'PAID' | 'UNPAID' | 'OVERDUE' | 'UNKNOWN';
export type PaymentMethod = 'SPLIT_PAYMENT' | 'NET_30' | 'STRIPE';

export interface Invoice {
    id: string;
    invoiceNumber: string;
    orderNumber: string;
    buyerName: string;
    buyerNip: string;
    netAmount: number;
    vatAmount: number;
    grossAmount: number;
    currency: string;
    issueDate: string;
    dueDate: string;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
}

export interface Bid {
    id: string;
    rfqId: string;
    supplierId?: string;
    supplierName: string;
    supplierNip: string;
    bidAmount: number;
    currency: string;
    leadTimeDays: number;
    warrantyTerms: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    notes?: string;
    submittedAt: string;
    items?: {
        id: string;
        rfqItemId?: string;
        offeredSku?: string;
        productName?: string;
        quantity: number;
        unitPrice: number;
        isAlternative?: boolean;
        alternativeReason?: string;
        leadTimeDays?: number;
    }[];
}

export interface RfqItem {
    id: string;
    rfqNumber: string;
    title: string;
    category: string;
    description: string;
    issuerName: string;
    deliveryLocation: string;
    deadline: string;
    targetBudget: number;
    currency: string;
    status: 'DRAFT' | 'OPEN' | 'EVALUATION' | 'AWARDED' | 'CLOSED';
    requiredQuantity: number;
    unitOfMeasure: string;
    createdAt: string;
    bids: Bid[];
    items?: {
        id: string;
        sku: string;
        name: string;
        quantity: number;
        unit: string;
        description?: string;
        allowSubstitute: boolean;
        targetUnitPrice?: number;
    }[];
    awardedSupplierName?: string;
    awardedAmount?: number;
}

export interface ScmAnalyticsKpi {
    otifRate: number;
    otifTarget: number;
    averageLeadTimeDays: number;
    leadTimeTargetDays: number;
    serviceLevelSla: number;
    totalThroughputTons: number;
    activeSuppliers: number;
    warehouseUtilizationRate: number;
    costSavingsTotal: number;
    currency: string;
    activeRoutesCount: number;
    fleetEfficiencyScore: number;
}
