import { createFileRoute, Link } from '@tanstack/react-router';
import { Search, LayoutGrid, List, ShoppingCart, Package, SlidersHorizontal, Filter, X } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';

import {
    CategoryHierarchyFilter,
    BrandAndManufacturerFilter,
    QuantityInput,
} from '@/components/inventory';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLocale } from '@/hooks/useLocale';
import {
    useInventoryQuery,
    useInventoryDataSourceQuery,
    useCategoriesQuery,
    useBrandsQuery,
    useManufacturersQuery,
    INITIAL_CATEGORIES,
    INITIAL_BRANDS,
    INITIAL_MANUFACTURERS,
} from '@/hooks/useScmQueries';
import { ENHANCED_CATALOG, type EnhancedStockItem } from '@/lib/demo-catalog';
import { useCartStore } from '@/service/cart/cart-store';

export const Route = createFileRoute('/buyer/catalog/')({
    component: BuyerCatalogPage,
});

const priceFormatter = new Intl.NumberFormat('pl-PL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});
const normalizeSearch = (value: string) =>
    value
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLocaleLowerCase();

type ViewMode = 'table' | 'grid';
type StockFilter = 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

function BuyerCatalogPage() {
    return <BuyerCatalogContent />;
}

function BuyerCatalogContent() {
    const { t } = useLocale();
    const routeSearch = Route.useSearch();
    const navigate = Route.useNavigate();
    const inventoryQuery = useInventoryQuery();
    const { data: stockItems = [] } = inventoryQuery;
    const { data: inventorySource = 'demo' } = useInventoryDataSourceQuery();
    const { data: categories = INITIAL_CATEGORIES } = useCategoriesQuery();
    const { data: brands = INITIAL_BRANDS } = useBrandsQuery();
    const { data: manufacturers = INITIAL_MANUFACTURERS } = useManufacturersQuery();
    const addItemToCart = useCartStore((s) => s.addItem);

    const { q: searchTerm, category, brand, manufacturer, stock } = routeSearch;
    const updateFilters = (patch: Partial<typeof routeSearch>) => {
        void navigate({
            search: (previous) => ({
                q: previous.q ?? '',
                category: previous.category ?? 'ALL',
                brand: previous.brand ?? 'ALL',
                manufacturer: previous.manufacturer ?? 'ALL',
                stock: previous.stock ?? 'ALL',
                ...patch,
            }),
            replace: true,
        });
    };
    const setSearchTerm = (q: string) => updateFilters({ q });
    const setSelectedCategoryId = (next: string) => updateFilters({ category: next });
    const setSelectedBrandId = (next: string) => updateFilters({ brand: next });
    const setSelectedManufacturerId = (next: string) => updateFilters({ manufacturer: next });
    const setSelectedStockStatus = (next: string) => updateFilters({ stock: next });

    const [viewMode, setViewMode] = useState<ViewMode>('table');
    const [useCompactCatalog, setUseCompactCatalog] = useState(false);
    const [showCategories, setShowCategories] = useState(false);
    const [showMoreFilters, setShowMoreFilters] = useState(false);
    const [quickQuantities, setQuickQuantities] = useState<Record<string, number>>({});
    const cartLinesCount = useCartStore((s) => s.items.length);

    useEffect(() => {
        const media = window.matchMedia('(max-width: 1100px)');
        const updateViewport = () => setUseCompactCatalog(media.matches);
        updateViewport();
        media.addEventListener('change', updateViewport);
        return () => media.removeEventListener('change', updateViewport);
    }, []);
    const effectiveViewMode = useCompactCatalog ? 'grid' : viewMode;

    // Merge enhanced catalog items with any new items created through the UI
    const allCatalogItems = useMemo<EnhancedStockItem[]>(() => {
        const map = new Map<string, EnhancedStockItem>();
        if (inventorySource === 'demo') {
            ENHANCED_CATALOG.forEach((item) => map.set(item.sku, item));
        }
        stockItems.forEach((si) => {
            const existing = map.get(si.sku);
            if (existing) {
                map.set(si.sku, {
                    ...existing,
                    ...si,
                    moq: si.minOrderQuantity ?? existing.moq,
                    weightKg: si.weightKg ?? existing.weightKg,
                    volumeM3: existing.volumeM3,
                    supplierName: existing.supplierName,
                    supplierNip: existing.supplierNip,
                    leadTimeDays: existing.leadTimeDays,
                    certifications: existing.certifications,
                });
            } else {
                map.set(si.sku, {
                    ...si,
                    moq: si.minOrderQuantity ?? 1,
                    weightKg: si.weightKg ?? 0,
                    volumeM3: 0,
                    supplierName: undefined,
                    supplierNip: undefined,
                    leadTimeDays: undefined,
                    certifications: [],
                });
            }
        });
        return Array.from(map.values());
    }, [stockItems, inventorySource]);

    const filteredItems = useMemo(() => {
        return allCatalogItems.filter((item) => {
            const searchableFields = [
                item.name,
                item.sku,
                item.category,
                item.subcategory,
                item.brand,
                item.manufacturer,
                item.supplierName,
            ]
                .filter((field): field is string => Boolean(field))
                .map(normalizeSearch);
            const terms = normalizeSearch(searchTerm).trim().split(/\s+/).filter(Boolean);
            const matchesSearch =
                terms.length === 0 ||
                terms.every((term) => searchableFields.some((field) => field.includes(term)));

            let matchesCategory = true;
            if (category !== 'ALL') {
                const directCatMatch = item.categoryId === category || item.category === category;
                const subCatMatch = item.subcategoryId === category || item.subcategory === category;
                const parentCategory =
                    categories.find((c) => c.id === category || c.name === category);
                const childMatch = parentCategory?.children?.some(
                    (child) =>
                        child.id === item.subcategoryId ||
                        child.id === item.categoryId ||
                        child.name === item.category ||
                        child.name === item.subcategory
                );
                matchesCategory = Boolean(directCatMatch || subCatMatch || childMatch);
            }

            const matchesBrand =
                brand === 'ALL' ||
                item.brandId === brand ||
                item.brand === brand ||
                brands.find((b) => b.id === brand)?.name === item.brand;

            const matchesManufacturer =
                manufacturer === 'ALL' ||
                item.manufacturerId === manufacturer ||
                item.manufacturer === manufacturer ||
                manufacturers.find((m) => m.id === manufacturer)?.name === item.manufacturer;

            const matchesStock =
                stock === 'ALL' ||
                (stock === 'IN_STOCK' && item.status === 'IN_STOCK') ||
                (stock === 'LOW_STOCK' && item.status === 'LOW_STOCK') ||
                (stock === 'OUT_OF_STOCK' && item.status === 'OUT_OF_STOCK');

            return matchesSearch && matchesCategory && matchesBrand && matchesManufacturer && matchesStock;
        });
    }, [allCatalogItems, searchTerm, category, brand, manufacturer, stock, categories, brands, manufacturers]);

    const handleQuickAddToCart = (item: EnhancedStockItem) => {
        if (!item.supplierNip) {
            toast.error(t('buyer.catalog.errors.noSupplier'));
            return;
        }
        const minimumQuantity = item.moq ?? 1;
        const qty = quickQuantities[item.sku] || minimumQuantity;
        if (qty < minimumQuantity) {
            toast.error(
                t('buyer.catalog.errors.moqBelow', {
                    sku: item.sku,
                    min: minimumQuantity,
                    unit: item.unit,
                })
            );
            return;
        }
        addItemToCart(
            {
                sku: item.sku,
                name: item.name,
                category: item.category,
                unitPrice: item.unitPrice,
                moq: minimumQuantity,
                unit: item.unit,
                vendorId: item.supplierNip || '',
                vendorName: item.supplierName || '',
                vendorNip: item.supplierNip || '',
                weightKg: item.weightKg ?? 0,
                volumeM3: item.volumeM3,
            },
            qty
        );
        toast.success(
            t('buyer.catalog.actions.addedSuccess', { qty, unit: item.unit, name: item.name })
        );
    };

    const handleClearFilters = () => {
        updateFilters({ q: '', category: 'ALL', brand: 'ALL', manufacturer: 'ALL', stock: 'ALL' });
    };

    const activeFilterCount =
        Number(category !== 'ALL') +
        Number(brand !== 'ALL') +
        Number(manufacturer !== 'ALL') +
        Number(stock !== 'ALL');

    if (inventoryQuery.isLoading) {
        return (
            <div className="space-y-3" aria-busy="true" role="status">
                <h1 className="text-xl font-semibold">{t('common.loading')}</h1>
                <div className="h-10 rounded-md bg-muted animate-pulse" />
                <div className="h-64 rounded-md bg-muted animate-pulse" />
            </div>
        );
    }

    return (
        <div className="space-y-5 min-w-0">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {t('buyer.pageTitle.catalog')}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {t('buyer.pageTitle.catalogSubtitle')}
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        asChild
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 h-8 font-medium"
                    >
                        <Link
                            to="/buyer/cart"
                            aria-label={t('header.openCartAria', {
                                count: cartLinesCount,
                            })}
                        >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            <span>
                                {t('header.cart')}
                                {cartLinesCount > 0 ? ` · ${cartLinesCount}` : ''}
                            </span>
                        </Link>
                    </Button>
                </div>
            </div>

            {inventorySource === 'demo' && (
                <p
                    role="status"
                    className="border-l-2 border-amber-500 pl-3 py-1 text-sm text-muted-foreground"
                >
                    {t('buyer.catalog.demoNotice')}
                </p>
            )}
            {inventorySource === 'cached' && (
                <p
                    role="status"
                    className="border-l-2 border-amber-500 pl-3 py-1 text-sm text-muted-foreground"
                >
                    {t('buyer.catalog.cachedNotice')}
                </p>
            )}

            {/* Toolbar: search, filters, view toggle */}
            <div className="flex flex-col gap-2.5 bg-card p-3 rounded-xl border border-border shadow-2xs sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCategories((v) => !v)}
                        className="h-8 gap-1.5 text-xs border-border shrink-0"
                        aria-expanded={showCategories}
                    >
                        <Filter className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">
                            {showCategories
                                ? t('buyer.catalog.categoriesHide')
                                : t('buyer.catalog.categoriesToggle')}
                        </span>
                    </Button>

                    <div className="relative flex-1 max-w-md min-w-[180px]">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            type="search"
                            aria-label={t('buyer.catalog.searchLabel')}
                            placeholder={t('buyer.catalog.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 pr-7 bg-muted/30 text-xs h-8 border-border"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                aria-label={t('buyer.catalog.clearSearch')}
                                className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 justify-between sm:justify-end shrink-0">
                    <span className="text-xs text-muted-foreground font-medium">
                        {t('buyer.catalog.found')}:{' '}
                        <strong className="text-foreground font-mono tabular-nums">
                            {filteredItems.length}
                        </strong>
                    </span>

                    <Button
                        variant="outline"
                        size="sm"
                        aria-expanded={showMoreFilters}
                        onClick={() => setShowMoreFilters((v) => !v)}
                        className="h-8 gap-1.5 text-xs"
                    >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        <span>{t('buyer.catalog.moreFilters')}</span>
                        {activeFilterCount > 0 && (
                            <span className="rounded-full bg-primary px-1.5 text-primary-foreground">
                                {activeFilterCount}
                            </span>
                        )}
                    </Button>
                    <div className="hidden min-[1101px]:flex items-center gap-1 border-l pl-2 border-border">
                        <Button
                            variant={effectiveViewMode === 'table' ? 'default' : 'ghost'}
                            size="sm"
                            className="h-8 px-2.5 gap-1 text-xs"
                            onClick={() => setViewMode('table')}
                            title={t('buyer.catalog.viewTableTitle')}
                        >
                            <List className="h-3.5 w-3.5" />
                            <span className="hidden md:inline font-medium">
                                {t('buyer.catalog.viewTable')}
                            </span>
                        </Button>
                        <Button
                            variant={effectiveViewMode === 'grid' ? 'default' : 'ghost'}
                            size="sm"
                            className="h-8 px-2.5 gap-1 text-xs"
                            onClick={() => setViewMode('grid')}
                            title={t('buyer.catalog.viewGridTitle')}
                        >
                            <LayoutGrid className="h-3.5 w-3.5" />
                            <span className="hidden md:inline font-medium">
                                {t('buyer.catalog.viewGrid')}
                            </span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Brand & Manufacturer Dropdowns Filter */}
            {showMoreFilters && (
                <div className="rounded-lg border border-border p-3 space-y-3">
                    <BrandAndManufacturerFilter
                        brands={brands}
                        manufacturers={manufacturers}
                        selectedBrandId={brand}
                        selectedManufacturerId={manufacturer}
                        onSelectBrand={setSelectedBrandId}
                        onSelectManufacturer={setSelectedManufacturerId}
                        onClearAll={handleClearFilters}
                        allowCreation={false}
                    />
                    <div
                        className="flex flex-wrap gap-x-5 gap-y-2 text-sm"
                        role="group"
                        aria-label={t('buyer.catalog.filters.stockGroupLabel')}
                    >
                        {(
                            [
                                { id: 'ALL', label: t('buyer.catalog.filters.stockAll') },
                                { id: 'IN_STOCK', label: t('buyer.catalog.filters.stockIn') },
                                { id: 'LOW_STOCK', label: t('buyer.catalog.filters.stockLow') },
                                { id: 'OUT_OF_STOCK', label: t('buyer.catalog.filters.stockOut') },
                            ] as { id: StockFilter; label: string }[]
                        ).map((status) => (
                            <label key={status.id} className="inline-flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="stock-status"
                                    checked={stock === status.id}
                                    onChange={() => setSelectedStockStatus(status.id)}
                                />
                                {status.label}
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Layout: optional category sidebar + product content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
                {showCategories && (
                    <div className="lg:col-span-1 space-y-4">
                        <CategoryHierarchyFilter
                            categories={categories}
                            selectedCategoryId={category}
                            onSelectCategory={(id) => setSelectedCategoryId(id)}
                            items={allCatalogItems}
                            allowCreation={false}
                        />
                    </div>
                )}

                <div className={`${showCategories ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-4 min-w-0`}>
                    {/* Active Filter Chips */}
                    {(category !== 'ALL' ||
                        brand !== 'ALL' ||
                        manufacturer !== 'ALL' ||
                        stock !== 'ALL' ||
                        searchTerm) && (
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="text-muted-foreground font-medium">
                                {t('buyer.catalog.filters.activeFilters')}
                            </span>
                            {category !== 'ALL' && (
                                <Badge variant="secondary" className="gap-1 border-border">
                                    {t('buyer.catalog.filters.category')}:{' '}
                                    {categories.find((c) => c.id === category)?.name || category}
                                    <button
                                        onClick={() => setSelectedCategoryId('ALL')}
                                        aria-label={t('buyer.catalog.filters.removeCategory')}
                                        className="hover:text-destructive ml-1"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                            {brand !== 'ALL' && (
                                <Badge variant="secondary" className="gap-1 border-border">
                                    {t('buyer.catalog.filters.brand')}:{' '}
                                    {brands.find((b) => b.id === brand)?.name || brand}
                                    <button
                                        onClick={() => setSelectedBrandId('ALL')}
                                        aria-label={t('buyer.catalog.filters.removeBrand')}
                                        className="hover:text-destructive ml-1"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                            {manufacturer !== 'ALL' && (
                                <Badge variant="secondary" className="gap-1 border-border">
                                    {t('buyer.catalog.filters.manufacturer')}:{' '}
                                    {manufacturers.find((m) => m.id === manufacturer)?.name || manufacturer}
                                    <button
                                        onClick={() => setSelectedManufacturerId('ALL')}
                                        aria-label={t('buyer.catalog.filters.removeManufacturer')}
                                        className="hover:text-destructive ml-1"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                            {stock !== 'ALL' && (
                                <Badge variant="secondary" className="gap-1 border-border">
                                    {t('buyer.catalog.filters.stock')}:{' '}
                                    {({
                                        IN_STOCK: t('buyer.catalog.filters.stockIn'),
                                        LOW_STOCK: t('buyer.catalog.filters.stockLow'),
                                        OUT_OF_STOCK: t('buyer.catalog.filters.stockOut'),
                                        ALL: t('buyer.catalog.filters.stockAll'),
                                    } as Record<string, string>)[stock] || stock}
                                    <button
                                        onClick={() => setSelectedStockStatus('ALL')}
                                        aria-label={t('buyer.catalog.filters.removeStock')}
                                        className="hover:text-destructive ml-1"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                            {searchTerm && (
                                <Badge variant="secondary" className="gap-1 border-border">
                                    {t('buyer.catalog.filters.search')}: "{searchTerm}"
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        aria-label={t('buyer.catalog.filters.clearSearch')}
                                        className="hover:text-destructive ml-1"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearFilters}
                                className="h-6 px-1.5 text-xs text-muted-foreground hover:text-destructive"
                            >
                                {t('common.clearAll')}
                            </Button>
                        </div>
                    )}

                    {filteredItems.length === 0 ? (
                        <div className="p-12 text-center bg-card rounded-xl border border-dashed border-border space-y-3">
                            <Package className="h-10 w-10 mx-auto text-muted-foreground/60" />
                            <h3 className="font-semibold text-foreground text-sm">
                                {t('buyer.catalog.empty.title')}
                            </h3>
                            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                {t('buyer.catalog.empty.description')}
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClearFilters}
                                className="text-xs h-8"
                            >
                                {t('buyer.catalog.empty.reset')}
                            </Button>
                        </div>
                    ) : effectiveViewMode === 'table' ? (
                        <CatalogTable
                            items={filteredItems}
                            quickQuantities={quickQuantities}
                            setQuickQuantities={setQuickQuantities}
                            onAdd={handleQuickAddToCart}
                        />
                    ) : (
                        <CatalogGrid
                            items={filteredItems}
                            quickQuantities={quickQuantities}
                            setQuickQuantities={setQuickQuantities}
                            onAdd={handleQuickAddToCart}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

interface CatalogListProps {
    items: EnhancedStockItem[];
    quickQuantities: Record<string, number>;
    setQuickQuantities: React.Dispatch<React.SetStateAction<Record<string, number>>>;
    onAdd: (item: EnhancedStockItem) => void;
}

function CatalogTable({ items, quickQuantities, setQuickQuantities, onAdd }: CatalogListProps) {
    const { t } = useLocale();
    return (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[760px]">
                    <caption className="sr-only">{t('buyer.catalog.table.caption')}</caption>
                    <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
                        <tr>
                            <th className="p-3 w-40">{t('buyer.catalog.table.sku')}</th>
                            <th className="p-3">{t('buyer.catalog.table.item')}</th>
                            <th className="p-3">{t('buyer.catalog.table.brandMfr')}</th>
                            <th className="p-3 text-right">{t('buyer.catalog.table.stock')}</th>
                            <th className="p-3 text-right">{t('buyer.catalog.table.price')}</th>
                            <th className="p-3 text-center w-20">{t('buyer.catalog.table.moq')}</th>
                            <th className="p-3 text-center w-36">{t('buyer.catalog.table.qty')}</th>
                            <th className="p-3 text-right w-28">
                                {t('buyer.catalog.table.action')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {items.map((item) => {
                            const minimumQuantity = item.moq ?? 1;
                            const currentQty = quickQuantities[item.sku] || minimumQuantity;
                            return (
                                <tr key={item.sku} className="hover:bg-muted/30 transition-colors">
                                    <td className="p-3 font-mono">
                                        <span className="font-bold text-foreground px-1.5 py-0.5 rounded bg-muted/60 border border-border inline-block">
                                            {item.sku}
                                        </span>
                                        {item.leadTimeDays && (
                                            <div className="text-[10px] text-muted-foreground mt-0.5">
                                                {t('buyer.catalog.table.leadTime', {
                                                    days: item.leadTimeDays,
                                                })}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        <Link
                                            to="/buyer/catalog/$sku"
                                            params={{ sku: item.sku }}
                                            search={(prev) => ({
                                                q: prev.q ?? '',
                                                category: prev.category ?? 'ALL',
                                                brand: prev.brand ?? 'ALL',
                                                manufacturer: prev.manufacturer ?? 'ALL',
                                                stock: prev.stock ?? 'ALL',
                                            })}
                                            className="font-semibold text-foreground hover:text-primary transition-colors hover:underline block max-w-xs"
                                        >
                                            {item.name}
                                        </Link>
                                        <span className="text-[11px] text-muted-foreground mt-0.5 block truncate max-w-xs">
                                            {item.category}
                                            {item.subcategory ? ` › ${item.subcategory}` : ''}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        {item.brand && (
                                            <div className="font-medium text-foreground">
                                                {item.brand}
                                            </div>
                                        )}
                                        {item.manufacturer && (
                                            <div className="text-[11px] text-muted-foreground truncate max-w-[180px] mt-0.5">
                                                {item.manufacturer}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-3 text-right">
                                        <div
                                            className={
                                                item.status === 'OUT_OF_STOCK'
                                                    ? 'text-destructive'
                                                    : item.status === 'LOW_STOCK'
                                                        ? 'text-amber-700 dark:text-amber-400'
                                                        : 'text-emerald-700 dark:text-emerald-400'
                                            }
                                        >
                                            {item.status === 'OUT_OF_STOCK'
                                                ? t('buyer.catalog.stock.out')
                                                : item.status === 'LOW_STOCK'
                                                    ? t('buyer.catalog.stock.low')
                                                    : t('buyer.catalog.stock.in')}
                                        </div>
                                        <div className="text-xs text-muted-foreground tabular-nums">
                                            {item.quantityAvailable.toLocaleString('pl-PL')} {item.unit}
                                        </div>
                                    </td>
                                    <td className="p-3 text-right">
                                        <div className="font-bold text-foreground font-mono tabular-nums">
                                            {priceFormatter.format(item.unitPrice)} PLN
                                        </div>
                                    </td>
                                    <td className="p-3 text-center">
                                        <span className="font-mono tabular-nums text-sm">
                                            {item.moq ?? '—'}
                                            {item.moq && (
                                                <span className="text-xs text-muted-foreground">
                                                    {' '}
                                                    {item.unit}
                                                </span>
                                            )}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center">
                                        <QuantityInput
                                            value={currentQty}
                                            minimum={minimumQuantity}
                                            label={t('buyer.catalog.table.qtyLabel', {
                                                name: item.name,
                                                min: minimumQuantity,
                                                unit: item.unit,
                                            })}
                                            onCommit={(value) =>
                                                setQuickQuantities((prev) => ({
                                                    ...prev,
                                                    [item.sku]: value,
                                                }))
                                            }
                                            className="h-8 w-20 mx-auto text-xs text-center font-mono tabular-nums bg-background"
                                        />
                                    </td>
                                    <td className="p-3 text-right">
                                        <Button
                                            size="sm"
                                            disabled={!item.supplierNip}
                                            title={
                                                !item.supplierNip
                                                    ? t('buyer.catalog.actions.cannotAddTitle')
                                                    : undefined
                                            }
                                            aria-label={
                                                item.supplierNip
                                                    ? t('buyer.catalog.actions.addToCartAria', {
                                                          name: item.name,
                                                      })
                                                    : t('buyer.catalog.actions.cannotAdd', {
                                                          name: item.name,
                                                      })
                                            }
                                            onClick={() => onAdd(item)}
                                            className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 font-medium whitespace-nowrap"
                                        >
                                            <ShoppingCart className="h-3.5 w-3.5" />
                                            {t('buyer.catalog.actions.addToCart')}
                                        </Button>
                                        {!item.supplierNip && (
                                            <span className="block mt-1 text-[10px] text-muted-foreground">
                                                {t('buyer.catalog.actions.noSupplierNote')}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function CatalogGrid({ items, quickQuantities, setQuickQuantities, onAdd }: CatalogListProps) {
    const { t } = useLocale();
    return (
        <div className="grid grid-cols-1 min-[900px]:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((item) => {
                const minimumQuantity = item.moq ?? 1;
                const currentQty = quickQuantities[item.sku] || minimumQuantity;
                return (
                    <Card
                        key={item.sku}
                        className="overflow-hidden border border-border bg-card hover:shadow-md transition-all flex flex-col justify-between"
                    >
                        <div>
                            <div className="p-3 border-b border-border bg-muted/20 flex items-center justify-between gap-2">
                                <span className="font-mono text-xs font-semibold text-muted-foreground">
                                    {item.sku}
                                </span>
                                <span
                                    className={`text-xs font-mono tabular-nums ${
                                        item.status === 'IN_STOCK'
                                            ? 'text-emerald-700 dark:text-emerald-400'
                                            : item.status === 'LOW_STOCK'
                                                ? 'text-amber-700 dark:text-amber-400'
                                                : 'text-destructive'
                                    }`}
                                >
                                    {item.quantityAvailable.toLocaleString()} {item.unit}
                                </span>
                            </div>

                            <CardContent className="p-3.5 space-y-2.5">
                                <div>
                                    <div className="text-[11px] text-muted-foreground font-medium truncate">
                                        {item.category}
                                        {item.subcategory ? ` › ${item.subcategory}` : ''}
                                    </div>
                                    <Link
                                        to="/buyer/catalog/$sku"
                                        params={{ sku: item.sku }}
                                        search={(prev) => ({
                                            q: prev.q ?? '',
                                            category: prev.category ?? 'ALL',
                                            brand: prev.brand ?? 'ALL',
                                            manufacturer: prev.manufacturer ?? 'ALL',
                                            stock: prev.stock ?? 'ALL',
                                        })}
                                        className="font-bold text-sm text-foreground hover:text-primary transition-colors line-clamp-2 mt-0.5 leading-snug"
                                    >
                                        {item.name}
                                    </Link>
                                </div>

                                {item.manufacturer && (
                                    <div className="text-[11px] text-muted-foreground truncate">
                                        {item.manufacturer}
                                    </div>
                                )}

                                <div className="pt-2 border-t border-border flex items-baseline justify-between">
                                    <div>
                                        <span className="text-lg font-extrabold text-foreground font-mono tabular-nums">
                                            {priceFormatter.format(item.unitPrice)} PLN
                                        </span>
                                        <span className="text-xs text-muted-foreground ml-1">
                                            / {item.unit}
                                        </span>
                                    </div>
                                    <span className="text-[11px] font-mono tabular-nums text-muted-foreground">
                                        MOQ: {item.moq ? `${item.moq} ${item.unit}` : '—'}
                                    </span>
                                </div>
                            </CardContent>
                        </div>

                        <div className="p-3.5 pt-0 space-y-2">
                            <div className="flex items-center gap-2">
                                <QuantityInput
                                    value={currentQty}
                                    minimum={minimumQuantity}
                                    label={t('buyer.catalog.table.qtyLabel', {
                                        name: item.name,
                                        min: minimumQuantity,
                                        unit: item.unit,
                                    })}
                                    onCommit={(value) =>
                                        setQuickQuantities((prev) => ({
                                            ...prev,
                                            [item.sku]: value,
                                        }))
                                    }
                                    className="h-8 text-xs text-center w-24 font-mono tabular-nums bg-background"
                                />
                                <Button
                                    size="sm"
                                    disabled={!item.supplierNip}
                                    title={
                                        !item.supplierNip
                                            ? t('buyer.catalog.actions.cannotAddTitle')
                                            : undefined
                                    }
                                    aria-label={
                                        item.supplierNip
                                            ? t('buyer.catalog.actions.addToCartAria', {
                                                  name: item.name,
                                              })
                                            : t('buyer.catalog.actions.cannotAdd', {
                                                  name: item.name,
                                              })
                                    }
                                    onClick={() => onAdd(item)}
                                    className="h-8 flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-1.5 font-medium"
                                >
                                    <ShoppingCart className="h-3.5 w-3.5" />
                                    {t('buyer.catalog.actions.addToCart')}
                                </Button>
                            </div>
                            {!item.supplierNip && (
                                <p className="text-[10px] text-muted-foreground">
                                    {t('buyer.catalog.actions.noSupplierNote')}
                                </p>
                            )}
                            <Link
                                to="/buyer/catalog/$sku"
                                params={{ sku: item.sku }}
                                search={(prev) => ({
                                    q: prev.q ?? '',
                                    category: prev.category ?? 'ALL',
                                    brand: prev.brand ?? 'ALL',
                                    manufacturer: prev.manufacturer ?? 'ALL',
                                    stock: prev.stock ?? 'ALL',
                                })}
                                className="text-xs text-center block text-muted-foreground hover:text-foreground font-medium py-0.5 transition-colors"
                            >
                                {t('buyer.catalog.card.specLink')}
                            </Link>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}