import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Truck,
    Users,
    Settings,
    BarChart3,
    FileText,
    MapPin,
    Target,
    Receipt,
    ListChecks,
    FileQuestion,
    ShieldAlert,
    ArrowLeftRight,
    Grid,
    Boxes,
    Award,
    FileSpreadsheet,
    Route as RouteIcon,
    Sparkles,
    UserCheck,
    FileCheck,
    Activity,
    AlertTriangle,
} from 'lucide-react';
import React from 'react';

import {MenuItemType, type Item} from './types';

// ==========================================
// 1. BUYER WORKSPACE (P03 - P08, P20 + Enterprise 2.0)
// ==========================================
export const buyerMenu: Item[] = [
    {
        title: 'B2B Catalog',
        url: '/buyer/catalog',
        type: MenuItemType.ITEM,
        icon: React.createElement(Package, {size: 16}),
    },
    {
        title: 'Shopping Cart',
        url: '/buyer/cart',
        type: MenuItemType.ITEM,
        icon: React.createElement(ShoppingCart, {size: 16}),
    },
    {
        title: 'My Orders',
        url: '/buyer/orders',
        type: MenuItemType.ITEM,
        icon: React.createElement(ListChecks, {size: 16}),
    },
    {
        title: 'Invoices (VAT)',
        url: '/buyer/invoices',
        type: MenuItemType.ITEM,
        icon: React.createElement(Receipt, {size: 16}),
    },
    {
        title: 'Procurement RFQs',
        url: '/buyer/requests',
        type: MenuItemType.ITEM,
        icon: React.createElement(FileQuestion, {size: 16}),
    },
    {
        title: 'SLA Contracts',
        url: '/buyer/contracts',
        type: MenuItemType.ITEM,
        icon: React.createElement(FileText, {size: 16}),
    },
    {
        title: 'RMA Claims',
        url: '/buyer/claims',
        type: MenuItemType.ITEM,
        icon: React.createElement(ShieldAlert, {size: 16}),
    },
    {
        title: 'Buyer Settings',
        url: '/buyer/settings',
        type: MenuItemType.ITEM,
        icon: React.createElement(Settings, {size: 16}),
    },
];

// ==========================================
// 2. SUPPLIER WORKSPACE (P09 - P12, P19 + Enterprise 2.0)
// ==========================================
export const supplierMenu: Item[] = [
    {
        title: 'Supplier Dashboard',
        url: '/supplier/dashboard',
        type: MenuItemType.ITEM,
        icon: React.createElement(LayoutDashboard, {size: 16}),
    },
    {
        title: 'SKU & Inventory',
        url: '/supplier/products',
        type: MenuItemType.ITEM,
        icon: React.createElement(Package, {size: 16}),
    },
    {
        title: 'Stock Transfers',
        url: '/supplier/inventory/transfers',
        type: MenuItemType.ITEM,
        icon: React.createElement(ArrowLeftRight, {size: 16}),
    },
    {
        title: 'ABC/XYZ Matrix',
        url: '/supplier/inventory/abc-xyz',
        type: MenuItemType.ITEM,
        icon: React.createElement(Grid, {size: 16}),
    },
    {
        title: 'Fulfillment Queue',
        url: '/supplier/orders',
        type: MenuItemType.ITEM,
        icon: React.createElement(Boxes, {size: 16}),
    },
    {
        title: 'Pricing Contracts',
        url: '/supplier/pricing',
        type: MenuItemType.ITEM,
        icon: React.createElement(Target, {size: 16}),
    },
    {
        title: 'Open RFQ Board',
        url: '/supplier/bids/board',
        type: MenuItemType.ITEM,
        icon: React.createElement(FileText, {size: 16}),
    },
    {
        title: 'Quality Scorecard',
        url: '/supplier/scorecard',
        type: MenuItemType.ITEM,
        icon: React.createElement(Award, {size: 16}),
    },
    {
        title: 'EDI & Peppol Hub',
        url: '/supplier/edi',
        type: MenuItemType.ITEM,
        icon: React.createElement(FileSpreadsheet, {size: 16}),
    },
    {
        title: 'Supplier Settings',
        url: '/supplier/settings',
        type: MenuItemType.ITEM,
        icon: React.createElement(Settings, {size: 16}),
    },
];

// ==========================================
// 3. LOGISTICS WORKSPACE (P13 - P15 + Enterprise 2.0)
// ==========================================
export const logisticsMenu: Item[] = [
    {
        title: 'Live GPS Map',
        url: '/logistics/map',
        type: MenuItemType.ITEM,
        icon: React.createElement(MapPin, {size: 16}),
    },
    {
        title: 'Freight Routes',
        url: '/logistics/routes',
        type: MenuItemType.ITEM,
        icon: React.createElement(RouteIcon, {size: 16}),
    },
    {
        title: 'VRP Route Planner',
        url: '/logistics/routes/planner',
        type: MenuItemType.ITEM,
        icon: React.createElement(Sparkles, {size: 16}),
    },
    {
        title: 'Fleet & Vehicles',
        url: '/logistics/fleet',
        type: MenuItemType.ITEM,
        icon: React.createElement(Truck, {size: 16}),
    },
    {
        title: 'Drivers Registry',
        url: '/logistics/drivers',
        type: MenuItemType.ITEM,
        icon: React.createElement(Users, {size: 16}),
    },
    {
        title: 'e-CMR Consignments',
        url: '/logistics/ecmr',
        type: MenuItemType.ITEM,
        icon: React.createElement(FileCheck, {size: 16}),
    },
    {
        title: 'TMS Settings',
        url: '/logistics/settings',
        type: MenuItemType.ITEM,
        icon: React.createElement(Settings, {size: 16}),
    },
];

// ==========================================
// 4. ADMIN WORKSPACE (P16 - P18 + Enterprise 2.0)
// ==========================================
export const adminMenu: Item[] = [
    {
        title: 'Global Analytics',
        url: '/admin/analytics',
        type: MenuItemType.ITEM,
        icon: React.createElement(BarChart3, {size: 16}),
    },
    {
        title: 'Tenants Directory',
        url: '/admin/users',
        type: MenuItemType.ITEM,
        icon: React.createElement(Users, {size: 16}),
    },
    {
        title: 'KYC Queue',
        url: '/admin/users/verification',
        type: MenuItemType.ITEM,
        icon: React.createElement(UserCheck, {size: 16}),
    },
    {
        title: 'System Audit & Saga',
        url: '/admin/system-audit',
        type: MenuItemType.ITEM,
        icon: React.createElement(Activity, {size: 16}),
    },
    {
        title: 'Kafka DLT Inspector',
        url: '/admin/system-audit/kafka-dlt',
        type: MenuItemType.ITEM,
        icon: React.createElement(AlertTriangle, {size: 16}),
    },
    {
        title: 'Platform Settings',
        url: '/admin/settings',
        type: MenuItemType.ITEM,
        icon: React.createElement(Settings, {size: 16}),
    },
];

export const sidebarMenu: Item[] = [...buyerMenu];
