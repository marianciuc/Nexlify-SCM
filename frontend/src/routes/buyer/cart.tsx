import { createFileRoute, Link } from '@tanstack/react-router';
import { ShoppingCart, Trash2, Building2, ArrowRight, ShieldCheck, Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { QuantityInput } from '@/components/inventory';
import { MoneyDisplay, QuantityDisplay } from '@/components/money-display';
import { PageHeader } from '@/components/page-header';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/hooks/useLocale';
import { useCartStore } from '@/service/cart/cart-store';

export const Route = createFileRoute('/buyer/cart')({
    component: BuyerCartPage,
    staticData: {
        crumb: {
            label: 'nav.buyer.cart',
        },
    },
});

function BuyerCartPage() {
    const { t } = useLocale();
    const {
        items,
        updateQuantity,
        removeItem,
        clearCart,
        clearVendor,
        getVendorGroups,
        getTotalItemsCount,
        getTotalNet,
        getTotalGross,
    } = useCartStore();

    const [confirmClearCartOpen, setConfirmClearCartOpen] = useState(false);
    const [vendorToClear, setVendorToClear] = useState<{ id: string; name: string } | null>(null);

    const vendorGroups = getVendorGroups();
    const totalItems = getTotalItemsCount();
    const totalNet = getTotalNet();
    const totalGross = getTotalGross();
    const totalVat = Math.round((totalGross - totalNet) * 100) / 100;
    const totalWeightKg = items.reduce((sum, i) => sum + i.weightKg * i.quantity, 0);

    const handleConfirmClearCart = () => {
        clearCart();
        setConfirmClearCartOpen(false);
        toast.success(t('buyer.cart.confirmClear.success'));
    };

    const handleConfirmClearVendor = () => {
        if (vendorToClear) {
            clearVendor(vendorToClear.id);
            toast.success(t('buyer.cart.vendor.removedSuccess', { name: vendorToClear.name }));
            setVendorToClear(null);
        }
    };

    return (
        <div className="space-y-6 min-w-0">
            <PageHeader
                title={t('buyer.cart.title')}
                subtitle={t('buyer.cart.subtitle')}
                actions={
                    items.length > 0 ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setConfirmClearCartOpen(true)}
                            className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 gap-1.5 shrink-0 w-full sm:w-auto"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            {t('buyer.cart.clearAll')}
                        </Button>
                    ) : null
                }
            />

            {items.length === 0 ? (
                <Card className="border-dashed border-2 border-border p-12 text-center bg-card">
                    <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
                        <ShoppingCart className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                        {t('buyer.cart.empty.title')}
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-6">
                        {t('buyer.cart.empty.description')}
                    </p>
                    <Link
                        to="/buyer/catalog"
                        search={{ q: '', category: 'ALL', brand: 'ALL', manufacturer: 'ALL', stock: 'ALL' }}
                    >
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                            {t('buyer.cart.empty.goToCatalog')} <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {vendorGroups.map((group) => (
                            <Card key={group.vendorId} className="border-border overflow-hidden shadow-2xs bg-card">
                                <CardHeader className="bg-muted/40 border-b border-border py-3.5 px-5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <Building2 className="h-4 w-4 text-primary shrink-0" />
                                            <div className="min-w-0">
                                                <span className="font-semibold text-sm text-foreground truncate block">
                                                    {group.vendorName}
                                                </span>
                                                <span className="font-mono text-xs text-muted-foreground">
                                                    NIP: {group.vendorNip}
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                            onClick={() =>
                                                setVendorToClear({ id: group.vendorId, name: group.vendorName })
                                            }
                                            aria-label={t('buyer.cart.vendor.remove', { name: group.vendorName })}
                                            title={t('buyer.cart.vendor.remove', { name: group.vendorName })}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-0">
                                    <div className="divide-y divide-border">
                                        {group.items.map((item) => {
                                            const minimum = item.moq;
                                            const atMin = item.quantity <= item.moq;
                                            return (
                                                <div
                                                    key={item.sku}
                                                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                                                >
                                                    <div className="space-y-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground">
                                                                {item.sku}
                                                            </span>
                                                            {item.category && (
                                                                <span className="text-[11px] text-muted-foreground">
                                                                    {item.category}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <Link
                                                            to="/buyer/catalog/$sku"
                                                            params={{ sku: item.sku }}
                                                            search={{
                                                                q: '',
                                                                category: 'ALL',
                                                                brand: 'ALL',
                                                                manufacturer: 'ALL',
                                                                stock: 'ALL',
                                                            }}
                                                            className="text-sm font-semibold text-foreground hover:text-primary transition-colors block"
                                                        >
                                                            {item.name}
                                                        </Link>
                                                        <div className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap">
                                                            <span>
                                                                {t('buyer.cart.item.priceLabel')}:{' '}
                                                                <MoneyDisplay
                                                                    amount={item.unitPrice}
                                                                    variant="inline"
                                                                    className="text-foreground"
                                                                />
                                                            </span>
                                                            <span>
                                                                {t('buyer.cart.item.batchWeight')}:{' '}
                                                                <QuantityDisplay
                                                                    amount={item.weightKg * item.quantity}
                                                                    unit="kg"
                                                                />
                                                            </span>
                                                            <span className="font-medium text-foreground">
                                                                {t('buyer.cart.item.moq')}: {item.moq} {item.unit}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between sm:justify-end gap-4">
                                                        <div className="flex items-center border border-input rounded-lg overflow-hidden bg-background">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                disabled={atMin}
                                                                className="h-8 w-8 rounded-none disabled:opacity-30"
                                                                onClick={() =>
                                                                    updateQuantity(
                                                                        item.sku,
                                                                        Math.max(item.moq, item.quantity - 1)
                                                                    )
                                                                }
                                                                aria-label={t('buyer.cart.item.decreaseAria', { name: item.name })}
                                                                title={
                                                                    atMin
                                                                        ? t('buyer.cart.item.decreaseMinTitle', {
                                                                              min: item.moq,
                                                                              unit: item.unit,
                                                                          })
                                                                        : t('buyer.cart.item.decreaseTitle')
                                                                }
                                                            >
                                                                <Minus className="h-3 w-3" />
                                                            </Button>
                                                            <QuantityInput
                                                                value={item.quantity}
                                                                minimum={item.moq}
                                                                label={t('buyer.cart.item.qtyLabel', {
                                                                    name: item.name,
                                                                    min: minimum,
                                                                    unit: item.unit,
                                                                })}
                                                                onCommit={(value) => updateQuantity(item.sku, value)}
                                                                className="h-8 w-16 text-center font-mono text-xs border-0 focus-visible:ring-0 tabular-nums"
                                                            />
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-none"
                                                                onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                                                                aria-label={t('buyer.cart.item.increaseAria', { name: item.name })}
                                                                title={t('buyer.cart.item.increaseTitle')}
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                            </Button>
                                                        </div>

                                                        <div className="text-right min-w-[100px]">
                                                            <MoneyDisplay
                                                                amount={item.unitPrice * item.quantity}
                                                                variant="inline"
                                                                emphasize
                                                                className="text-sm"
                                                            />
                                                            <div className="text-[11px] text-muted-foreground">
                                                                {t('buyer.cart.item.subtotal')}
                                                            </div>
                                                        </div>

                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                            onClick={() => removeItem(item.sku)}
                                                            aria-label={t('buyer.cart.item.removeAria', { name: item.name })}
                                                            title={t('buyer.cart.item.removeTitle')}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="bg-muted/30 p-4 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs">
                                        <div className="text-muted-foreground">
                                            {t('buyer.cart.vendorFooter.shipmentWeight')}:{' '}
                                            <QuantityDisplay
                                                amount={group.totalWeightKg}
                                                unit="kg"
                                                className="text-foreground font-semibold"
                                            />
                                        </div>
                                        <div className="flex items-center gap-4 flex-wrap">
                                            <span className="text-muted-foreground">
                                                {t('buyer.cart.vendorFooter.net')}:{' '}
                                                <MoneyDisplay
                                                    amount={group.subtotalNet}
                                                    variant="inline"
                                                    className="font-semibold"
                                                />
                                            </span>
                                            <span className="text-muted-foreground">
                                                {t('buyer.cart.vendorFooter.vat')}:{' '}
                                                <MoneyDisplay
                                                    amount={group.vatAmount}
                                                    variant="inline"
                                                    className="font-semibold"
                                                />
                                            </span>
                                            <span className="text-sm font-bold text-foreground">
                                                {t('buyer.cart.vendorFooter.gross')}:{' '}
                                                <MoneyDisplay
                                                    amount={group.grossAmount}
                                                    variant="inline"
                                                    emphasize
                                                />
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="space-y-6">
                        <Card className="sticky top-6 border-border shadow-md bg-card">
                            <CardHeader className="bg-muted/40 border-b border-border py-4">
                                <CardTitle className="text-base font-semibold">
                                    {t('buyer.cart.summary.title')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-5">
                                <dl className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">
                                            {t('buyer.cart.summary.lines')}
                                        </dt>
                                        <dd className="font-semibold text-foreground">
                                            {t('buyer.cart.summary.linesValue', { count: items.length })}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">
                                            {t('buyer.cart.summary.totalUnits')}
                                        </dt>
                                        <dd className="font-semibold text-foreground">
                                            <QuantityDisplay
                                                amount={totalItems}
                                                unit={t('buyer.cart.summary.unitsShort')}
                                            />
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">
                                            {t('buyer.cart.summary.cargoWeight')}
                                        </dt>
                                        <dd className="font-semibold text-foreground">
                                            {t('buyer.cart.summary.weightValue', {
                                                tons: (totalWeightKg / 1000).toFixed(2),
                                                kg: Math.round(totalWeightKg).toLocaleString('pl-PL'),
                                            })}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">
                                            {t('buyer.cart.summary.shipments')}
                                        </dt>
                                        <dd className="font-semibold text-foreground">
                                            {t('buyer.cart.summary.shipmentsValue', { count: vendorGroups.length })}
                                        </dd>
                                    </div>
                                </dl>

                                <div className="bg-muted/30 p-4 rounded-xl border border-border space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            {t('buyer.cart.summary.net')}
                                        </span>
                                        <MoneyDisplay
                                            amount={totalNet}
                                            variant="inline"
                                            className="font-semibold"
                                        />
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            {t('buyer.cart.summary.vat')}
                                        </span>
                                        <MoneyDisplay
                                            amount={totalVat}
                                            variant="inline"
                                            className="font-semibold"
                                        />
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-border font-bold text-base text-foreground">
                                        <span>{t('buyer.cart.summary.total')}</span>
                                        <MoneyDisplay
                                            amount={totalGross}
                                            variant="inline"
                                            emphasize
                                            className="text-primary"
                                        />
                                    </div>
                                </div>

                                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-xs text-primary flex items-start gap-2">
                                    <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                                    <span>{t('buyer.cart.summary.credit')}</span>
                                </div>

                                <Link to="/buyer/checkout" className="block">
                                    <Button
                                        size="lg"
                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
                                    >
                                        {t('buyer.cart.summary.checkout')} <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>

                                <Link
                                    to="/buyer/catalog"
                                    search={{
                                        q: '',
                                        category: 'ALL',
                                        brand: 'ALL',
                                        manufacturer: 'ALL',
                                        stock: 'ALL',
                                    }}
                                    className="block text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {t('buyer.cart.summary.backToCatalog')}
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            <AlertDialog open={confirmClearCartOpen} onOpenChange={setConfirmClearCartOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('buyer.cart.confirmClear.title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('buyer.cart.confirmClear.description')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('buyer.cart.confirmClear.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmClearCart}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {t('buyer.cart.confirmClear.confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={vendorToClear !== null}
                onOpenChange={(open) => !open && setVendorToClear(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('buyer.cart.vendor.removeVendorConfirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('buyer.cart.vendor.removeVendorConfirmDesc', {
                                name: vendorToClear?.name ?? '',
                            })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('buyer.cart.vendor.removeVendorConfirmCancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmClearVendor}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {t('buyer.cart.vendor.removeVendorConfirmAction')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}