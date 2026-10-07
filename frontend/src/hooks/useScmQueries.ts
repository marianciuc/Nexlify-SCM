import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'sonner';

import analyticsClient from '@/service/api/clients/analytics-client';
import billingClient from '@/service/api/clients/billing-client';
import inventoryClient, {
    type ProductCatalogRecord,
    type CreateCategoryPayload,
    type CreateBrandPayload,
    type CreateManufacturerPayload,
} from '@/service/api/clients/inventory-client';
import logisticsClient from '@/service/api/clients/logistics-client';
import ordersClient from '@/service/api/clients/orders-client';
import rfqClient from '@/service/api/clients/rfq-client';
import type {CreateRfqPayload} from '@/service/api/clients/rfq-client';
import warehouseClient, {type RouteOptimizationRequest} from '@/service/api/clients/warehouse-client';
import useEnvironmentStore from '@/service/env/environment-store';
import { useNotificationStore } from '@/service/websocket/notification-store';
import type {
    Order,
    OrderStatus,
    StockItem,
    CategoryNode,
    Brand,
    Manufacturer,
    Shipment,
    RouteOptimizationResult,
    Invoice,
    ScmAnalyticsKpi,
    RfqItem,
} from '@/types/scm-domain';

// --- Storage Keys for Optimistic Local Persistence ---
export const STORAGE_ORDERS_KEY = 'nexlify_local_orders';
export const STORAGE_RFQS_KEY = 'nexlify_local_rfqs';
export const STORAGE_INVENTORY_KEY = 'nexlify_local_inventory';
export const STORAGE_CATEGORIES_KEY = 'nexlify_local_categories';
export const STORAGE_BRANDS_KEY = 'nexlify_local_brands';
export const STORAGE_MANUFACTURERS_KEY = 'nexlify_local_manufacturers';
export const STORAGE_CLAIMS_KEY = 'nexlify_local_claims';
export const STORAGE_ECMR_KEY = 'nexlify_local_ecmr';
export const STORAGE_FLEET_KEY = 'nexlify_local_fleet';
export const STORAGE_KYC_KEY = 'nexlify_local_kyc_applications';
export const STORAGE_TENANTS_KEY = 'nexlify_local_tenants';

export function getStoredOrDefault<T>(key: string, defaultVal: T): T {
    if (typeof window === 'undefined') return defaultVal;
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultVal;
    } catch {
        return defaultVal;
    }
}

export function saveToStorage<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Storage can be unavailable in private browsing; API state remains usable.
    }
}

// --- Baseline Fallback Seed Datasets ---

export const INITIAL_ORDERS: Order[] = [
    {
        id: '11111111-1111-1111-1111-111111111111',
        orderNumber: 'ORD-2026-0891',
        customerName: 'Baltic Retail Group Sp. z o.o.',
        status: 'SUBMITTED',
        totalAmount: 28450.0,
        currency: 'PLN',
        itemsCount: 140,
        deliveryCity: 'Warszawa',
        createdAt: '2 hours ago',
        items: [
            {
                sku: 'SKU-PAL-01',
                name: 'EPAL Euro-Pallet Standard (Pine Wood)',
                quantity: 100,
                unitPrice: 120.0,
                unit: 'pcs',
                brand: 'EPAL (European Pallet Association)',
                brandCode: 'EPAL',
                manufacturer: 'Drewnex Palety Sp. z o.o.',
                manufacturerCountry: 'Poland',
                dimensions: '1200×800×144 mm',
                weightKg: 25.0,
            },
            {
                sku: 'SKU-STR-05',
                name: 'Industrial Stretch Film 23mic',
                quantity: 40,
                unitPrice: 411.25,
                unit: 'rolls',
                brand: 'PlastChem Industrial',
                brandCode: 'PLASTCHEM',
                manufacturer: 'PlastChem Poly-Works Sp. k.',
                manufacturerCountry: 'Poland',
                dimensions: '500×120 mm',
                weightKg: 3.2,
            },
        ],
    },
    {
        id: '22222222-2222-2222-2222-222222222222',
        orderNumber: 'ORD-2026-0892',
        customerName: 'Silesia Freight & Logistics S.A.',
        status: 'RESERVED',
        totalAmount: 14200.5,
        currency: 'PLN',
        itemsCount: 10,
        deliveryCity: 'Katowice',
        createdAt: '5 hours ago',
        items: [
            {
                sku: 'SKU-HYD-02',
                name: 'Hydraulic Hand Pallet Truck 2.5t',
                quantity: 10,
                unitPrice: 1420.05,
                unit: 'units',
                brand: 'Jungheinrich AG',
                brandCode: 'JUNGHEINRICH',
                manufacturer: 'Jungheinrich Manufacturing N.V.',
                manufacturerCountry: 'Germany',
                dimensions: '1540×540×1230 mm',
                weightKg: 68.0,
            },
        ],
    },
    {
        id: '33333333-3333-3333-3333-333333333333',
        orderNumber: 'ORD-2026-0893',
        customerName: 'Pomerania Foods Sp. k.',
        status: 'SHIPPED',
        totalAmount: 67300.0,
        currency: 'PLN',
        itemsCount: 300,
        deliveryCity: 'Gdańsk',
        createdAt: 'Yesterday',
        items: [
            {
                sku: 'SKU-COL-09',
                name: 'Insulated Thermobox 60L Pharma/Food',
                quantity: 300,
                unitPrice: 224.33,
                unit: 'boxes',
                brand: 'Thermax Cold Chain Tech',
                brandCode: 'THERMAX',
                manufacturer: 'ThermaSafe Solutions S.A.',
                manufacturerCountry: 'France',
                dimensions: '600×400×380 mm',
                weightKg: 4.8,
            },
        ],
    },
];

export const INITIAL_CATEGORIES: CategoryNode[] = [
    {
        id: 'cat-pkg',
        name: 'Packaging & Cargo Units',
        slug: 'packaging-cargo-units',
        isActive: true,
        sortOrder: 1,
        children: [
            {
                id: 'cat-pkg-pallets',
                name: 'Euro Pallets & Wooden Units (EPAL, CP)',
                slug: 'euro-pallets-wooden',
                parentId: 'cat-pkg',
                parentName: 'Packaging & Cargo Units',
                isActive: true,
                sortOrder: 1,
            },
            {
                id: 'cat-pkg-plastic',
                name: 'Plastic & Heavy-Duty Pallets',
                slug: 'plastic-heavy-duty-pallets',
                parentId: 'cat-pkg',
                parentName: 'Packaging & Cargo Units',
                isActive: true,
                sortOrder: 2,
            },
            {
                id: 'cat-pkg-ibc',
                name: 'Containers & IBC Tanks',
                slug: 'containers-ibc-tanks',
                parentId: 'cat-pkg',
                parentName: 'Packaging & Cargo Units',
                isActive: true,
                sortOrder: 3,
            },
        ],
    },
    {
        id: 'cat-supplies',
        name: 'Packaging Supplies',
        slug: 'packaging-supplies',
        isActive: true,
        sortOrder: 2,
        children: [
            {
                id: 'cat-supplies-film',
                name: 'Industrial Stretch Film & Wrap',
                slug: 'stretch-film-wrap',
                parentId: 'cat-supplies',
                parentName: 'Packaging Supplies',
                isActive: true,
                sortOrder: 1,
            },
            {
                id: 'cat-supplies-strapping',
                name: 'PP/PET Strapping & Security Tape',
                slug: 'strapping-security-tape',
                parentId: 'cat-supplies',
                parentName: 'Packaging Supplies',
                isActive: true,
                sortOrder: 2,
            },
        ],
    },
    {
        id: 'cat-mhe',
        name: 'Material Handling Equipment',
        slug: 'material-handling-equipment',
        isActive: true,
        sortOrder: 3,
        children: [
            {
                id: 'cat-mhe-pallet-trucks',
                name: 'Hydraulic & Electric Pallet Trucks',
                slug: 'pallet-trucks',
                parentId: 'cat-mhe',
                parentName: 'Material Handling Equipment',
                isActive: true,
                sortOrder: 1,
            },
            {
                id: 'cat-mhe-stackers',
                name: 'Forklifts & Electric Stackers',
                slug: 'forklifts-stackers',
                parentId: 'cat-mhe',
                parentName: 'Material Handling Equipment',
                isActive: true,
                sortOrder: 2,
            },
        ],
    },
    {
        id: 'cat-cold',
        name: 'Cold Chain Equipment',
        slug: 'cold-chain-equipment',
        isActive: true,
        sortOrder: 4,
        children: [
            {
                id: 'cat-cold-thermoboxes',
                name: 'Insulated Thermoboxes & Shippers',
                slug: 'insulated-thermoboxes',
                parentId: 'cat-cold',
                parentName: 'Cold Chain Equipment',
                isActive: true,
                sortOrder: 1,
            },
            {
                id: 'cat-cold-loggers',
                name: 'Temperature Data Loggers & IoT Sensors',
                slug: 'data-loggers-iot',
                parentId: 'cat-cold',
                parentName: 'Cold Chain Equipment',
                isActive: true,
                sortOrder: 2,
            },
        ],
    },
];

export const INITIAL_BRANDS: Brand[] = [
    { id: 'b-epal', code: 'EPAL', name: 'EPAL (European Pallet Association)', website: 'https://www.epal-pallets.org', isActive: true },
    { id: 'b-plastchem', code: 'PLASTCHEM', name: 'PlastChem Industrial', website: 'https://plastchem.eu', isActive: true },
    { id: 'b-jungheinrich', code: 'JUNGHEINRICH', name: 'Jungheinrich AG', website: 'https://www.jungheinrich.com', isActive: true },
    { id: 'b-thermax', code: 'THERMAX', name: 'Thermax Cold Chain Tech', website: 'https://thermax-cold.com', isActive: true },
    { id: 'b-toyota', code: 'TOYOTA', name: 'Toyota Material Handling', website: 'https://toyota-forklifts.eu', isActive: true },
    { id: 'b-signode', code: 'SIGNODE', name: 'Signode Industrial Group', website: 'https://signode.com', isActive: true },
];

export const INITIAL_MANUFACTURERS: Manufacturer[] = [
    { id: 'm-drewnex', code: 'DREWNEX', name: 'Drewnex Palety Sp. z o.o.', country: 'Poland', website: 'https://drewnex.pl', contactEmail: 'sales@drewnex.pl', isActive: true },
    { id: 'm-plastchem', code: 'PLASTCHEM-MFG', name: 'PlastChem Poly-Works Sp. k.', country: 'Poland', website: 'https://plastchem.eu', contactEmail: 'b2b@plastchem.eu', isActive: true },
    { id: 'm-jungheinrich-de', code: 'JUNG-DE', name: 'Jungheinrich Manufacturing N.V.', country: 'Germany', website: 'https://jungheinrich.com', contactEmail: 'info@jungheinrich.com', isActive: true },
    { id: 'm-thermasafe', code: 'THERMASAFE', name: 'ThermaSafe Solutions S.A.', country: 'France', website: 'https://thermasafe.fr', contactEmail: 'orders@thermasafe.fr', isActive: true },
    { id: 'm-logitech', code: 'LOGITECH-IND', name: 'LogiTech Nordics AB', country: 'Sweden', website: 'https://logitech-nordics.se', contactEmail: 'support@logitech-nordics.se', isActive: true },
];

export const INITIAL_STOCK: StockItem[] = [
    {
        id: '1',
        sku: 'SKU-PAL-01',
        name: 'EPAL Euro-Pallet Standard (Pine)',
        category: 'Packaging & Cargo Units',
        categoryId: 'cat-pkg',
        subcategory: 'Euro Pallets & Wooden Units (EPAL, CP)',
        subcategoryId: 'cat-pkg-pallets',
        brand: 'EPAL (European Pallet Association)',
        brandId: 'b-epal',
        manufacturer: 'Drewnex Palety Sp. z o.o.',
        manufacturerId: 'm-drewnex',
        warehouse: 'Central DC Warszawa (WH-WAW-01)',
        quantityAvailable: 1850,
        quantityReserved: 100,
        unit: 'pcs',
        unitPrice: 120.0,
        status: 'IN_STOCK',
        dimensions: '1200x800x144 mm',
        weightKg: 25.0,
    },
    {
        id: '2',
        sku: 'SKU-STR-05',
        name: 'Industrial Stretch Film 23mic (Roll 300m)',
        category: 'Packaging Supplies',
        categoryId: 'cat-supplies',
        subcategory: 'Industrial Stretch Film & Wrap',
        subcategoryId: 'cat-supplies-film',
        brand: 'PlastChem Industrial',
        brandId: 'b-plastchem',
        manufacturer: 'PlastChem Poly-Works Sp. k.',
        manufacturerId: 'm-plastchem',
        warehouse: 'Central DC Warszawa (WH-WAW-01)',
        quantityAvailable: 420,
        quantityReserved: 40,
        unit: 'rolls',
        unitPrice: 411.25,
        status: 'IN_STOCK',
        dimensions: '500x120 mm',
        weightKg: 3.2,
    },
    {
        id: '3',
        sku: 'SKU-HYD-02',
        name: 'Hydraulic Hand Pallet Truck 2.5t',
        category: 'Material Handling Equipment',
        categoryId: 'cat-mhe',
        subcategory: 'Hydraulic & Electric Pallet Trucks',
        subcategoryId: 'cat-mhe-pallet-trucks',
        brand: 'Jungheinrich AG',
        brandId: 'b-jungheinrich',
        manufacturer: 'Jungheinrich Manufacturing N.V.',
        manufacturerId: 'm-jungheinrich-de',
        warehouse: 'Port Logistics Hub Szczecin (WH-SZC-02)',
        quantityAvailable: 18,
        quantityReserved: 10,
        unit: 'units',
        unitPrice: 1420.05,
        status: 'LOW_STOCK',
        dimensions: '1540x540x1230 mm',
        weightKg: 68.0,
    },
    {
        id: '4',
        sku: 'SKU-COL-09',
        name: 'Insulated Thermobox 60L Pharma/Food',
        category: 'Cold Chain Equipment',
        categoryId: 'cat-cold',
        subcategory: 'Insulated Thermoboxes & Shippers',
        subcategoryId: 'cat-cold-thermoboxes',
        brand: 'Thermax Cold Chain Tech',
        brandId: 'b-thermax',
        manufacturer: 'ThermaSafe Solutions S.A.',
        manufacturerId: 'm-thermasafe',
        warehouse: 'Central DC Warszawa (WH-WAW-01)',
        quantityAvailable: 850,
        quantityReserved: 300,
        unit: 'boxes',
        unitPrice: 224.33,
        status: 'IN_STOCK',
        dimensions: '600x400x380 mm',
        weightKg: 4.8,
    },
];

export const INITIAL_SHIPMENTS: Shipment[] = [
    {
        id: '1',
        trackingNumber: 'TRK-PL-88219',
        orderNumber: 'ORD-2026-0893',
        carrier: 'Nexlify Fleet Express',
        origin: 'Warszawa (DC-01)',
        destination: 'Gdańsk Port',
        distanceKm: 342.5,
        eta: '1h 15m remaining',
        vehicle: 'WI 49102 (Scania R450)',
        status: 'IN_TRANSIT',
    },
    {
        id: '2',
        trackingNumber: 'TRK-PL-88220',
        orderNumber: 'ORD-2026-0892',
        carrier: 'Baltic Heavy Freight',
        origin: 'Szczecin Hub',
        destination: 'Katowice',
        distanceKm: 528.0,
        eta: 'Tomorrow, 09:00',
        vehicle: 'ZS 8831A (Volvo FH)',
        status: 'PLANNED',
    },
    {
        id: '3',
        trackingNumber: 'TRK-PL-88218',
        orderNumber: 'ORD-2026-0888',
        carrier: 'Nexlify Fleet Express',
        origin: 'Warszawa (DC-01)',
        destination: 'Poznań Logistics Hub',
        distanceKm: 310.2,
        eta: 'Delivered',
        vehicle: 'WI 30219 (MAN TGX)',
        status: 'DELIVERED',
    },
];

export const INITIAL_INVOICES: Invoice[] = [
    {
        id: '1',
        invoiceNumber: 'FV/2026/09/0042',
        orderNumber: 'ORD-2026-0893',
        buyerName: 'Pomerania Foods Sp. k.',
        buyerNip: '5832918471',
        netAmount: 67300.0,
        vatAmount: 15479.0,
        grossAmount: 82779.0,
        currency: 'PLN',
        issueDate: '2026-09-21',
        dueDate: '2026-10-21',
        paymentStatus: 'PAID',
        paymentMethod: 'SPLIT_PAYMENT',
    },
    {
        id: '2',
        invoiceNumber: 'FV/2026/09/0043',
        orderNumber: 'ORD-2026-0891',
        buyerName: 'Baltic Retail Group Sp. z o.o.',
        buyerNip: '8522619472',
        netAmount: 28450.0,
        vatAmount: 6543.5,
        grossAmount: 34993.5,
        currency: 'PLN',
        issueDate: '2026-09-23',
        dueDate: '2026-10-23',
        paymentStatus: 'UNPAID',
        paymentMethod: 'NET_30',
    },
];

export const INITIAL_KPIS: ScmAnalyticsKpi = {
    otifRate: 98.4,
    otifTarget: 95.0,
    averageLeadTimeDays: 2.3,
    leadTimeTargetDays: 3.0,
    serviceLevelSla: 99.2,
    totalThroughputTons: 1842.5,
    activeSuppliers: 48,
    warehouseUtilizationRate: 84.6,
    costSavingsTotal: 142500.0,
    currency: 'PLN',
    activeRoutesCount: 19,
    fleetEfficiencyScore: 94.8,
};

export const INITIAL_RFQS: RfqItem[] = [
    {
        id: '10000000-0000-0000-0000-000000000001',
        rfqNumber: 'RFQ-2026-0101',
        title: 'Bulk Supply: EPAL Euro-Pallets Standard (2,500 pcs)',
        category: 'Packaging & Pallets',
        description: 'Procurement of 2,500 new EPAL 1200x800mm wooden pallets for automated high-bay warehouse operations.',
        issuerName: 'Nexlify Central Hub S.A.',
        deliveryLocation: 'Warszawa Central DC (DC-01)',
        deadline: '2026-10-04',
        targetBudget: 125000.0,
        currency: 'PLN',
        status: 'OPEN',
        requiredQuantity: 2500,
        unitOfMeasure: 'pcs',
        createdAt: '2 days ago',
        bids: [
            {
                id: '11000000-0000-0000-0000-000000000001',
                rfqId: '10000000-0000-0000-0000-000000000001',
                supplierName: 'Drewnex Palety Sp. z o.o.',
                supplierNip: '7822910483',
                bidAmount: 115000.0,
                currency: 'PLN',
                leadTimeDays: 5,
                warrantyTerms: '12 months standard EPAL warranty',
                status: 'PENDING',
                notes: 'Certified UIC/EPAL dry pine wood, delivered in 3 batches.',
                submittedAt: '12 hours ago',
            },
            {
                id: '12000000-0000-0000-0000-000000000002',
                rfqId: '10000000-0000-0000-0000-000000000001',
                supplierName: 'TimberPack Polska S.A.',
                supplierNip: '5219482014',
                bidAmount: 118500.0,
                currency: 'PLN',
                leadTimeDays: 3,
                warrantyTerms: '24 months manufacturer warranty',
                status: 'PENDING',
                notes: 'Fast delivery available within 72 hours to Warsaw Hub.',
                submittedAt: '6 hours ago',
            },
        ],
    },
    {
        id: '20000000-0000-0000-0000-000000000002',
        rfqNumber: 'RFQ-2026-0102',
        title: 'Tender: Multi-layer Stretch Film 23mic (120 Rolls / 16t)',
        category: 'Packaging Materials',
        description: 'Supply of 16 metric tons of industrial blown stretch wrap for automated pallet wrappers.',
        issuerName: 'Silesia Freight & Logistics S.A.',
        deliveryLocation: 'Katowice Logistics Hub (DC-02)',
        deadline: '2026-09-23',
        targetBudget: 52000.0,
        currency: 'PLN',
        status: 'AWARDED',
        requiredQuantity: 120,
        unitOfMeasure: 'rolls',
        createdAt: '1 week ago',
        awardedSupplierName: 'PlastChem Industrial Sp. k.',
        awardedAmount: 48200.0,
        bids: [
            {
                id: '21000000-0000-0000-0000-000000000001',
                rfqId: '20000000-0000-0000-0000-000000000002',
                supplierName: 'PlastChem Industrial Sp. k.',
                supplierNip: '8942019485',
                bidAmount: 48200.0,
                currency: 'PLN',
                leadTimeDays: 7,
                warrantyTerms: 'Compliance certificate with ISO 9001',
                status: 'ACCEPTED',
                notes: 'Machine grade stretch film 23um, high puncture resistance.',
                submittedAt: '3 days ago',
            },
        ],
    },
    {
        id: '30000000-0000-0000-0000-000000000003',
        rfqNumber: 'RFQ-2026-0103',
        title: 'Refrigerated Cross-Border Transport (Szczecin -> Hamburg)',
        category: 'Fleet & Transport',
        description: 'Bi-weekly FTL refrigerated freight (temperature control +2°C to +4°C) for Baltic seafood export.',
        issuerName: 'Pomerania Foods Sp. k.',
        deliveryLocation: 'Szczecin Sea Port Terminal -> Hamburg Central',
        deadline: '2026-10-08',
        targetBudget: 36000.0,
        currency: 'PLN',
        status: 'OPEN',
        requiredQuantity: 12,
        unitOfMeasure: 'FTL trips',
        createdAt: '18 hours ago',
        bids: [],
    },
];

// --- Custom Query & Mutation Hooks ---

export function useOrdersQuery() {
    const {currentTenant} = useEnvironmentStore();

    return useQuery<Order[]>({
        queryKey: ['orders', currentTenant.id],
        queryFn: async () => {
            try {
                const res = await ordersClient.getOrders();
                const list = res.content || (Array.isArray(res) ? res : null);
                if (list && list.length > 0) {
                    return list.map((item: any) => ({
                        id: item.id,
                        orderNumber: item.orderNumber || `ORD-${item.id.slice(0, 8)}`,
                        customerName: item.customerName || 'Baltic Retail Group Sp. z o.o.',
                        status: item.status || 'SUBMITTED',
                        totalAmount: Number(item.totalAmount || item.totalPrice || 28450),
                        currency: item.currency || 'PLN',
                        itemsCount: item.items?.length || 1,
                        deliveryCity: item.deliveryCity || 'Warszawa',
                        createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Dzisiaj',
                        items: item.items || [],
                    }));
                }
            } catch {
                // Graceful fallback to cached/initial orders if backend is initializing
            }
            return getStoredOrDefault<Order[]>(STORAGE_ORDERS_KEY, INITIAL_ORDERS);
        },
        staleTime: 30 * 1000,
    });
}

export function useCreateOrderMutation() {
    const queryClient = useQueryClient();
    const {currentTenant} = useEnvironmentStore();

    return useMutation({
        mutationFn: async (newOrder: Partial<Order> & { deliveryAddress?: string; notes?: string; requestedDeliveryDate?: string }) => {
            const remoteResult = await ordersClient.createOrder({
                deliveryAddress: newOrder.deliveryAddress || '',
                deliveryCity: newOrder.deliveryCity || 'Warszawa',
                currency: newOrder.currency || 'PLN',
                notes: newOrder.notes,
                requestedDeliveryDate: newOrder.requestedDeliveryDate,
                items: (newOrder.items || []).map((it) => ({
                    sku: it.sku,
                    productName: it.name,
                    quantity: it.quantity,
                    unitPrice: it.unitPrice,
                })),
            });
            const fullOrder: Order = {
                id: remoteResult?.id || newOrder.id || 'ord-' + Math.random().toString(36).substring(2, 9),
                orderNumber: remoteResult?.orderNumber || newOrder.orderNumber || `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                customerName: newOrder.customerName || 'Baltic Retail Group Sp. z o.o.',
                status: (remoteResult?.status as OrderStatus) || (newOrder.status as OrderStatus) || 'SUBMITTED',
                totalAmount: newOrder.totalAmount || 0,
                currency: newOrder.currency || 'PLN',
                itemsCount: newOrder.items?.length || 1,
                deliveryCity: newOrder.deliveryCity || 'Warszawa',
                createdAt: 'Just now',
                items: newOrder.items || [],
            };
            return fullOrder;
        },
        onSuccess: (createdOrder) => {
            queryClient.setQueryData<Order[]>(['orders', currentTenant.id], (old) => {
                const currentList = old || getStoredOrDefault<Order[]>(STORAGE_ORDERS_KEY, INITIAL_ORDERS);
                const updated = [createdOrder, ...currentList.filter((o) => o.id !== createdOrder.id)];
                saveToStorage(STORAGE_ORDERS_KEY, updated);
                return updated;
            });
            toast.success('Черновик заказа создан');
        },
    });
}

export function useUpdateOrderStatusMutation() {
    const queryClient = useQueryClient();
    const {currentTenant} = useEnvironmentStore();

    return useMutation({
        mutationFn: async ({orderId, nextStatus}: { orderId: string; nextStatus: OrderStatus }) => {
            return {orderId, nextStatus};
        },
        onSuccess: ({orderId, nextStatus}) => {
            queryClient.setQueryData<Order[]>(['orders', currentTenant.id], (old) => {
                const currentList = old || getStoredOrDefault<Order[]>(STORAGE_ORDERS_KEY, INITIAL_ORDERS);
                const updated = currentList.map((order) => (order.id === orderId ? {...order, status: nextStatus} : order));
                saveToStorage(STORAGE_ORDERS_KEY, updated);
                return updated;
            });
            toast.info(`Статус заказа обновлен: ${nextStatus}`);
        },
    });
}

export function useCategoriesQuery() {
    const {currentTenant} = useEnvironmentStore();

    return useQuery<CategoryNode[]>({
        queryKey: ['categories', currentTenant.id],
        queryFn: async () => {
            try {
                const data = await inventoryClient.getCategories();
                if (Array.isArray(data) && data.length > 0) {
                    return data;
                }
            } catch {
                // Fallback to local storage or initial dataset
            }
            return getStoredOrDefault<CategoryNode[]>(STORAGE_CATEGORIES_KEY, INITIAL_CATEGORIES);
        },
        staleTime: 60 * 1000,
    });
}

export function useCreateCategoryMutation() {
    const queryClient = useQueryClient();
    const {currentTenant} = useEnvironmentStore();

    return useMutation({
        mutationFn: async (payload: CreateCategoryPayload) => {
            try {
                return await inventoryClient.createCategory(payload);
            } catch {
                const slug = payload.slug || payload.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
                const newCat: CategoryNode = {
                    id: 'cat-' + Math.random().toString(36).substring(2, 8),
                    name: payload.name,
                    slug,
                    description: payload.description,
                    parentId: payload.parentId,
                    isActive: true,
                    children: [],
                };
                return newCat;
            }
        },
        onSuccess: (newCat, variables) => {
            queryClient.setQueryData<CategoryNode[]>(['categories', currentTenant.id], (old) => {
                const currentList = old || getStoredOrDefault<CategoryNode[]>(STORAGE_CATEGORIES_KEY, INITIAL_CATEGORIES);
                let updated: CategoryNode[];
                if (variables.parentId) {
                    updated = currentList.map((parent) => {
                        if (parent.id === variables.parentId) {
                            return {
                                ...parent,
                                children: [...(parent.children || []), newCat],
                            };
                        }
                        return parent;
                    });
                } else {
                    updated = [...currentList, newCat];
                }
                saveToStorage(STORAGE_CATEGORIES_KEY, updated);
                return updated;
            });
            toast.success(`Категория "${newCat.name}" успешно добавлена!`);
        },
    });
}

export function useBrandsQuery() {
    const {currentTenant} = useEnvironmentStore();

    return useQuery<Brand[]>({
        queryKey: ['brands', currentTenant.id],
        queryFn: async () => {
            try {
                const data = await inventoryClient.getBrands();
                if (Array.isArray(data) && data.length > 0) {
                    return data;
                }
            } catch {
                // Fallback to local storage or initial dataset
            }
            return getStoredOrDefault<Brand[]>(STORAGE_BRANDS_KEY, INITIAL_BRANDS);
        },
        staleTime: 60 * 1000,
    });
}

export function useCreateBrandMutation() {
    const queryClient = useQueryClient();
    const {currentTenant} = useEnvironmentStore();

    return useMutation({
        mutationFn: async (payload: CreateBrandPayload) => {
            try {
                return await inventoryClient.createBrand(payload);
            } catch {
                const code = payload.code || payload.name.toUpperCase().replace(/[^A-Z0-9]/g, '-');
                const newBrand: Brand = {
                    id: 'b-' + Math.random().toString(36).substring(2, 8),
                    code,
                    name: payload.name,
                    description: payload.description,
                    website: payload.website,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                };
                return newBrand;
            }
        },
        onSuccess: (newBrand) => {
            queryClient.setQueryData<Brand[]>(['brands', currentTenant.id], (old) => {
                const currentList = old || getStoredOrDefault<Brand[]>(STORAGE_BRANDS_KEY, INITIAL_BRANDS);
                const updated = [newBrand, ...currentList.filter((b) => b.id !== newBrand.id)];
                saveToStorage(STORAGE_BRANDS_KEY, updated);
                return updated;
            });
            toast.success(`Бренд "${newBrand.name}" успешно добавлен!`);
        },
    });
}

export function useManufacturersQuery() {
    const {currentTenant} = useEnvironmentStore();

    return useQuery<Manufacturer[]>({
        queryKey: ['manufacturers', currentTenant.id],
        queryFn: async () => {
            try {
                const data = await inventoryClient.getManufacturers();
                if (Array.isArray(data) && data.length > 0) {
                    return data;
                }
            } catch {
                // Fallback to local storage or initial dataset
            }
            return getStoredOrDefault<Manufacturer[]>(STORAGE_MANUFACTURERS_KEY, INITIAL_MANUFACTURERS);
        },
        staleTime: 60 * 1000,
    });
}

export function useCreateManufacturerMutation() {
    const queryClient = useQueryClient();
    const {currentTenant} = useEnvironmentStore();

    return useMutation({
        mutationFn: async (payload: CreateManufacturerPayload) => {
            try {
                return await inventoryClient.createManufacturer(payload);
            } catch {
                const code = payload.code || payload.name.toUpperCase().replace(/[^A-Z0-9]/g, '-');
                const newMfr: Manufacturer = {
                    id: 'm-' + Math.random().toString(36).substring(2, 8),
                    code,
                    name: payload.name,
                    country: payload.country,
                    website: payload.website,
                    contactEmail: payload.contactEmail,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                };
                return newMfr;
            }
        },
        onSuccess: (newMfr) => {
            queryClient.setQueryData<Manufacturer[]>(['manufacturers', currentTenant.id], (old) => {
                const currentList = old || getStoredOrDefault<Manufacturer[]>(STORAGE_MANUFACTURERS_KEY, INITIAL_MANUFACTURERS);
                const updated = [newMfr, ...currentList.filter((m) => m.id !== newMfr.id)];
                saveToStorage(STORAGE_MANUFACTURERS_KEY, updated);
                return updated;
            });
            toast.success(`Изготовитель "${newMfr.name}" успешно добавлен!`);
        },
    });
}

export function useInventoryQuery() {
    const {currentTenant} = useEnvironmentStore();
    const {isMockMode} = useEnvironmentStore();
    const queryClient = useQueryClient();
    const sourceQueryKey = ['inventory-source', currentTenant.id] as const;

    return useQuery<StockItem[]>({
        queryKey: ['inventory', currentTenant.id],
        queryFn: async () => {
            if (isMockMode) {
                queryClient.setQueryData(sourceQueryKey, 'demo');
                return getStoredOrDefault<StockItem[]>(STORAGE_INVENTORY_KEY, INITIAL_STOCK);
            }
            try {
                const [stockResult, productsResult] = await Promise.allSettled([
                    warehouseClient.getInventoryItems(),
                    inventoryClient.getProducts(),
                ]);
                const stockItems = stockResult.status === 'fulfilled' && Array.isArray(stockResult.value)
                    ? stockResult.value as StockItem[]
                    : [];
                const products = productsResult.status === 'fulfilled' && Array.isArray(productsResult.value)
                    ? productsResult.value
                    : [];

                if (stockResult.status === 'fulfilled' || productsResult.status === 'fulfilled') {
                    queryClient.setQueryData(sourceQueryKey, 'live');
                    const stockBySku = new Map(stockItems.map((item) => [item.sku, item]));
                    const merged = new Map<string, StockItem>();

                    for (const product of products) {
                        merged.set(product.sku, productToStockItem(product, stockBySku.get(product.sku)));
                    }
                    for (const stockItem of stockItems) {
                        if (!merged.has(stockItem.sku)) merged.set(stockItem.sku, stockItem);
                    }
                    return [...merged.values()];
                }
            } catch {
                // Continue to the explicitly marked cached/demo catalog.
            }
            const cachedItems = getStoredOrDefault<StockItem[] | null>(STORAGE_INVENTORY_KEY, null);
            if (cachedItems) {
                queryClient.setQueryData(sourceQueryKey, 'cached');
                return cachedItems;
            }
            queryClient.setQueryData(sourceQueryKey, 'demo');
            return INITIAL_STOCK;
        },
        staleTime: 60 * 1000,
    });
}

export type InventoryDataSource = 'live' | 'cached' | 'demo';

export function useInventoryDataSourceQuery() {
    const {currentTenant} = useEnvironmentStore();
    return useQuery<InventoryDataSource>({
        queryKey: ['inventory-source', currentTenant.id],
        queryFn: async (): Promise<InventoryDataSource> => 'demo',
        initialData: 'demo',
        staleTime: Infinity,
    });
}

function productToStockItem(product: ProductCatalogRecord, stock?: StockItem): StockItem {
    const available = stock?.quantityAvailable ?? Number(product.totalAvailable ?? 0);
    const unit = String(product.unit ?? stock?.unit ?? 'pcs').toLowerCase();
    const normalizedUnit = ({ pce: 'pcs', piece: 'pcs', pieces: 'pcs', box: 'boxes', roll: 'rolls' } as Record<string, string>)[unit] ?? unit;
    return {
        id: String(product.id || stock?.id || product.sku),
        sku: product.sku,
        name: product.name || stock?.name || product.sku,
        category: product.categoryName || stock?.category || '—',
        categoryId: product.categoryId || stock?.categoryId,
        brand: product.brand || stock?.brand,
        brandId: product.brandId || stock?.brandId,
        manufacturer: product.manufacturer || stock?.manufacturer,
        manufacturerId: product.manufacturerId || stock?.manufacturerId,
        warehouse: stock?.warehouse || '—',
        warehouseId: stock?.warehouseId,
        quantityAvailable: available,
        quantityReserved: stock?.quantityReserved ?? Number(product.totalReserved ?? 0),
        unit: normalizedUnit,
        unitPrice: Number(product.unitPrice ?? stock?.unitPrice ?? 0),
        status: (stock?.status || (available <= 0 ? 'OUT_OF_STOCK' : available <= Number(product.reorderPoint ?? 0) ? 'LOW_STOCK' : 'IN_STOCK')) as StockItem['status'],
        dimensions: product.dimensions || stock?.dimensions,
        weightKg: Number(product.weightKg ?? stock?.weightKg ?? 0) || undefined,
        minOrderQuantity: product.minOrderQuantity,
    };
}

export function useCreateProductMutation() {
    const queryClient = useQueryClient();
    const {currentTenant} = useEnvironmentStore();

    return useMutation({
        mutationFn: async (newItem: StockItem) => {
            return newItem;
        },
        onSuccess: (newItem) => {
            queryClient.setQueryData<StockItem[]>(['inventory', currentTenant.id], (old) => {
                const currentList = old || getStoredOrDefault<StockItem[]>(STORAGE_INVENTORY_KEY, INITIAL_STOCK);
                const updated = [newItem, ...currentList.filter((i) => i.sku !== newItem.sku)];
                saveToStorage(STORAGE_INVENTORY_KEY, updated);
                return updated;
            });
            toast.success(`Товар ${newItem.sku} (${newItem.name}) успешно добавлен в каталог и на склад!`);
        },
    });
}

export function useReserveStockMutation() {
    const queryClient = useQueryClient();
    const {currentTenant} = useEnvironmentStore();

    return useMutation({
        mutationFn: async ({sku, quantity}: { sku: string; quantity: number }) => {
            try {
                return await warehouseClient.reserveStock(sku, quantity);
            } catch {
                return {sku, quantity};
            }
        },
        onSuccess: (_, {sku, quantity}) => {
            queryClient.setQueryData<StockItem[]>(['inventory', currentTenant.id], (old = INITIAL_STOCK) =>
                old.map((item) => {
                    if (item.sku === sku && item.quantityAvailable >= quantity) {
                        return {
                            ...item,
                            quantityAvailable: item.quantityAvailable - quantity,
                            quantityReserved: item.quantityReserved + quantity,
                        };
                    }
                    return item;
                })
            );
            toast.success(`Товар зарезервирован на складе: ${quantity} шт. (${sku})`);
        },
    });
}

export function useShipmentsQuery() {
    const {currentTenant} = useEnvironmentStore();

    return useQuery<Shipment[]>({
        queryKey: ['shipments', currentTenant.id],
        queryFn: async () => {
            try {
                const res = await logisticsClient.getShipments();
                const list = res.content || (Array.isArray(res) ? res : null);
                if (list && list.length > 0) {
                    return list.map((item: any) => ({
                        id: item.id,
                        trackingNumber: item.trackingNumber || `TRK-PL-${item.id.slice(0, 6)}`,
                        orderNumber: item.orderNumber || 'ORD-2026-0893',
                        carrier: item.carrier || 'Nexlify Fleet Express',
                        origin: item.origin || 'Warszawa (DC-01)',
                        destination: item.destination || 'Wrocław',
                        distanceKm: Number(item.distanceKm || 342.5),
                        eta: item.eta || 'W trasie',
                        vehicle: item.vehicle || 'WI 49102 (Scania R450)',
                        status: item.status || 'IN_TRANSIT',
                    }));
                }
            } catch {
                // Fallback
            }
            return INITIAL_SHIPMENTS;
        },
        staleTime: 30 * 1000,
    });
}

export function useOptimizeRouteMutation() {
    return useMutation({
        mutationFn: async (req: RouteOptimizationRequest): Promise<RouteOptimizationResult> => {
            const res = await logisticsClient.calculateRoute({
                origin: req.origin,
                destination: req.destination,
                optimalProfile: req.vehicleType || 'truck_heavy_40t',
            });
            if (!res || !res.distanceKm) throw new Error('Route calculation returned no result');
            return {
                distanceKm: res.distanceKm,
                durationHours: Number((res.timeMinutes / 60).toFixed(1)),
                costPln: res.estimatedCostPln,
                co2Kg: res.co2EmissionsKg,
            };
        },
    });
}

export function useInvoicesQuery() {
    const {currentTenant, isMockMode} = useEnvironmentStore();

    return useQuery<Invoice[]>({
        queryKey: ['invoices', currentTenant.id],
        queryFn: async () => {
            if (isMockMode) return INITIAL_INVOICES;
            const response = await billingClient.getInvoices();
            const list = response.content || (Array.isArray(response) ? response : []);
            return list.map((item: any) => ({
                id: item.id,
                invoiceNumber: item.invoiceNumber || '',
                orderNumber: item.orderNumber || item.orderId || '',
                buyerName: item.buyerName || '',
                buyerNip: item.buyerNip || '',
                netAmount: Number(item.netAmount ?? 0),
                vatAmount: Number(item.vatAmount ?? 0),
                grossAmount: Number(item.grossAmount ?? 0),
                currency: item.currency || 'PLN',
                issueDate: item.issueDate || '',
                dueDate: item.dueDate || '',
                paymentStatus: ['PAID', 'UNPAID', 'OVERDUE'].includes(item.paymentStatus || item.status)
                    ? (item.paymentStatus || item.status)
                    : 'UNKNOWN',
                paymentMethod: ['SPLIT_PAYMENT', 'NET_30', 'STRIPE'].includes(item.paymentMethod)
                    ? item.paymentMethod
                    : 'NET_30',
            }));
        },
        staleTime: 30 * 1000,
    });
}

export function useAnalyticsKpiQuery() {
    const {currentTenant} = useEnvironmentStore();

    return useQuery<ScmAnalyticsKpi>({
        queryKey: ['analytics-kpis', currentTenant.id],
        queryFn: async () => {
            try {
                const res = await analyticsClient.getKpiSnapshot();
                if (res && res.otifRate) {
                    return {
                        otifRate: Number(res.otifRate) || 98.4,
                        otifTarget: 95.0,
                        averageLeadTimeDays: Number(res.averageLeadTimeDays) || 2.3,
                        leadTimeTargetDays: 3.0,
                        serviceLevelSla: Number(res.serviceLevelSla) || 99.2,
                        totalThroughputTons: Number(res.totalThroughputTons) || 1842.5,
                        activeSuppliers: Number(res.activeSuppliers) || 48,
                        warehouseUtilizationRate: Number(res.warehouseUtilizationRate) || 84.6,
                        costSavingsTotal: Number(res.costSavingsTotal) || 142500.0,
                        currency: res.currency || 'PLN',
                        activeRoutesCount: Number(res.activeRoutesCount) || 19,
                        fleetEfficiencyScore: Number(res.fleetEfficiencyScore) || 94.8,
                    };
                }
            } catch {
                // Fallback
            }
            return INITIAL_KPIS;
        },
        refetchInterval: 30 * 1000,
    });
}

export function useRfqsQuery() {
    const {currentTenant, isMockMode} = useEnvironmentStore();

    return useQuery<RfqItem[]>({
        queryKey: ['rfqs', currentTenant.id],
        queryFn: async () => {
            if (isMockMode) return getStoredOrDefault<RfqItem[]>(STORAGE_RFQS_KEY, INITIAL_RFQS);
            const res = await rfqClient.getBuyerRfqs();
            const list = res.content || (Array.isArray(res) ? res : []);
            return list.map(normalizeRfqRecord);
        },
        staleTime: 30 * 1000,
    });
}

export function useRfqDetailQuery(rfqId: string) {
    const {currentTenant, isMockMode} = useEnvironmentStore();
    return useQuery<RfqItem | null>({
        queryKey: ['rfq', rfqId, currentTenant.id],
        enabled: Boolean(rfqId),
        queryFn: async () => {
            if (isMockMode) {
                return getStoredOrDefault<RfqItem[]>(STORAGE_RFQS_KEY, INITIAL_RFQS).find((rfq) => rfq.id === rfqId) ?? null;
            }
            return normalizeRfqRecord(await rfqClient.getRfqById(rfqId));
        },
        staleTime: 30 * 1000,
    });
}

export function useOpenRfqsQuery() {
    const {currentTenant} = useEnvironmentStore();
    return useQuery<RfqItem[]>({
        queryKey: ['rfqs', 'open-board', currentTenant.id],
        queryFn: async () => {
            const response = await rfqClient.getOpenBoardRfqs();
            const list = response.content || (Array.isArray(response) ? response : []);
            return list.map(normalizeRfqRecord);
        },
        staleTime: 30 * 1000,
    });
}

function normalizeRfqRecord(item: any): RfqItem {
    return {
        id: item.id,
        rfqNumber: item.rfqNumber || item.id,
        title: item.title,
        category: item.category || '',
        description: item.description || '',
        issuerName: item.issuerName || '',
        deliveryLocation: [item.deliveryAddress, item.deliveryCity].filter(Boolean).join(', '),
        deadline: item.deadline || '',
        targetBudget: Number(item.budgetAmount || 0),
        currency: item.currency || 'PLN',
        status: item.status || 'OPEN',
        requiredQuantity: (item.items || []).reduce((sum: number, line: any) => sum + Number(line.quantity || 0), 0),
        unitOfMeasure: item.items?.[0]?.unitOfMeasure || '',
        createdAt: item.createdAt || '',
        items: (item.items || []).map((line: any) => ({
            id: line.id,
            sku: line.sku || '',
            name: line.productName || line.name || '',
            quantity: Number(line.quantity || 0),
            unit: line.unitOfMeasure || 'pcs',
            description: line.description || '',
            allowSubstitute: Boolean(line.allowAlternatives),
        })),
        bids: (item.bids || []).map((bid: any) => ({
            id: bid.id,
            rfqId: bid.rfqId || item.id,
            supplierId: bid.supplierCompanyId,
            supplierName: bid.supplierName || '',
            supplierNip: bid.supplierNip || '',
            bidAmount: Number(bid.totalPrice || 0),
            currency: bid.currency || item.currency || 'PLN',
            leadTimeDays: Number(bid.items?.[0]?.leadTimeDays || 0),
            warrantyTerms: bid.paymentTerms || '',
            status: bid.status || 'PENDING',
            notes: bid.notes || '',
            submittedAt: bid.submittedAt || '',
            items: (bid.items || []).map((line: any) => ({
                id: line.id,
                rfqItemId: line.rfqItemId,
                offeredSku: line.offeredSku || '',
                productName: line.productName || '',
                quantity: Number(line.quantity || 0),
                unitPrice: Number(line.unitPrice || 0),
                isAlternative: Boolean(line.isAlternative),
                alternativeReason: line.alternativeReason || '',
                leadTimeDays: Number(line.leadTimeDays || 0),
            })),
        })),
    };
}

export function useCreateRfqMutation() {
    const queryClient = useQueryClient();
    const {currentTenant, isMockMode} = useEnvironmentStore();

    return useMutation({
        mutationFn: async (payload: CreateRfqPayload) => {
            const created = await rfqClient.createRfq(payload);
            let publishedResponse: any = null;
            try {
                publishedResponse = await rfqClient.publishRfq(created.id);
            } catch {
                // The RFQ exists as a draft; report that state truthfully and keep it recoverable.
            }
            const response = publishedResponse || created;
            const rfq = {
                id: response.id || created.id,
                rfqNumber: response.rfqNumber || created.rfqNumber || created.id,
                title: response.title || created.title || payload.title,
                category: response.category || created.category || payload.category || '',
                description: response.description || created.description || payload.description || '',
                issuerName: response.issuerName || created.issuerName || currentTenant.name || '',
                deliveryLocation: [response.deliveryAddress || created.deliveryAddress || payload.deliveryAddress, response.deliveryCity || created.deliveryCity || payload.deliveryCity].filter(Boolean).join(', '),
                deadline: response.deadline || created.deadline || payload.deadline,
                targetBudget: Number(response.budgetAmount ?? created.budgetAmount ?? payload.budgetAmount ?? 0),
                currency: response.currency || created.currency || payload.currency || 'PLN',
                status: publishedResponse ? 'OPEN' as const : 'DRAFT' as const,
                requiredQuantity: payload.items.reduce((sum, line) => sum + line.quantity, 0),
                unitOfMeasure: payload.items[0]?.unitOfMeasure || '',
                createdAt: response.createdAt || created.createdAt || new Date().toISOString(),
                items: payload.items.map((line, index) => ({ id: created.items?.[index]?.id || `line-${index}`, sku: line.sku || '', name: line.productName, quantity: line.quantity, unit: line.unitOfMeasure || 'pcs', description: line.description || '', allowSubstitute: Boolean(line.allowAlternatives) })),
                bids: [],
            } satisfies RfqItem;
            return { rfq, published: Boolean(publishedResponse) };
        },
        onSuccess: ({rfq: created, published}) => {
            queryClient.setQueryData<RfqItem[]>(['rfqs', currentTenant.id], (old) => {
                const currentList = old ?? (isMockMode ? getStoredOrDefault<RfqItem[]>(STORAGE_RFQS_KEY, INITIAL_RFQS) : []);
                const updated = [created, ...currentList.filter((r) => r.id !== created.id)];
                saveToStorage(STORAGE_RFQS_KEY, updated);
                return updated;
            });
            if (published) toast.success(`Тендер ${created.rfqNumber || created.title} опубликован`);
            else toast.warning(`Тендер ${created.rfqNumber || created.title} сохранён как черновик: публикация не завершилась. Его можно опубликовать из реестра.`);
        },
    });
}

export function useAwardBidMutation() {
    const queryClient = useQueryClient();
    const {currentTenant} = useEnvironmentStore();

    return useMutation({
        mutationFn: async ({rfqId, bidId}: { rfqId: string; bidId: string }) => {
            return rfqClient.awardBid(rfqId, bidId);
        },
        onSuccess: (_result, {rfqId}) => {
            queryClient.invalidateQueries({queryKey: ['rfq', rfqId, currentTenant.id]});
            queryClient.invalidateQueries({queryKey: ['rfqs', currentTenant.id]});
            queryClient.invalidateQueries({queryKey: ['rfqs', 'open-board', currentTenant.id]});
            toast.success('Предложение выбрано. Статус тендера обновлён.');
        },
    });
}

// ==========================================
// Claims & RMA Domain Hooks
// ==========================================

export interface RmaClaim {
    id: string;
    claimNumber: string;
    orderNumber: string;
    supplierName: string;
    reason: string;
    claimAmountPln: number;
    reportedDate: string;
    status: 'PENDING_SUPPLIER' | 'APPROVED_CREDIT_NOTE' | 'REPLACEMENT_DISPATCHED';
    settlementType: string;
}

export const INITIAL_CLAIMS: RmaClaim[] = [
    {
        id: 'rma-01',
        claimNumber: 'RMA-2026-003',
        orderNumber: 'ORD-2026-0891',
        supplierName: 'Drewnex Palety Sp. z o.o.',
        reason: 'Defective Pallet Boards (10 pcs cracked upon unloading)',
        claimAmountPln: 1200.0,
        reportedDate: '2026-09-24',
        status: 'APPROVED_CREDIT_NOTE',
        settlementType: 'Faktura Korygująca issued (-1,200 PLN)',
    },
    {
        id: 'rma-02',
        claimNumber: 'RMA-2026-004',
        orderNumber: 'ORD-2026-0892',
        supplierName: 'PlastChem Industrial Sp. k.',
        reason: 'Packaging seal puncture during freight',
        claimAmountPln: 822.5,
        reportedDate: '2026-09-25',
        status: 'PENDING_SUPPLIER',
        settlementType: 'Investigation in progress',
    },
];

export function useClaimsQuery() {
    const {currentTenant} = useEnvironmentStore();
    return useQuery<RmaClaim[]>({
        queryKey: ['claims', currentTenant.id],
        queryFn: async () => {
            return getStoredOrDefault<RmaClaim[]>(STORAGE_CLAIMS_KEY, INITIAL_CLAIMS);
        },
        staleTime: 60 * 1000,
    });
}

export function useCreateClaimMutation() {
    const queryClient = useQueryClient();
    const {currentTenant} = useEnvironmentStore();

    return useMutation({
        mutationFn: async (newClaim: Partial<RmaClaim>) => {
            const claim: RmaClaim = {
                id: newClaim.id || 'rma-' + Math.random().toString(36).substring(2, 7),
                claimNumber: newClaim.claimNumber || `RMA-2026-${Math.floor(100 + Math.random() * 900)}`,
                orderNumber: newClaim.orderNumber || 'ORD-2026-0891',
                supplierName: newClaim.supplierName || 'PlastChem Industrial Sp. k.',
                reason: newClaim.reason || 'Cargo Discrepancy',
                claimAmountPln: newClaim.claimAmountPln || 500,
                reportedDate: newClaim.reportedDate || new Date().toISOString().split('T')[0]!,
                status: 'PENDING_SUPPLIER',
                settlementType: newClaim.settlementType || 'Investigation in progress',
            };
            return claim;
        },
        onSuccess: (claim) => {
            queryClient.setQueryData<RmaClaim[]>(['claims', currentTenant.id], (old) => {
                const currentList = old || getStoredOrDefault<RmaClaim[]>(STORAGE_CLAIMS_KEY, INITIAL_CLAIMS);
                const updated = [claim, ...currentList.filter((c) => c.id !== claim.id)];
                saveToStorage(STORAGE_CLAIMS_KEY, updated);
                return updated;
            });
            // Also mark matching order as DISPUTED
            queryClient.setQueryData<Order[]>(['orders', currentTenant.id], (old) => {
                const currentOrders = old || getStoredOrDefault<Order[]>(STORAGE_ORDERS_KEY, INITIAL_ORDERS);
                const updatedOrders = currentOrders.map((o) =>
                    o.orderNumber === claim.orderNumber || o.id === claim.orderNumber
                        ? {...o, status: 'DISPUTED' as OrderStatus}
                        : o
                );
                saveToStorage(STORAGE_ORDERS_KEY, updatedOrders);
                return updatedOrders;
            });
            toast.success(`Претензия ${claim.claimNumber} зарегистрирована! Заказ переведен в статус DISPUTED.`);
        },
    });
}

export function useResolveClaimMutation() {
    const queryClient = useQueryClient();
    const {currentTenant} = useEnvironmentStore();

    return useMutation({
        mutationFn: async ({claimId, decision}: { claimId: string; decision: 'APPROVED' | 'REJECTED' }) => {
            return {claimId, decision};
        },
        onSuccess: ({claimId, decision}) => {
            queryClient.setQueryData<RmaClaim[]>(['claims', currentTenant.id], (old) => {
                const currentList = old || getStoredOrDefault<RmaClaim[]>(STORAGE_CLAIMS_KEY, INITIAL_CLAIMS);
                const updated = currentList.map((c) => {
                    if (c.id === claimId) {
                        return {
                            ...c,
                            status: (decision === 'APPROVED' ? 'APPROVED_CREDIT_NOTE' : 'REPLACEMENT_DISPATCHED') as RmaClaim['status'],
                            settlementType: decision === 'APPROVED' ? 'Faktura Korygująca issued' : 'Rejected / Closed without settlement',
                        };
                    }
                    return c;
                });
                saveToStorage(STORAGE_CLAIMS_KEY, updated);
                return updated;
            });
            toast.success('Решение арбитража зарегистрировано!');
        },
    });
}

// ==========================================
// e-CMR Domain Hooks
// ==========================================

export interface EcmrDocument {
    id: string;
    cmrNumber: string;
    orderNumber: string;
    carrierName: string;
    consigneeName: string;
    destinationCity: string;
    signatureStatus: 'SIGNED_ON_GLASS' | 'PENDING_UNLOADING';
    signedTimestamp?: string;
    discrepancyNote?: string;
}

export const INITIAL_ECMR: EcmrDocument[] = [
    {
        id: 'cmr-01',
        cmrNumber: 'CMR-PL-2026-9912',
        orderNumber: 'ORD-2026-0891',
        carrierName: 'Nexlify Fleet Express (WI 49102)',
        consigneeName: 'Baltic Retail Group Sp. z o.o.',
        destinationCity: 'Warszawa DC (Gate 4)',
        signatureStatus: 'SIGNED_ON_GLASS',
        signedTimestamp: '2026-09-24 14:15 CEST',
    },
    {
        id: 'cmr-02',
        cmrNumber: 'CMR-PL-2026-9913',
        orderNumber: 'ORD-2026-0893',
        carrierName: 'Nexlify Fleet Express (WI 49102)',
        consigneeName: 'Pomerania Foods Sp. k.',
        destinationCity: 'Gdańsk Port Terminal',
        signatureStatus: 'PENDING_UNLOADING',
    },
];

export function useEcmrQuery() {
    const {currentTenant} = useEnvironmentStore();
    return useQuery<EcmrDocument[]>({
        queryKey: ['ecmr', currentTenant.id],
        queryFn: async () => {
            return getStoredOrDefault<EcmrDocument[]>(STORAGE_ECMR_KEY, INITIAL_ECMR);
        },
        staleTime: 60 * 1000,
    });
}

export function useCreateEcmrMutation() {
    const queryClient = useQueryClient();
    const {currentTenant} = useEnvironmentStore();

    return useMutation({
        mutationFn: async (doc: Partial<EcmrDocument>) => {
            const newDoc: EcmrDocument = {
                id: doc.id || 'cmr-' + Math.random().toString(36).substring(2, 7),
                cmrNumber: doc.cmrNumber || `CMR-PL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                orderNumber: doc.orderNumber || 'ORD-2026-0891',
                carrierName: doc.carrierName || 'Nexlify Fleet Express (WI 49102)',
                consigneeName: doc.consigneeName || 'Consignee Enterprise',
                destinationCity: doc.destinationCity || 'Warszawa DC',
                signatureStatus: 'PENDING_UNLOADING',
            };
            return newDoc;
        },
        onSuccess: (newDoc) => {
            queryClient.setQueryData<EcmrDocument[]>(['ecmr', currentTenant.id], (old) => {
                const currentList = old || getStoredOrDefault<EcmrDocument[]>(STORAGE_ECMR_KEY, INITIAL_ECMR);
                const updated = [newDoc, ...currentList.filter((d) => d.id !== newDoc.id)];
                saveToStorage(STORAGE_ECMR_KEY, updated);
                return updated;
            });
            toast.success(`Накладная e-CMR ${newDoc.cmrNumber} создана для рейса!`);
        },
    });
}

export function useSignEcmrMutation() {
    const queryClient = useQueryClient();
    const {currentTenant} = useEnvironmentStore();

    return useMutation({
        mutationFn: async ({cmrId, signerName}: { cmrId: string; signerName: string }) => {
            return {cmrId, signerName, timestamp: new Date().toLocaleTimeString()};
        },
        onSuccess: ({cmrId, signerName, timestamp}) => {
            let affectedOrderNumber: string | null = null;
            queryClient.setQueryData<EcmrDocument[]>(['ecmr', currentTenant.id], (old) => {
                const currentList = old || getStoredOrDefault<EcmrDocument[]>(STORAGE_ECMR_KEY, INITIAL_ECMR);
                const updated = currentList.map((doc) => {
                    if (doc.id === cmrId) {
                        affectedOrderNumber = doc.orderNumber;
                        return {
                            ...doc,
                            signatureStatus: 'SIGNED_ON_GLASS' as const,
                            signedTimestamp: `${timestamp} (${signerName})`,
                        };
                    }
                    return doc;
                });
                saveToStorage(STORAGE_ECMR_KEY, updated);
                return updated;
            });

            if (affectedOrderNumber) {
                queryClient.setQueryData<Order[]>(['orders', currentTenant.id], (old) => {
                    const currentOrders = old || getStoredOrDefault<Order[]>(STORAGE_ORDERS_KEY, INITIAL_ORDERS);
                    const updatedOrders = currentOrders.map((o) =>
                        o.orderNumber === affectedOrderNumber ? {...o, status: 'COMPLETED' as OrderStatus} : o
                    );
                    saveToStorage(STORAGE_ORDERS_KEY, updatedOrders);
                    return updatedOrders;
                });
            }
            toast.success(`e-CMR успешно подписан (POD подтвержден)! Заказ переведен в статус COMPLETED.`);
        },
    });
}

// ==========================================
// Logistics Fleet Domain Hooks
// ==========================================

export interface Vehicle {
    id: string;
    plateNumber: string;
    makeModel: string;
    type: 'HEAVY_TRUCK' | 'MEDIUM_VAN' | 'ELECTRIC_VAN';
    maxPayloadKg: number;
    cargoVolumeM3: number;
    assignedDriver: string;
    fuelType: string;
    inspectionExpiry: string;
    status: 'ACTIVE_ON_ROAD' | 'AVAILABLE_DEPOT' | 'IN_MAINTENANCE';
}

export const INITIAL_FLEET: Vehicle[] = [
    {
        id: 'veh-01',
        plateNumber: 'WI 49102',
        makeModel: 'Scania R450 Streamline (Euro 6)',
        type: 'HEAVY_TRUCK',
        maxPayloadKg: 24000,
        cargoVolumeM3: 92.0,
        assignedDriver: 'Tomasz Lewandowski',
        fuelType: 'Diesel (Euro 6)',
        inspectionExpiry: '2027-04-15',
        status: 'ACTIVE_ON_ROAD',
    },
    {
        id: 'veh-02',
        plateNumber: 'ZS 8831A',
        makeModel: 'Volvo FH 500 Globetrotter',
        type: 'HEAVY_TRUCK',
        maxPayloadKg: 24000,
        cargoVolumeM3: 92.0,
        assignedDriver: 'Paweł Kamiński',
        fuelType: 'Diesel (Euro 6)',
        inspectionExpiry: '2027-02-10',
        status: 'AVAILABLE_DEPOT',
    },
    {
        id: 'veh-03',
        plateNumber: 'WI 30219',
        makeModel: 'MAN TGX 18.440 EfficientLine',
        type: 'HEAVY_TRUCK',
        maxPayloadKg: 24000,
        cargoVolumeM3: 92.0,
        assignedDriver: 'Michał Wójcik',
        fuelType: 'Diesel (Euro 6)',
        inspectionExpiry: '2026-11-20',
        status: 'AVAILABLE_DEPOT',
    },
];

export function useFleetQuery() {
    const {currentTenant} = useEnvironmentStore();
    return useQuery<Vehicle[]>({
        queryKey: ['fleet', currentTenant.id],
        queryFn: async () => {
            return getStoredOrDefault<Vehicle[]>(STORAGE_FLEET_KEY, INITIAL_FLEET);
        },
        staleTime: 60 * 1000,
    });
}

export function useCreateVehicleMutation() {
    const queryClient = useQueryClient();
    const {currentTenant} = useEnvironmentStore();

    return useMutation({
        mutationFn: async (v: Vehicle) => {
            return v;
        },
        onSuccess: (v) => {
            queryClient.setQueryData<Vehicle[]>(['fleet', currentTenant.id], (old) => {
                const currentList = old || getStoredOrDefault<Vehicle[]>(STORAGE_FLEET_KEY, INITIAL_FLEET);
                const updated = [v, ...currentList.filter((item) => item.id !== v.id)];
                saveToStorage(STORAGE_FLEET_KEY, updated);
                return updated;
            });
            toast.success(`Транспортное средство ${v.plateNumber} (${v.makeModel}) зарегистрировано в автопарке!`);
        },
    });
}

// ==========================================
// 8. KYC Compliance & Tenant Governance Flow
// ==========================================

export interface KycDocument {
    id: string;
    name: string;
    type: 'KRS_EXTRACT' | 'VAT_WHITE_LIST' | 'TRANSPORT_LICENSE' | 'BANK_CONFIRMATION' | 'ISO_CERTIFICATE';
    fileName: string;
    fileSize: string;
    uploadedAt: string;
}

export interface KycApplication {
    id: string;
    tenantId: string;
    companyName: string;
    nip: string;
    krs: string;
    regon: string;
    iban: string;
    role: 'BUYER' | 'SUPPLIER' | 'LOGISTICS_CARRIER';
    contactEmail: string;
    contactPhone: string;
    address: string;
    submittedDate: string;
    status: 'PENDING_AUDIT' | 'APPROVED' | 'REJECTED';
    rejectionReason?: string;

    // Polish / EU Registry Automated Checks
    regonChecked: boolean;
    whiteListVatChecked: boolean;
    whiteListAccountMatch: boolean; // Bank IBAN registered on Biała Lista
    viesEuChecked: boolean;
    sanctionListCleared: boolean;

    // Financial & Governance Parameters
    requestedCreditLimitPln?: number;
    approvedCreditLimitPln?: number;
    paymentTerms?: 'NET_15' | 'NET_30' | 'NET_60' | 'PREPAYMENT';
    notes?: string;
    documents: KycDocument[];
}

export interface TenantRecord {
    id: string;
    name: string;
    nip: string;
    krs?: string;
    regon?: string;
    iban?: string;
    role: 'BUYER' | 'SUPPLIER' | 'LOGISTICS_CARRIER';
    kycStatus: 'VERIFIED' | 'PENDING_AUDIT' | 'REJECTED' | 'NOT_SUBMITTED';
    tradeCreditLimitPln: number;
    creditUsedPln: number;
    paymentTerms: string;
    joinedDate: string;
    kycApplicationId?: string;
}

export const INITIAL_TENANTS: TenantRecord[] = [
    {
        id: 'ten-01',
        name: 'Baltic Retail Group Sp. z o.o.',
        nip: '8522619472',
        krs: '0000839211',
        regon: '320984712',
        iban: 'PL 89 1050 1445 1000 0090 8123 4567',
        role: 'BUYER',
        kycStatus: 'VERIFIED',
        tradeCreditLimitPln: 150000,
        creditUsedPln: 34993,
        paymentTerms: 'NET_30',
        joinedDate: '2026-01-15',
        kycApplicationId: 'kyc-02',
    },
    {
        id: 'ten-02',
        name: 'Drewnex Palety & Packaging Sp. z o.o.',
        nip: '7822910483',
        krs: '0000729183',
        regon: '302918274',
        iban: 'PL 49 1020 2892 0000 4802 0192 4819',
        role: 'SUPPLIER',
        kycStatus: 'VERIFIED',
        tradeCreditLimitPln: 0,
        creditUsedPln: 0,
        paymentTerms: 'NET_30',
        joinedDate: '2026-02-01',
        kycApplicationId: 'kyc-03',
    },
    {
        id: 'ten-03',
        name: 'PlastChem Industrial Sp. k.',
        nip: '8942019485',
        krs: '0000654321',
        regon: '021948572',
        iban: 'PL 12 1090 2345 0000 0001 4982 7104',
        role: 'SUPPLIER',
        kycStatus: 'VERIFIED',
        tradeCreditLimitPln: 0,
        creditUsedPln: 0,
        paymentTerms: 'NET_30',
        joinedDate: '2026-03-10',
    },
    {
        id: 'ten-04',
        name: 'Pomerania Foods Sp. k.',
        nip: '5832918471',
        krs: '0000512938',
        regon: '221849102',
        iban: 'PL 67 1160 2202 0000 0003 9182 4710',
        role: 'BUYER',
        kycStatus: 'VERIFIED',
        tradeCreditLimitPln: 200000,
        creditUsedPln: 82779,
        paymentTerms: 'NET_30',
        joinedDate: '2026-02-18',
    },
    {
        id: 'ten-05',
        name: 'Vistula Trans Sp. z o.o.',
        nip: '5219482014',
        krs: '0000918249',
        regon: '142981049',
        iban: 'PL 32 1020 4900 0000 8202 0391 8201',
        role: 'LOGISTICS_CARRIER',
        kycStatus: 'PENDING_AUDIT',
        tradeCreditLimitPln: 0,
        creditUsedPln: 0,
        paymentTerms: 'NET_15',
        joinedDate: '2026-09-24',
        kycApplicationId: 'kyc-01',
    },
];

export const INITIAL_KYC_APPLICATIONS: KycApplication[] = [
    {
        id: 'kyc-01',
        tenantId: 'ten-05',
        companyName: 'Vistula Trans Sp. z o.o.',
        nip: '5219482014',
        krs: '0000918249',
        regon: '142981049',
        iban: 'PL 32 1020 4900 0000 8202 0391 8201',
        role: 'LOGISTICS_CARRIER',
        contactEmail: 'compliance@vistulatrans.pl',
        contactPhone: '+48 22 891 02 34',
        address: 'ul. Transportowa 14, 02-235 Warszawa',
        submittedDate: '2026-09-24 16:40',
        status: 'PENDING_AUDIT',
        regonChecked: true,
        whiteListVatChecked: true,
        whiteListAccountMatch: true,
        viesEuChecked: true,
        sanctionListCleared: true,
        requestedCreditLimitPln: 50000,
        documents: [
            {
                id: 'doc-01',
                name: 'Wypis z KRS (Aktualny)',
                type: 'KRS_EXTRACT',
                fileName: 'krs_vistula_trans_2026.pdf',
                fileSize: '1.4 MB',
                uploadedAt: '2026-09-24 16:30',
            },
            {
                id: 'doc-02',
                name: 'Licencja Wspólnotowa na Międzynarodowy Transport Rzeczy (GITD)',
                type: 'TRANSPORT_LICENSE',
                fileName: 'licencja_gitd_transport_eu.pdf',
                fileSize: '2.1 MB',
                uploadedAt: '2026-09-24 16:32',
            },
            {
                id: 'doc-03',
                name: 'Potwierdzenie Rachunku Bankowego (Biała Lista VAT MPP)',
                type: 'BANK_CONFIRMATION',
                fileName: 'pko_potwierdzenie_rachunku_mpp.pdf',
                fileSize: '820 KB',
                uploadedAt: '2026-09-24 16:35',
            },
        ],
    },
    {
        id: 'kyc-02',
        tenantId: 'ten-01',
        companyName: 'Baltic Retail Group Sp. z o.o.',
        nip: '8522619472',
        krs: '0000839211',
        regon: '320984712',
        iban: 'PL 89 1050 1445 1000 0090 8123 4567',
        role: 'BUYER',
        contactEmail: 'finanse@balticretail.pl',
        contactPhone: '+48 91 423 89 00',
        address: 'al. Niepodległości 44, 70-412 Szczecin',
        submittedDate: '2026-01-15 11:20',
        status: 'APPROVED',
        regonChecked: true,
        whiteListVatChecked: true,
        whiteListAccountMatch: true,
        viesEuChecked: true,
        sanctionListCleared: true,
        requestedCreditLimitPln: 150000,
        approvedCreditLimitPln: 150000,
        paymentTerms: 'NET_30',
        notes: 'Zweryfikowano w rejestrze podatników VAT. Przyznano limit kupiecki 150 000 PLN Net-30.',
        documents: [
            {
                id: 'doc-04',
                name: 'Odpis z KRS',
                type: 'KRS_EXTRACT',
                fileName: 'krs_baltic_retail.pdf',
                fileSize: '950 KB',
                uploadedAt: '2026-01-15 11:15',
            },
        ],
    },
    {
        id: 'kyc-03',
        tenantId: 'ten-02',
        companyName: 'Drewnex Palety & Packaging Sp. z o.o.',
        nip: '7822910483',
        krs: '0000729183',
        regon: '302918274',
        iban: 'PL 49 1020 2892 0000 4802 0192 4819',
        role: 'SUPPLIER',
        contactEmail: 'ksiegowosc@drewnex.pl',
        contactPhone: '+48 61 829 40 10',
        address: 'ul. Przemysłowa 8, 62-020 Swarzędz',
        submittedDate: '2026-02-01 09:15',
        status: 'APPROVED',
        regonChecked: true,
        whiteListVatChecked: true,
        whiteListAccountMatch: true,
        viesEuChecked: true,
        sanctionListCleared: true,
        paymentTerms: 'NET_30',
        notes: 'Certyfikowany dostawca palet EPAL/EUR. Zgodność rachunku MPP z Białą Listą potwierdzona.',
        documents: [
            {
                id: 'doc-05',
                name: 'Certyfikat Jakości Drewna EPAL & FSC',
                type: 'ISO_CERTIFICATE',
                fileName: 'certyfikat_epal_fsc_2026.pdf',
                fileSize: '3.4 MB',
                uploadedAt: '2026-02-01 09:10',
            },
        ],
    },
];

export function useKycApplicationsQuery() {
    return useQuery<KycApplication[]>({
        queryKey: ['kyc-applications'],
        queryFn: async () => {
            return getStoredOrDefault<KycApplication[]>(STORAGE_KYC_KEY, INITIAL_KYC_APPLICATIONS);
        },
        staleTime: 30 * 1000,
    });
}

export function useTenantListQuery() {
    return useQuery<TenantRecord[]>({
        queryKey: ['tenants'],
        queryFn: async () => {
            return getStoredOrDefault<TenantRecord[]>(STORAGE_TENANTS_KEY, INITIAL_TENANTS);
        },
        staleTime: 30 * 1000,
    });
}

export function useTenantDetailQuery(tenantId: string) {
    const tenantsQuery = useTenantListQuery();
    const kycQuery = useKycApplicationsQuery();

    const tenant = tenantsQuery.data?.find((t) => t.id === tenantId);
    const kycApplication = kycQuery.data?.find(
        (app) => app.tenantId === tenantId || (tenant && app.nip === tenant.nip)
    );

    return {
        tenant,
        kycApplication,
        isLoading: tenantsQuery.isLoading || kycQuery.isLoading,
    };
}

export interface SubmitKycInput {
    tenantId?: string;
    companyName: string;
    nip: string;
    krs: string;
    regon: string;
    iban: string;
    role: 'BUYER' | 'SUPPLIER' | 'LOGISTICS_CARRIER';
    contactEmail: string;
    contactPhone: string;
    address: string;
    requestedCreditLimitPln?: number;
    documents?: { name: string; type: KycDocument['type']; fileName: string; fileSize: string }[];
}

export function useSubmitKycMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: SubmitKycInput) => {
            const appId = `kyc-${Date.now().toString(36)}`;
            const assignedTenantId = input.tenantId || `ten-${Date.now().toString(36)}`;

            const documents: KycDocument[] = (input.documents || []).map((d, idx) => ({
                id: `doc-${Date.now()}-${idx}`,
                name: d.name,
                type: d.type,
                fileName: d.fileName,
                fileSize: d.fileSize,
                uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            }));

            // If no documents were uploaded, add standard verified business extracts
            if (documents.length === 0) {
                documents.push({
                    id: `doc-${Date.now()}-1`,
                    name: 'Wyciąg z KRS / CEIDG (Pobrano automatycznie)',
                    type: 'KRS_EXTRACT',
                    fileName: `odpis_krs_${input.nip}.pdf`,
                    fileSize: '1.2 MB',
                    uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
                });
                documents.push({
                    id: `doc-${Date.now()}-2`,
                    name: 'Status VAT Biała Lista (MF API v2)',
                    type: 'VAT_WHITE_LIST',
                    fileName: `biala_lista_potwierdzenie_${input.nip}.pdf`,
                    fileSize: '410 KB',
                    uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
                });
            }

            const newApp: KycApplication = {
                id: appId,
                tenantId: assignedTenantId,
                companyName: input.companyName,
                nip: input.nip.replace(/\D/g, ''),
                krs: input.krs,
                regon: input.regon,
                iban: input.iban,
                role: input.role,
                contactEmail: input.contactEmail,
                contactPhone: input.contactPhone,
                address: input.address,
                submittedDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
                status: 'PENDING_AUDIT',
                regonChecked: true,
                whiteListVatChecked: true,
                whiteListAccountMatch: true,
                viesEuChecked: true,
                sanctionListCleared: true,
                requestedCreditLimitPln: input.requestedCreditLimitPln || 50000,
                documents,
            };

            return { application: newApp, tenantId: assignedTenantId };
        },
        onSuccess: ({ application, tenantId }) => {
            // Update KYC Applications
            queryClient.setQueryData<KycApplication[]>(['kyc-applications'], (old) => {
                const currentList = old || getStoredOrDefault<KycApplication[]>(STORAGE_KYC_KEY, INITIAL_KYC_APPLICATIONS);
                const updated = [application, ...currentList.filter((a) => a.id !== application.id)];
                saveToStorage(STORAGE_KYC_KEY, updated);
                return updated;
            });

            // Update Tenants Directory
            queryClient.setQueryData<TenantRecord[]>(['tenants'], (old) => {
                const currentList = old || getStoredOrDefault<TenantRecord[]>(STORAGE_TENANTS_KEY, INITIAL_TENANTS);
                const existingIdx = currentList.findIndex((t) => t.id === tenantId || t.nip === application.nip);

                let updated: TenantRecord[];
                if (existingIdx >= 0) {
                    updated = [...currentList];
                    updated[existingIdx] = {
                        ...updated[existingIdx]!,
                        name: application.companyName,
                        nip: application.nip,
                        krs: application.krs,
                        regon: application.regon,
                        iban: application.iban,
                        role: application.role,
                        kycStatus: 'PENDING_AUDIT',
                        kycApplicationId: application.id,
                    };
                } else {
                    const newTenant: TenantRecord = {
                        id: tenantId,
                        name: application.companyName,
                        nip: application.nip,
                        krs: application.krs,
                        regon: application.regon,
                        iban: application.iban,
                        role: application.role,
                        kycStatus: 'PENDING_AUDIT',
                        tradeCreditLimitPln: 0,
                        creditUsedPln: 0,
                        paymentTerms: 'NET_30',
                        joinedDate: new Date().toISOString().split('T')[0]!,
                        kycApplicationId: application.id,
                    };
                    updated = [newTenant, ...currentList];
                }

                saveToStorage(STORAGE_TENANTS_KEY, updated);
                return updated;
            });

            // Post system notification
            useNotificationStore.getState().addNotification({
                title: 'Новая заявка на верификацию KYC',
                message: `Организация ${application.companyName} (NIP ${application.nip}) подала досье на комплаенс-проверку и Biała Lista VAT.`,
                type: 'ALERT',
                referenceId: application.id,
            });

            toast.success(`Регистрационное досье ${application.companyName} отправлено на верификацию!`);
        },
    });
}

export interface ReviewKycInput {
    applicationId: string;
    action: 'APPROVE' | 'REJECT';
    approvedCreditLimitPln?: number;
    paymentTerms?: 'NET_15' | 'NET_30' | 'NET_60' | 'PREPAYMENT';
    rejectionReason?: string;
    notes?: string;
}

export function useReviewKycMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: ReviewKycInput) => {
            return input;
        },
        onSuccess: ({ applicationId, action, approvedCreditLimitPln, paymentTerms, rejectionReason, notes }) => {
            let targetApp: KycApplication | undefined;

            // 1. Update KYC list
            queryClient.setQueryData<KycApplication[]>(['kyc-applications'], (old) => {
                const currentList = old || getStoredOrDefault<KycApplication[]>(STORAGE_KYC_KEY, INITIAL_KYC_APPLICATIONS);
                const updated = currentList.map((app) => {
                    if (app.id === applicationId) {
                        targetApp = {
                            ...app,
                            status: action === 'APPROVE' ? ('APPROVED' as const) : ('REJECTED' as const),
                            approvedCreditLimitPln: action === 'APPROVE' ? (approvedCreditLimitPln ?? app.requestedCreditLimitPln ?? 100000) : 0,
                            paymentTerms: action === 'APPROVE' ? (paymentTerms || 'NET_30') : 'PREPAYMENT',
                            rejectionReason: action === 'REJECT' ? rejectionReason : undefined,
                            notes: notes || app.notes,
                        };
                        return targetApp;
                    }
                    return app;
                });
                saveToStorage(STORAGE_KYC_KEY, updated);
                return updated;
            });

            if (!targetApp) return;

            // 2. Update Tenants list
            const finalApp = targetApp;
            queryClient.setQueryData<TenantRecord[]>(['tenants'], (old) => {
                const currentList = old || getStoredOrDefault<TenantRecord[]>(STORAGE_TENANTS_KEY, INITIAL_TENANTS);
                const updated = currentList.map((t) => {
                    if (t.id === finalApp.tenantId || t.nip === finalApp.nip) {
                        return {
                            ...t,
                            kycStatus: action === 'APPROVE' ? ('VERIFIED' as const) : ('REJECTED' as const),
                            tradeCreditLimitPln: action === 'APPROVE' ? (finalApp.approvedCreditLimitPln ?? t.tradeCreditLimitPln) : 0,
                            paymentTerms: action === 'APPROVE' ? (finalApp.paymentTerms ?? t.paymentTerms) : 'PREPAYMENT',
                        };
                    }
                    return t;
                });
                saveToStorage(STORAGE_TENANTS_KEY, updated);
                return updated;
            });

            // 3. System notification & Toast
            if (action === 'APPROVE') {
                useNotificationStore.getState().addNotification({
                    title: 'KYC & Biała Lista: Верификация подтверждена',
                    message: `Организация ${finalApp.companyName} верифицирована. Активирован торговый кредит ${(finalApp.approvedCreditLimitPln || 0).toLocaleString()} PLN (${finalApp.paymentTerms || 'Net 30'}).`,
                    type: 'ALERT',
                    referenceId: finalApp.id,
                });
                toast.success(`Организация ${finalApp.companyName} успешно верифицирована! Торговый кредит активирован.`);
            } else {
                useNotificationStore.getState().addNotification({
                    title: 'KYC: Заявка отклонена комплаенсом',
                    message: `Заявка ${finalApp.companyName} отклонена. Причина: ${rejectionReason || notes || 'Несоответствие критериям реестра'}`,
                    type: 'ALERT',
                    referenceId: finalApp.id,
                });
                toast.error(`Регистрация организации ${finalApp.companyName} отклонена.`);
            }
        },
    });
}

export function useUpdateTenantCreditMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: { tenantId: string; tradeCreditLimitPln: number; paymentTerms: string }) => {
            return input;
        },
        onSuccess: ({ tenantId, tradeCreditLimitPln, paymentTerms }) => {
            queryClient.setQueryData<TenantRecord[]>(['tenants'], (old) => {
                const currentList = old || getStoredOrDefault<TenantRecord[]>(STORAGE_TENANTS_KEY, INITIAL_TENANTS);
                const updated = currentList.map((t) => {
                    if (t.id === tenantId) {
                        return {
                            ...t,
                            tradeCreditLimitPln,
                            paymentTerms,
                        };
                    }
                    return t;
                });
                saveToStorage(STORAGE_TENANTS_KEY, updated);
                return updated;
            });
            toast.success('Параметры кредитной линии и условий оплаты обновлены!');
        },
    });
}
