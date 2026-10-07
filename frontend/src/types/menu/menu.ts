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
    Route as RouteIcon,
    UserCheck,
    FileCheck,
    Activity,
    } from 'lucide-react';
import React from 'react';

import { MenuItemType, type Item } from './types';

// ==========================================
// BUYER WORKSPACE
// ==========================================
export const buyerMenu: Item[] = [
    {
        title: 'nav.buyer.catalog',
        url: '/buyer/catalog',
        type: MenuItemType.ITEM,
        icon: React.createElement(Package, { size: 16 }),
    },
    {
        title: 'nav.buyer.cart',
        url: '/buyer/cart',
        type: MenuItemType.ITEM,
        icon: React.createElement(ShoppingCart, { size: 16 }),
    },
    {
        title: 'nav.buyer.orders',
        url: '/buyer/orders',
        type: MenuItemType.ITEM,
        icon: React.createElement(ListChecks, { size: 16 }),
    },
    {
        title: 'nav.buyer.invoices',
        url: '/buyer/invoices',
        type: MenuItemType.ITEM,
        icon: React.createElement(Receipt, { size: 16 }),
    },
    {
        title: 'nav.buyer.rfq',
        url: '/buyer/requests',
        type: MenuItemType.ITEM,
        icon: React.createElement(FileQuestion, { size: 16 }),
    },
    {
        title: 'nav.buyer.contracts',
        url: '/buyer/contracts',
        type: MenuItemType.ITEM,
        icon: React.createElement(FileText, { size: 16 }),
    },
    {
        title: 'nav.buyer.claims',
        url: '/buyer/claims',
        type: MenuItemType.ITEM,
        icon: React.createElement(ShieldAlert, { size: 16 }),
    },
    {
        title: 'nav.buyer.settings',
        url: '/buyer/settings',
        type: MenuItemType.ITEM,
        icon: React.createElement(Settings, { size: 16 }),
    },
];

// ==========================================
// SUPPLIER WORKSPACE
// ==========================================
export const supplierMenu: Item[] = [
    {
        title: 'nav.supplier.dashboard',
        url: '/supplier/dashboard',
        type: MenuItemType.ITEM,
        icon: React.createElement(LayoutDashboard, { size: 16 }),
    },
    {
        title: 'nav.supplier.products',
        url: '/supplier/products',
        type: MenuItemType.ITEM,
        icon: React.createElement(Package, { size: 16 }),
    },
    {
        title: 'nav.supplier.warehouseMap',
        url: '/supplier/inventory/map',
        type: MenuItemType.ITEM,
        icon: React.createElement(MapPin, { size: 16 }),
    },
    {
        title: 'nav.supplier.transfers',
        url: '/supplier/inventory/transfers',
        type: MenuItemType.ITEM,
        icon: React.createElement(ArrowLeftRight, { size: 16 }),
    },
    {
        title: 'nav.supplier.abcXyz',
        url: '/supplier/inventory/abc-xyz',
        type: MenuItemType.ITEM,
        icon: React.createElement(Grid, { size: 16 }),
    },
    {
        title: 'nav.supplier.fulfillment',
        url: '/supplier/orders',
        type: MenuItemType.ITEM,
        icon: React.createElement(Boxes, { size: 16 }),
    },
    {
        title: 'nav.supplier.pricing',
        url: '/supplier/pricing',
        type: MenuItemType.ITEM,
        icon: React.createElement(Target, { size: 16 }),
    },
    {
        title: 'nav.supplier.rfq',
        url: '/supplier/bids/board',
        type: MenuItemType.ITEM,
        icon: React.createElement(FileText, { size: 16 }),
    },
    {
        title: 'nav.supplier.scorecard',
        url: '/supplier/scorecard',
        type: MenuItemType.ITEM,
        icon: React.createElement(Award, { size: 16 }),
    },
    {
        title: 'nav.supplier.settings',
        url: '/supplier/settings',
        type: MenuItemType.ITEM,
        icon: React.createElement(Settings, { size: 16 }),
    },
];

// ==========================================
// LOGISTICS WORKSPACE
// ==========================================
export const logisticsMenu: Item[] = [
    {
        title: 'nav.logistics.map',
        url: '/logistics/map',
        type: MenuItemType.ITEM,
        icon: React.createElement(MapPin, { size: 16 }),
    },
    {
        title: 'nav.logistics.routes',
        url: '/logistics/routes',
        type: MenuItemType.ITEM,
        icon: React.createElement(RouteIcon, { size: 16 }),
    },
    {
        title: 'nav.logistics.planner',
        url: '/logistics/routes/planner',
        type: MenuItemType.ITEM,
        icon: React.createElement(RouteIcon, { size: 16 }),
    },
    {
        title: 'nav.logistics.fleet',
        url: '/logistics/fleet',
        type: MenuItemType.ITEM,
        icon: React.createElement(Truck, { size: 16 }),
    },
    {
        title: 'nav.logistics.drivers',
        url: '/logistics/drivers',
        type: MenuItemType.ITEM,
        icon: React.createElement(Users, { size: 16 }),
    },
    {
        title: 'nav.logistics.ecmr',
        url: '/logistics/ecmr',
        type: MenuItemType.ITEM,
        icon: React.createElement(FileCheck, { size: 16 }),
    },
    {
        title: 'nav.logistics.settings',
        url: '/logistics/settings',
        type: MenuItemType.ITEM,
        icon: React.createElement(Settings, { size: 16 }),
    },
];

// ==========================================
// ADMIN WORKSPACE
// ==========================================
export const adminMenu: Item[] = [
    {
        title: 'nav.admin.analytics',
        url: '/admin/analytics',
        type: MenuItemType.ITEM,
        icon: React.createElement(BarChart3, { size: 16 }),
    },
    {
        title: 'nav.admin.tenants',
        url: '/admin/users',
        type: MenuItemType.ITEM,
        icon: React.createElement(Users, { size: 16 }),
    },
    {
        title: 'nav.admin.kyc',
        url: '/admin/users/verification',
        type: MenuItemType.ITEM,
        icon: React.createElement(UserCheck, { size: 16 }),
    },
    {
        title: 'nav.admin.audit',
        url: '/admin/system-audit',
        type: MenuItemType.ITEM,
        icon: React.createElement(Activity, { size: 16 }),
    },
    {
        title: 'nav.admin.settings',
        url: '/admin/settings',
        type: MenuItemType.ITEM,
        icon: React.createElement(Settings, { size: 16 }),
    },
];

export const sidebarMenu: Item[] = [...buyerMenu];