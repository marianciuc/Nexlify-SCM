import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Building2,
    Truck,
    Users,
    CreditCard,
    MessageSquare,
    Settings,
    BarChart3,
    FileText,
    CheckSquare,
    Search,
    Calculator,
    TrendingUp,
    MapPin,
    UserPlus,
    Boxes,
    PackageOpen,
    PackageCheck,
    ClipboardList,
    Shield,
    Globe,
    Target,
    DollarSign,
    Receipt,
    History,
    Percent,
    ArrowLeft,
    User,
    Bell,
    Lock,
    Database,
    Warehouse,
    Navigation,
    UserCheck,
    Activity,
} from 'lucide-react';
import React from 'react';

import {SecurityScope} from '@/types/api';

import {MenuItemType, type Item} from './types';

// Dashboard & Analytics Menu / Панель управления и аналитика
const dashboardMenu: Item[] = [
    {
        title: 'menu.dashboard',
        url: '/dashboard',
        type: MenuItemType.ITEM,
        permission: [SecurityScope.MOD_001_001],
        icon: React.createElement(LayoutDashboard, {size: 16}),
    },
    {
        title: 'menu.reports',
        url: '/dashboard/reports',
        type: MenuItemType.ITEM,
        permission: [SecurityScope.MOD_001_001],
        icon: React.createElement(FileText, {size: 16}),
    },
    {
        title: 'menu.analytics',
        url: '/dashboard/analytics',
        type: MenuItemType.ITEM,
        permission: [SecurityScope.MOD_001_001],
        icon: React.createElement(BarChart3, {size: 16}),
    },
];

// Order Management Menu / Управление заказами
const orderMenu: Item[] = [
    {
        title: 'menu.orders.root',
        url: '/orders',
        type: MenuItemType.GROUP,
        permission: [SecurityScope.MOD_001_001],
        icon: React.createElement(ShoppingCart, {size: 16}),
        children: [
            {
                title: 'menu.orders.create',
                url: '/orders/create',
                type: MenuItemType.ITEM,
                permission: [SecurityScope.MOD_001_001],
                icon: React.createElement(Package, {size: 16}),
            },
            {
                title: 'menu.orders.all',
                url: '/orders/all',
                type: MenuItemType.ITEM,
                permission: [SecurityScope.MOD_001_001],
                icon: React.createElement(ClipboardList, {size: 16}),
            },
            {
                title: 'menu.orders.tracking',
                url: '/orders/tracking',
                type: MenuItemType.ITEM,
                permission: [SecurityScope.MOD_001_001],
                icon: React.createElement(MapPin, {size: 16}),
            },
            {
                title: 'menu.orders.approval',
                url: '/orders/approval',
                type: MenuItemType.ITEM,
                permission: [SecurityScope.MOD_001_001],
                icon: React.createElement(CheckSquare, {size: 16}),
            },
        ],
    },
];

// Warehouse Management Menu / Управление складами
const warehouseMenu: Item[] = [
    {
        title: 'menu.warehouse.root',
        url: '/warehouse',
        type: MenuItemType.GROUP,
        permission: [SecurityScope.MOD_001_001],
        icon: React.createElement(Warehouse, {size: 16}),
        children: [
            {
                title: 'menu.warehouse.create',
                url: '/warehouse/create',
                type: MenuItemType.ITEM,
                permission: [SecurityScope.MOD_001_001],
                icon: React.createElement(Building2, {size: 16}),
            },
            {
                title: 'menu.warehouse.directory',
                url: '/warehouse/directory',
                type: MenuItemType.ITEM,
                permission: [SecurityScope.MOD_001_001],
                icon: React.createElement(Search, {size: 16}),
            },
            {
                title: 'menu.warehouse.inventory',
                url: '/warehouse/inventory',
                type: MenuItemType.ITEM,
                permission: [SecurityScope.MOD_001_001],
                icon: React.createElement(Boxes, {size: 16}),
            },
            {
                title: 'menu.warehouse.receiving',
                url: '/warehouse/receiving',
                type: MenuItemType.ITEM,
                permission: [SecurityScope.MOD_001_001],
                icon: React.createElement(PackageOpen, {size: 16}),
            },
            {
                title: 'menu.warehouse.shipping',
                url: '/warehouse/shipping',
                type: MenuItemType.ITEM,
                permission: [SecurityScope.MOD_001_001],
                icon: React.createElement(PackageCheck, {size: 16}),
            },
        ],
    },
];

// Logistics & Carrier Management Menu / Логистика и управление перевозчиками
const logisticsMenu: Item[] = [
    {
        title: 'menu.logistics.root',
        url: '/logistics',
        type: MenuItemType.GROUP,
        permission: [SecurityScope.MOD_001_001],
        icon: React.createElement(Truck, {size: 16}),
        children: [
            {
                title: 'menu.logistics.carriers',
                url: '/logistics/carriers',
                type: MenuItemType.ITEM,
                permission: [SecurityScope.MOD_001_001],
                icon: React.createElement(Users, {size: 16}),
            },
            {
                title: 'menu.logistics.delivery',
                url: '/logistics/delivery-options',
                type: MenuItemType.ITEM,
                permission: [SecurityScope.MOD_001_001],
                icon: React.createElement(Navigation, {size: 16}),
            },
            {
                title: 'menu.logistics.tracking',
                url: '/logistics/tracking',
                type: MenuItemType.ITEM,
                permission: [SecurityScope.MOD_001_001],
                icon: React.createElement(MapPin, {size: 16}),
            },
            {
                title: 'menu.logistics.calculator',
                url: '/logistics/calculator',
                type: MenuItemType.ITEM,
                permission: [SecurityScope.MOD_001_001],
                icon: React.createElement(Calculator, {size: 16}),
            },
            {
                title: 'menu.logistics.performance',
                url: '/logistics/performance',
                type: MenuItemType.ITEM,
                permission: [SecurityScope.MOD_001_001],
                icon: React.createElement(TrendingUp, {size: 16}),
            },
        ],
    },
];

// Supplier & Marketplace Menu / Поставщики и торговая площадка
const supplierMenu: Item[] = [
    {
        title: 'menu.suppliers.root',
        url: '/suppliers',
        type: MenuItemType.GROUP,
        permission: [SecurityScope.MOD_001_001],
        icon: React.createElement(Users, {size: 16}),
        children: [
            {
                title: 'menu.suppliers.directory',
                url: '/suppliers/directory',
                type: MenuItemType.ITEM,
                permission: [SecurityScope.MOD_001_001],
                icon: React.createElement(Search, {size: 16}),
            },
            {
                title: 'menu.suppliers.catalog',
                url: '/suppliers/catalog',
                type: MenuItemType.ITEM,
                permission: [SecurityScope.MOD_001_001],
                icon: React.createElement(Package, {size: 16}),
            },
            {
                title: 'menu.suppliers.ratings',
                url: '/suppliers/ratings',
                type: MenuItemType.ITEM,
                permission: [SecurityScope.MOD_001_001],
                icon: React.createElement(Target, {size: 16}),
            },
            {
                title: 'menu.suppliers.contracts',
                url: '/suppliers/contracts',
                type: MenuItemType.ITEM,
                permission: [SecurityScope.MOD_001_001],
                icon: React.createElement(FileText, {size: 16}),
            },
        ],
    },
];

// Financial Management Menu / Финансовое управление
const financialMenu: Item[] = [
    {
        title: 'menu.finance.root',
        url: '/finance',
        type: MenuItemType.GROUP,
        permission: [SecurityScope.MOD_001_001],
        icon: React.createElement(CreditCard, {size: 16}),
        children: [
            {
                title: 'menu.finance.invoicing',
                url: '/finance/invoicing',
                type: MenuItemType.ITEM,
                permission: [SecurityScope.MOD_001_001],
                icon: React.createElement(Receipt, {size: 16}),
            },
            {
                title: 'menu.finance.payments',
                url: '/finance/payments',
                type: MenuItemType.ITEM,
                permission: [SecurityScope.MOD_001_001],
                icon: React.createElement(DollarSign, {size: 16}),
            },
            {
                title: 'menu.finance.reports',
                url: '/finance/reports',
                type: MenuItemType.ITEM,
                permission: [SecurityScope.MOD_001_001],
                icon: React.createElement(BarChart3, {size: 16}),
            },
            {
                title: 'menu.finance.credit',
                url: '/finance/credit',
                type: MenuItemType.ITEM,
                permission: [SecurityScope.MOD_001_001],
                icon: React.createElement(Percent, {size: 16}),
            },
            {
                title: 'menu.finance.history',
                url: '/finance/history',
                type: MenuItemType.ITEM,
                permission: [SecurityScope.MOD_001_001],
                icon: React.createElement(History, {size: 16}),
            },
        ],
    },
];

// Communication Menu / Коммуникация
const communicationMenu: Item[] = [
    {
        title: 'menu.communication.root',
        url: '/communication',
        type: MenuItemType.GROUP,
        permission: [SecurityScope.MOD_001_001],
        icon: React.createElement(MessageSquare, {size: 16}),
        children: [
            {
                title: 'menu.communication.messages',
                url: '/communication/messages',
                type: MenuItemType.ITEM,
                permission: [SecurityScope.MOD_001_001],
                icon: React.createElement(MessageSquare, {size: 16}),
            },
            {
                title: 'menu.communication.notifications',
                url: '/communication/notifications',
                type: MenuItemType.ITEM,
                permission: [SecurityScope.MOD_001_001],
                icon: React.createElement(Bell, {size: 16}),
            },
        ],
    },
];

// User Management Menu / Управление пользователями
const userManagementMenu: Item[] = [
    {
        title: 'menu.users.root',
        url: '/users',
        type: MenuItemType.GROUP,
        permission: [SecurityScope.MOD_001_002],
        icon: React.createElement(Users, {size: 16}),
        children: [
            {
                title: 'menu.users.employees',
                url: '/users/employees',
                type: MenuItemType.ITEM,
                permission: [SecurityScope.MOD_001_002],
                icon: React.createElement(UserPlus, {size: 16}),
            },
            {
                title: 'menu.users.roles',
                url: '/users/roles',
                type: MenuItemType.ITEM,
                permission: [SecurityScope.MOD_001_002],
                icon: React.createElement(Shield, {size: 16}),
            },
            {
                title: 'menu.users.verification',
                url: '/users/verification',
                type: MenuItemType.ITEM,
                permission: [SecurityScope.MOD_001_002],
                icon: React.createElement(UserCheck, {size: 16}),
            },
        ],
    },
];

// Administrator Menu / Администратор
const administatorMenu: Item[] = [
    {
        title: 'menu.admin.root',
        url: '/admin',
        type: MenuItemType.GROUP,
        permission: [SecurityScope.MOD_001_001, SecurityScope.MOD_001_002],
        icon: React.createElement(Shield, {size: 16}),
        children: [
            {
                title: 'menu.admin.system',
                url: '/admin/system',
                type: MenuItemType.ITEM,
                permission: [SecurityScope.MOD_001_001],
                icon: React.createElement(Settings, {size: 16}),
            },
            {
                title: 'menu.admin.users',
                url: '/admin/users',
                type: MenuItemType.ITEM,
                permission: [SecurityScope.MOD_001_002],
                icon: React.createElement(Users, {size: 16}),
            },
            {
                title: 'menu.admin.analytics',
                url: '/admin/analytics',
                type: MenuItemType.ITEM,
                permission: [SecurityScope.MOD_001_001],
                icon: React.createElement(Activity, {size: 16}),
            },
            {
                title: 'menu.admin.security',
                url: '/admin/security',
                type: MenuItemType.ITEM,
                permission: [SecurityScope.MOD_001_001],
                icon: React.createElement(Lock, {size: 16}),
            },
        ],
    },
];

// Settings Menu / Настройки
const settingsMenu: Item[] = [
    {
        title: 'menu.back',
        url: '/dashboard',
        type: MenuItemType.ITEM,
        icon: React.createElement(ArrowLeft, {size: 16}),
    },
    {
        title: 'menu.settingsMenu.profile',
        url: '/settings/profile',
        type: MenuItemType.ITEM,
        icon: React.createElement(User, {size: 16}),
    },
    {
        title: 'menu.settingsMenu.system',
        url: '/settings/system',
        type: MenuItemType.ITEM,
        permission: [SecurityScope.MOD_001_001],
        icon: React.createElement(Settings, {size: 16}),
    },
    {
        title: 'menu.settingsMenu.integration',
        url: '/settings/integration',
        type: MenuItemType.ITEM,
        permission: [SecurityScope.MOD_001_001],
        icon: React.createElement(Globe, {size: 16}),
    },
    {
        title: 'menu.settingsMenu.security',
        url: '/settings/security',
        type: MenuItemType.ITEM,
        permission: [SecurityScope.MOD_001_001],
        icon: React.createElement(Lock, {size: 16}),
    },
    {
        title: 'menu.settingsMenu.backup',
        url: '/settings/backup',
        type: MenuItemType.ITEM,
        permission: [SecurityScope.MOD_001_001],
        icon: React.createElement(Database, {size: 16}),
    },
];

export const sidebarMenu: Item[] = [
    ...dashboardMenu,
    ...orderMenu,
    ...warehouseMenu,
    ...logisticsMenu,
    ...supplierMenu,
    ...financialMenu,
    ...communicationMenu,
    ...userManagementMenu,
    ...administatorMenu,
];

export const settingsSidebarMenu: Item[] = [...settingsMenu];
