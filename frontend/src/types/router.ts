export interface BreadcrumbItem {
    label: string;
}

declare module '@tanstack/react-router' {
    interface StaticDataRouteOption {
        crumb?: BreadcrumbItem;
    }
}
