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

export interface StockItem {
    id: string;
    sku: string;
    name: string;
    category: string;
    warehouse: string;
    quantityAvailable: number;
    quantityReserved: number;
    unit: string;
    unitPrice: number;
    status: StockStatus;
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

export type PaymentStatus = 'PAID' | 'UNPAID' | 'OVERDUE';
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
    status: 'OPEN' | 'EVALUATION' | 'AWARDED' | 'CLOSED';
    requiredQuantity: number;
    unitOfMeasure: string;
    createdAt: string;
    bids: Bid[];
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
