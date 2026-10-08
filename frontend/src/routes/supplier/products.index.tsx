import { createFileRoute, Link } from '@tanstack/react-router';
import { Package, Search, Warehouse, Lock, Plus, Filter, X, Building2, Factory, FolderTree } from 'lucide-react';
import { useState, useMemo } from 'react';

import {
    CreateBrandModal,
    CreateManufacturerModal,
    CreateCategoryModal,
    BrandAndManufacturerFilter,
} from '@/components/inventory';
import { MoneyDisplay, QuantityDisplay } from '@/components/money-display';
import { PageHeader } from '@/components/page-header';
import { StockStatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useLocale } from '@/hooks/useLocale';
import {
    useInventoryQuery,
    useReserveStockMutation,
    useCategoriesQuery,
    useBrandsQuery,
    useManufacturersQuery,
    INITIAL_STOCK,
} from '@/hooks/useScmQueries';

export const Route = createFileRoute('/supplier/products/')({
    component: InventoryPage,
});

function InventoryPage() {
    return <InventoryPageContent />;
}

function InventoryPageContent() {
    const { t: tStrict } = useLocale();
    // supplier.products.* keys are not yet in the generated locale types;
    // cast once at the boundary so the rest of the file can stay typed.
    const t = tStrict as unknown as (key: string, opts?: Record<string, unknown>) => string;
    const { data: stock = INITIAL_STOCK } = useInventoryQuery();
    const { data: categories = [] } = useCategoriesQuery();
    const { data: brands = [] } = useBrandsQuery();
    const { data: manufacturers = [] } = useManufacturersQuery();

    const reserveMutation = useReserveStockMutation();

    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedBrandId, setSelectedBrandId] = useState<string>('');
    const [selectedManufacturerId, setSelectedManufacturerId] = useState<string>('');

    const [brandModalOpen, setBrandModalOpen] = useState(false);
    const [manufacturerModalOpen, setManufacturerModalOpen] = useState(false);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);

    const handleSoftReserve = (sku: string) => {
        reserveMutation.mutate({ sku, quantity: 10 });
    };

    const activeBrand = useMemo(() => brands.find((b) => b.id === selectedBrandId), [brands, selectedBrandId]);
    const activeManufacturer = useMemo(
        () => manufacturers.find((m) => m.id === selectedManufacturerId),
        [manufacturers, selectedManufacturerId]
    );

    const categoryFilterOptions = useMemo(() => {
        const list: { id: string; name: string; isSub?: boolean }[] = [
            { id: 'all', name: t('supplier.products.filters.allCategories') },
        ];
        categories.forEach((cat) => {
            list.push({ id: cat.id, name: cat.name });
            cat.children?.forEach((sub) => {
                list.push({ id: sub.id, name: `  ↳ ${sub.name}`, isSub: true });
            });
        });
        return list;
    }, [categories, t]);

    const filteredStock = useMemo(() => {
        const s = search.toLowerCase();
        return stock.filter((item) => {
            const matchesSearch =
                !s ||
                item.sku.toLowerCase().includes(s) ||
                item.name.toLowerCase().includes(s) ||
                item.category.toLowerCase().includes(s) ||
                (item.subcategory && item.subcategory.toLowerCase().includes(s)) ||
                (item.brand && item.brand.toLowerCase().includes(s)) ||
                (item.manufacturer && item.manufacturer.toLowerCase().includes(s));
            if (!matchesSearch) return false;

            if (selectedCategory && selectedCategory !== 'all') {
                const matchesCat =
                    item.categoryId === selectedCategory ||
                    item.subcategoryId === selectedCategory ||
                    item.category.toLowerCase() === selectedCategory.toLowerCase();
                if (!matchesCat) return false;
            }

            if (selectedBrandId) {
                if (item.brandId) {
                    if (item.brandId !== selectedBrandId) return false;
                } else if (activeBrand && item.brand) {
                    if (item.brand.toLowerCase() !== activeBrand.name.toLowerCase()) return false;
                } else {
                    return false;
                }
            }

            if (selectedManufacturerId) {
                if (item.manufacturerId) {
                    if (item.manufacturerId !== selectedManufacturerId) return false;
                } else if (activeManufacturer && item.manufacturer) {
                    if (item.manufacturer.toLowerCase() !== activeManufacturer.name.toLowerCase()) return false;
                } else {
                    return false;
                }
            }
            return true;
        });
    }, [stock, search, selectedCategory, selectedBrandId, selectedManufacturerId, activeBrand, activeManufacturer]);

    const hasActiveFilters =
        Boolean(search) ||
        (selectedCategory && selectedCategory !== 'all') ||
        Boolean(selectedBrandId) ||
        Boolean(selectedManufacturerId);

    const clearAllFilters = () => {
        setSearch('');
        setSelectedCategory('all');
        setSelectedBrandId('');
        setSelectedManufacturerId('');
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto min-w-0">
            <PageHeader
                title={
                    <span className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        {t('supplier.products.title')}
                    </span>
                }
                subtitle={t('supplier.products.subtitle')}
                actions={
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCategoryModalOpen(true)}
                            className="gap-1 border-border font-medium"
                        >
                            <FolderTree className="h-3.5 w-3.5 text-primary" />
                            {t('supplier.products.actions.addCategory')}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setBrandModalOpen(true)}
                            className="gap-1 border-border font-medium"
                        >
                            <Building2 className="h-3.5 w-3.5 text-primary" />
                            {t('supplier.products.actions.addBrand')}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setManufacturerModalOpen(true)}
                            className="gap-1 border-border font-medium"
                        >
                            <Factory className="h-3.5 w-3.5 text-primary" />
                            {t('supplier.products.actions.addManufacturer')}
                        </Button>
                        <Link to="/supplier/products/new">
                            <Button size="sm" className="gap-2 shadow-xs font-semibold">
                                <Plus className="h-4 w-4" />
                                {t('supplier.products.actions.addSku')}
                            </Button>
                        </Link>
                    </>
                }
            />

            <div className="grid gap-4 md:grid-cols-2">
                <CapacityCard
                    icon={<Warehouse className="h-4 w-4 text-primary" />}
                    name="Central DC Warszawa (WH-WAW-01)"
                    description="ul. Przemysłowa 88, Ożarów Mazowiecki"
                    tempLabel={t('supplier.products.warehouse.tempLabel')}
                    tempRange="15°C - 25°C"
                    percent={78.8}
                    used={9450}
                    capacity={12000}
                    usedUnit={t('supplier.products.warehouse.pallets')}
                    tone="primary"
                />
                <CapacityCard
                    icon={<Warehouse className="h-4 w-4 text-muted-foreground" />}
                    name="Port Logistics Hub Szczecin (WH-SZC-02)"
                    description="ul. Gdańska 21, Szczecin"
                    tempLabel={t('supplier.products.warehouse.coldChainLabel')}
                    tempRange="2°C - 8°C"
                    percent={71.8}
                    used={6100}
                    capacity={8500}
                    usedUnit={t('supplier.products.warehouse.pallets')}
                    tone="secondary"
                />
            </div>

            <Card className="border-border shadow-xs bg-card">
                <CardContent className="p-4 space-y-3">
                    <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
                        <div className="relative flex-1 min-w-[240px]">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                                aria-hidden="true"
                            />
                            <Input
                                placeholder={t('supplier.products.filters.searchPlaceholder')}
                                aria-label={t('supplier.products.filters.searchLabel')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 h-9 text-xs bg-background border-input"
                            />
                        </div>

                        <div className="w-full sm:w-60">
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="h-9 text-xs bg-background border-input">
                                    <SelectValue placeholder={t('supplier.products.filters.categoryPlaceholder')} />
                                </SelectTrigger>
                                <SelectContent className="max-h-72">
                                    {categoryFilterOptions.map((opt) => (
                                        <SelectItem key={opt.id} value={opt.id} className="text-xs">
                                            {opt.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <BrandAndManufacturerFilter
                            brands={brands}
                            manufacturers={manufacturers}
                            selectedBrandId={selectedBrandId || 'ALL'}
                            selectedManufacturerId={selectedManufacturerId || 'ALL'}
                            onSelectBrand={(id) => setSelectedBrandId(id === 'ALL' ? '' : id)}
                            onSelectManufacturer={(id) => setSelectedManufacturerId(id === 'ALL' ? '' : id)}
                            onClearAll={clearAllFilters}
                        />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-muted-foreground font-medium flex items-center gap-1">
                                <Filter className="h-3 w-3" />
                                {t('supplier.products.filters.activeLabel')}
                            </span>

                            {search && (
                                <Badge variant="secondary" className="gap-1 text-xs">
                                    {t('supplier.products.filters.searchChip')}: "{search}"
                                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSearch('')} />
                                </Badge>
                            )}

                            {selectedCategory && selectedCategory !== 'all' && (
                                <Badge variant="secondary" className="gap-1 text-xs">
                                    {t('supplier.products.filters.categoryChip')}:{' '}
                                    {categoryFilterOptions.find((c) => c.id === selectedCategory)?.name ||
                                        selectedCategory}
                                    <X
                                        className="h-3 w-3 cursor-pointer"
                                        onClick={() => setSelectedCategory('all')}
                                    />
                                </Badge>
                            )}

                            {activeBrand && (
                                <Badge
                                    variant="outline"
                                    className="gap-1 text-xs bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20"
                                >
                                    {t('supplier.products.filters.brandChip')}: {activeBrand.name}
                                    <X
                                        className="h-3 w-3 cursor-pointer"
                                        onClick={() => setSelectedBrandId('')}
                                    />
                                </Badge>
                            )}

                            {activeManufacturer && (
                                <Badge
                                    variant="outline"
                                    className="gap-1 text-xs bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20"
                                >
                                    {t('supplier.products.filters.manufacturerChip')}: {activeManufacturer.name}
                                    <X
                                        className="h-3 w-3 cursor-pointer"
                                        onClick={() => setSelectedManufacturerId('')}
                                    />
                                </Badge>
                            )}

                            {!hasActiveFilters && (
                                <span className="text-muted-foreground italic">
                                    {t('supplier.products.filters.allItems')}
                                </span>
                            )}

                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearAllFilters}
                                    className="h-6 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                    {t('supplier.products.filters.clearAll')}
                                </Button>
                            )}
                        </div>

                        <div className="text-muted-foreground font-medium">
                            {t('buyer.catalog.found')}:{' '}
                            <span className="font-bold text-foreground tabular-nums">
                                {filteredStock.length}
                            </span>{' '}
                            SKU
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border shadow-xs">
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm text-left min-w-[760px] whitespace-nowrap">
                        <caption className="sr-only">{t('supplier.products.title')}</caption>
                        <thead className="text-xs uppercase bg-muted/40 text-muted-foreground border-b border-border">
                            <tr>
                                <th className="px-4 py-3 font-semibold">
                                    {t('supplier.products.table.skuBrand')}
                                </th>
                                <th className="px-4 py-3 font-semibold">
                                    {t('supplier.products.table.nameClass')}
                                </th>
                                <th className="px-4 py-3 font-semibold">
                                    {t('supplier.products.table.logistics')}
                                </th>
                                <th className="px-4 py-3 font-semibold">{t('supplier.products.table.warehouse')}</th>
                                <th className="px-4 py-3 font-semibold text-right">
                                    {t('supplier.products.table.available')}
                                </th>
                                <th className="px-4 py-3 font-semibold text-right">
                                    {t('supplier.products.table.reserved')}
                                </th>
                                <th className="px-4 py-3 font-semibold text-right">
                                    {t('supplier.products.table.price')}
                                </th>
                                <th className="px-4 py-3 font-semibold text-right">
                                    {t('common.actions')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredStock.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-4 py-12 text-center text-muted-foreground"
                                    >
                                        <Package className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                                        <p className="font-semibold text-foreground">
                                            {t('buyer.catalog.empty.title')}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {t('supplier.products.emptyDesc')}
                                        </p>
                                        {hasActiveFilters && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={clearAllFilters}
                                                className="mt-3 text-xs"
                                            >
                                                {t('buyer.catalog.empty.reset')}
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                filteredStock.map((item) => (
                                    <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                                        <td className="px-4 py-3 font-mono font-bold text-xs">
                                            <Link
                                                to="/supplier/products/$sku"
                                                params={{ sku: item.sku }}
                                                className="hover:underline text-amber-600 block"
                                            >
                                                {item.sku}
                                            </Link>
                                            <StockStatusBadge status={item.status} t={t} size="sm" />
                                        </td>

                                        <td className="px-4 py-3">
                                            <Link
                                                to="/supplier/products/$sku"
                                                params={{ sku: item.sku }}
                                                className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
                                            >
                                                {item.name}
                                            </Link>
                                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                                                <span>{item.category}</span>
                                                {item.subcategory && (
                                                    <>
                                                        <span>›</span>
                                                        <span className="text-foreground font-medium">
                                                            {item.subcategory}
                                                        </span>
                                                    </>
                                                )}
                                                {item.manufacturer && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1">
                                                            <Factory className="h-2.5 w-2.5" />
                                                            {item.manufacturer}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-xs text-muted-foreground">
                                            {item.dimensions ? (
                                                <div className="font-mono text-[11px]">{item.dimensions}</div>
                                            ) : (
                                                <span className="italic">—</span>
                                            )}
                                            <div className="text-[10px] uppercase tracking-wider font-semibold">
                                                {t('supplier.products.table.unit')}: {item.unit}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-xs text-muted-foreground">
                                            {item.warehouse}
                                        </td>

                                        <td className="px-4 py-3 text-right">
                                            <QuantityDisplay
                                                amount={item.quantityAvailable}
                                                unit={item.unit}
                                                emphasize
                                                className="text-emerald-700 dark:text-emerald-400"
                                            />
                                        </td>

                                        <td className="px-4 py-3 text-right">
                                            <QuantityDisplay
                                                amount={item.quantityReserved}
                                                unit={item.unit}
                                                className="text-amber-700 dark:text-amber-400"
                                            />
                                        </td>

                                        <td className="px-4 py-3 text-right">
                                            <MoneyDisplay amount={item.unitPrice} variant="inline" emphasize />
                                        </td>

                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to="/supplier/products/$sku"
                                                    params={{ sku: item.sku }}
                                                    aria-label={t('supplier.products.actions.manageAria', {
                                                        name: item.name,
                                                        sku: item.sku,
                                                    })}
                                                >
                                                    <Button variant="ghost" size="xs">
                                                        {t('supplier.products.actions.manage')}
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="xs"
                                                    aria-label={t('supplier.products.actions.reserveAria', {
                                                        sku: item.sku,
                                                    })}
                                                    onClick={() => handleSoftReserve(item.sku)}
                                                    className="gap-1 border-border"
                                                >
                                                    <Lock className="h-3 w-3 text-amber-600" aria-hidden="true" />
                                                    <span>{t('supplier.products.actions.reserve10')}</span>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            <CreateBrandModal
                open={brandModalOpen}
                onOpenChange={setBrandModalOpen}
                onBrandCreated={(newId) => setSelectedBrandId(newId)}
            />
            <CreateManufacturerModal
                open={manufacturerModalOpen}
                onOpenChange={setManufacturerModalOpen}
                onManufacturerCreated={(newId) => setSelectedManufacturerId(newId)}
            />
            <CreateCategoryModal
                open={categoryModalOpen}
                onOpenChange={setCategoryModalOpen}
                onCategoryCreated={(newId) => setSelectedCategory(newId)}
            />
        </div>
    );
}

function CapacityCard({
    icon,
    name,
    description,
    tempLabel,
    tempRange,
    percent,
    used,
    capacity,
    usedUnit,
    tone,
}: {
    icon: React.ReactNode;
    name: string;
    description: string;
    tempLabel: string;
    tempRange: string;
    percent: number;
    used: number;
    capacity: number;
    usedUnit: string;
    tone: 'primary' | 'secondary';
}) {
    const { t } = useLocale();
    const filledColor = tone === 'primary' ? 'bg-primary' : 'bg-muted-foreground';
    const badgeTone =
        tone === 'primary'
            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
            : 'bg-muted text-foreground border-border';
    return (
        <Card className="border-border shadow-xs">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-sm font-bold flex items-center gap-2 min-w-0">
                            {icon}
                            <span className="truncate">{name}</span>
                        </CardTitle>
                        <Badge variant="outline" className={`${badgeTone} text-xs shrink-0`}>
                            {percent.toFixed(1)}% {t('supplier.products.warehouse.filled')}
                        </Badge>
                    </div>
                <p className="text-xs text-muted-foreground">
                    {description} • {tempLabel}: {tempRange}
                </p>
            </CardHeader>
            <CardContent>
                <div
                    className="w-full bg-muted rounded-full h-2.5 overflow-hidden mt-1"
                    role="progressbar"
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                >
                    <div className={`${filledColor} h-2.5 rounded-full`} style={{ width: `${percent}%` }} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2 font-medium">
                    <span>
                        {t('supplier.products.warehouse.used')}:{' '}
                        <span className="text-foreground font-semibold">
                            {used.toLocaleString('pl-PL')}
                        </span>{' '}
                        {usedUnit}
                    </span>
                    <span>
                        {t('supplier.products.warehouse.capacity')}:{' '}
                        <span className="text-foreground font-semibold">
                            {capacity.toLocaleString('pl-PL')}
                        </span>
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

export default InventoryPage;