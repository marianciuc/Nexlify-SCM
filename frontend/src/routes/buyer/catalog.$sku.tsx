import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronLeft, ShoppingCart } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { QuantityInput } from '@/components/inventory';
import { MoneyDisplay } from '@/components/money-display';
import { StockStatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/hooks/useLocale';
import { useInventoryQuery, useInventoryDataSourceQuery } from '@/hooks/useScmQueries';
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
        <div className="mx-auto max-w-5xl space-y-5">
            <Link
                to="/buyer/catalog"
                search={search}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
                <ChevronLeft className="h-4 w-4" />
                {t('buyer.productDetail.backToCatalog')}
            </Link>

            {dataSource === 'demo' && (
                <p
                    role="status"
                    className="border-l-2 border-amber-500 pl-3 py-1 text-sm text-muted-foreground"
                >
                    {t('buyer.catalog.demoNotice')}
                </p>
            )}

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] items-start">
                <Card>
                    <CardHeader className="border-b">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-sm text-muted-foreground">{product.sku}</span>
                            <StockStatusBadge status={product.status} t={t} />
                        </div>
                        <CardTitle className="pt-1 text-xl">{product.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-x-6 gap-y-4 p-5 sm:grid-cols-2">
                        <Detail label={t('buyer.productDetail.category')} value={product.category} />
                        <Detail label={t('buyer.productDetail.brand')} value={product.brand} />
                        <Detail label={t('buyer.productDetail.manufacturer')} value={product.manufacturer} />
                        <Detail label={t('buyer.productDetail.dimensions')} value={product.dimensions} />
                        <Detail
                            label={t('buyer.productDetail.unitWeight')}
                            value={product.weightKg ? `${product.weightKg} kg` : undefined}
                        />
                        <Detail label={t('buyer.productDetail.warehouse')} value={product.warehouse} />
                        <Detail
                            label={t('buyer.productDetail.available')}
                            value={`${product.quantityAvailable.toLocaleString('pl-PL')} ${product.unit}`}
                        />
                        <Detail
                            label={t('buyer.productDetail.moq')}
                            value={moq ? `${moq} ${product.unit}` : undefined}
                        />
                        {supplierName && (
                            <Detail label={t('buyer.productDetail.supplier')} value={supplierName} />
                        )}
                    </CardContent>
                </Card>

                <Card className="lg:sticky lg:top-20">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">{t('buyer.productDetail.purchase')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                        <div className="space-y-1.5">
                            <label
                                htmlFor="sku-quantity"
                                className="text-sm font-medium text-foreground"
                            >
                                {t('buyer.productDetail.qtyLabel')}
                            </label>
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
                            className="w-full gap-2"
                            disabled={!canOrder}
                            onClick={handleAddToCart}
                        >
                            <ShoppingCart className="h-4 w-4" />
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

function Detail({ label, value }: { label: string; value?: string }) {
    return (
        <div className="min-w-0">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                {label}
            </div>
            <div className="mt-1 truncate text-sm font-medium text-foreground">
                {value || '—'}
            </div>
        </div>
    );
}

export default SkuDetailPage;