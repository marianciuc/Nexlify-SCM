import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronLeft, ShoppingCart } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { QuantityInput } from '@/components/inventory';
import { MoneyDisplay, QuantityDisplay } from '@/components/money-display';
import { PageHeader } from '@/components/page-header';
import { StockStatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useLocale } from '@/hooks/useLocale';
import { useInventoryDataSourceQuery, useInventoryQuery } from '@/hooks/useScmQueries';
import { useCartStore } from '@/service/cart/cart-store';

export const Route = createFileRoute('/buyer/catalog/$sku')({
    component: SkuDetailPage,
    staticData: { crumb: { label: 'nav.buyer.catalog' } },
});

const DEMO_SUPPLIERS: Record<string, { name: string; nip: string; moq: number }> = {
    'SKU-PAL-01': { name: 'Drewnex Palety Sp. z o.o.', nip: '7822910483', moq: 20 },
    'SKU-STR-05': { name: 'PlastChem Industrial Sp. k.', nip: '8942019485', moq: 5 },
    'SKU-HYD-02': { name: 'Baltic Heavy Freight & Tools', nip: '8522619472', moq: 1 },
    'SKU-COL-09': { name: 'Pomerania Foods & Pharma Packaging', nip: '5832918471', moq: 10 },
};

function SkuDetailPage() {
    const { t } = useLocale();
    const { sku } = Route.useParams();
    const search = Route.useSearch();
    const { data: items = [], isLoading, isError } = useInventoryQuery();
    const { data: dataSource = 'demo' } = useInventoryDataSourceQuery();
    const addItemToCart = useCartStore((state) => state.addItem);

    const product = useMemo(() => items.find((item) => item.sku === sku), [items, sku]);
    const demoSupplier = dataSource === 'demo' ? DEMO_SUPPLIERS[sku] : undefined;
    const moq = product?.minOrderQuantity ?? demoSupplier?.moq ?? 1;
    const supplierName = demoSupplier?.name;
    const supplierNip = demoSupplier?.nip;
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (product) setQuantity(product.minOrderQuantity ?? demoSupplier?.moq ?? 1);
    }, [product, demoSupplier?.moq]);

    const handleAddToCart = () => {
        if (!product || !supplierNip) return;
        const minimum = moq ?? 1;
        if (quantity < minimum) {
            toast.error(t('buyer.productDetail.moqError', { min: minimum, unit: product.unit }));
            return;
        }
        addItemToCart(
            {
                sku: product.sku,
                name: product.name,
                category: product.category,
                unitPrice: product.unitPrice,
                moq: minimum,
                unit: product.unit,
                vendorId: supplierNip,
                vendorName: supplierName || '',
                vendorNip: supplierNip,
                weightKg: product.weightKg ?? 0,
                volumeM3: 0,
            },
            quantity
        );
        toast.success(t('buyer.productDetail.addedSuccess', { qty: quantity, unit: product.unit }));
    };

    if (isLoading) {
        return (
            <div role="status" className="p-6 text-sm text-muted-foreground">
                {t('buyer.productDetail.loading')}
            </div>
        );
    }
    if (isError) {
        return (
            <div role="alert" className="p-6 text-sm text-destructive">
                {t('buyer.productDetail.error')}
            </div>
        );
    }
    if (!product) {
        return (
            <div role="alert" className="p-6 text-sm text-muted-foreground">
                {t('buyer.productDetail.notFound', { sku })}
            </div>
        );
    }

    const canOrder = Boolean(supplierNip) && product.status !== 'OUT_OF_STOCK';

    return (
        <div className="mx-auto max-w-5xl space-y-5 min-w-0">
            <div>
                <Link
                    to="/buyer/catalog"
                    search={search}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                    {t('buyer.productDetail.backToCatalog')}
                </Link>
            </div>

            {dataSource === 'demo' && (
                <p
                    role="status"
                    className="border-l-2 border-border bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground"
                >
                    {t('buyer.catalog.demoNotice')}
                </p>
            )}

            <PageHeader
                title={product.name}
                subtitle={<span className="font-mono">{product.sku}</span>}
                actions={<StockStatusBadge status={product.status} t={t} size="md" />}
            />

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] items-start">
                <Card className="border-border bg-card shadow-xs">
                    <CardContent className="p-5 sm:p-6 space-y-5">
                        <span className="text-sm font-semibold text-foreground block">
                            {t('buyer.productDetail.specs')}
                        </span>
                        <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
                            <SpecRow label={t('buyer.productDetail.category')} value={product.category} />
                            <SpecRow label={t('buyer.productDetail.brand')} value={product.brand} />
                            <SpecRow
                                label={t('buyer.productDetail.manufacturer')}
                                value={product.manufacturer}
                            />
                            <SpecRow
                                label={t('buyer.productDetail.dimensions')}
                                value={product.dimensions}
                            />
                            <SpecRow
                                label={t('buyer.productDetail.unitWeight')}
                                value={product.weightKg ? `${product.weightKg} kg` : undefined}
                            />
                            <SpecRow
                                label={t('buyer.productDetail.warehouse')}
                                value={product.warehouse}
                            />
                            {supplierName && (
                                <SpecRow
                                    label={t('buyer.productDetail.supplier')}
                                    value={supplierName}
                                />
                            )}
                        </dl>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card shadow-xs lg:sticky lg:top-20">
                    <CardContent className="p-5 space-y-4">
                        <span className="text-sm font-semibold text-foreground block">
                            {t('buyer.productDetail.purchase')}
                        </span>
                        <div>
                            <MoneyDisplay
                                amount={product.unitPrice}
                                variant="currency"
                                emphasize
                                className="text-2xl"
                            />
                            <div className="text-xs text-muted-foreground mt-0.5">
                                {t('buyer.productDetail.perUnit', { unit: product.unit })}
                            </div>
                        </div>

                        <dl className="grid grid-cols-2 gap-3 rounded-md border border-border p-3">
                            <div className="min-w-0">
                                <dt className="text-xs text-muted-foreground">
                                    {t('buyer.productDetail.available')}
                                </dt>
                                <dd className="mt-0.5">
                                    <QuantityDisplay
                                        amount={product.quantityAvailable}
                                        unit={product.unit}
                                        emphasize
                                    />
                                </dd>
                            </div>
                            <div className="min-w-0">
                                <dt className="text-xs text-muted-foreground">
                                    {t('buyer.productDetail.moq')}
                                </dt>
                                <dd className="mt-0.5">
                                    <QuantityDisplay amount={moq} unit={product.unit} />
                                </dd>
                            </div>
                        </dl>

                        <div className="space-y-1.5">
                            <Label htmlFor="sku-quantity" className="text-sm font-medium text-foreground">
                                {t('buyer.productDetail.qtyLabel')}
                            </Label>
                            <QuantityInput
                                id="sku-quantity"
                                value={quantity}
                                minimum={moq ?? 1}
                                label={t('buyer.productDetail.qtyAriaLabel', {
                                    name: product.name,
                                    min: moq ?? 1,
                                    unit: product.unit,
                                })}
                                onCommit={setQuantity}
                                className="w-full"
                            />
                            {moq && (
                                <p className="text-xs text-muted-foreground">
                                    {t('buyer.productDetail.moqHint', {
                                        min: moq,
                                        unit: product.unit,
                                    })}
                                </p>
                            )}
                        </div>

                        <Button
                            className="w-full gap-2 font-medium"
                            disabled={!canOrder}
                            onClick={handleAddToCart}
                        >
                            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                            {t('buyer.productDetail.addToCart')}
                        </Button>
                        {!supplierNip && (
                            <p className="text-xs text-muted-foreground">
                                {t('buyer.productDetail.noSupplier')}
                            </p>
                        )}
                        {product.status === 'OUT_OF_STOCK' && (
                            <p className="text-xs text-muted-foreground">
                                {t('buyer.productDetail.unavailable')}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function SpecRow({ label, value }: { label: string; value?: string }) {
    return (
        <div className="min-w-0">
            <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                {label}
            </dt>
            <dd className="mt-1 truncate text-sm font-medium text-foreground">{value || '—'}</dd>
        </div>
    );
}

export default SkuDetailPage;
