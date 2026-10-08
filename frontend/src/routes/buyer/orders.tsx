import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ShoppingCart, Plus, PackageCheck, Trash2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';

import { FormFieldInput } from '@/components/forms/common';
import { MoneyDisplay } from '@/components/money-display';
import { PageHeader } from '@/components/page-header';
import { OrderStatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocale } from '@/hooks/useLocale';
import {
    useOrdersQuery,
    useCreateOrderMutation,
    useUpdateOrderStatusMutation,
    INITIAL_ORDERS,
} from '@/hooks/useScmQueries';
import useEnvironmentStore from '@/service/env/environment-store';
import type { OrderStatus } from '@/types/scm-domain';

const orderItemSchema = z.object({
    sku: z.string().min(1, 'SKU is required'),
    name: z.string().min(1, 'Product name is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    unitPrice: z.number().min(0.01, 'Unit price must be positive'),
});

const createOrderSchema = z.object({
    customerName: z.string().min(1, 'Customer name is required'),
    deliveryCity: z.string().min(1, 'Delivery city is required'),
    items: z.array(orderItemSchema).min(1, 'At least one item is required'),
});

type CreateOrderFormData = z.infer<typeof createOrderSchema>;

export const Route = createFileRoute('/buyer/orders')({
    component: OrdersPage,
    staticData: { crumb: { label: 'nav.buyer.orders' } },
});

const NEXT_STATUS: Record<OrderStatus, OrderStatus> = {
    DRAFT: 'SUBMITTED',
    SUBMITTED: 'RESERVED',
    RESERVED: 'AWAITING_PAYMENT',
    AWAITING_PAYMENT: 'PAID',
    PAID: 'IN_PROCESSING',
    IN_PROCESSING: 'SHIPPED',
    SHIPPED: 'DELIVERED',
    DELIVERED: 'COMPLETED',
    COMPLETED: 'COMPLETED',
    CANCELLED_OUT_OF_STOCK: 'CANCELLED',
    PAYMENT_FAILED: 'AWAITING_PAYMENT',
    DISPUTED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
};

const FILTER_STATUSES: OrderStatus[] = [
    'SUBMITTED',
    'RESERVED',
    'PAID',
    'SHIPPED',
    'COMPLETED',
];

function OrdersPage() {
    const { t } = useLocale();
    const { data: orders = INITIAL_ORDERS } = useOrdersQuery();
    const createOrderMutation = useCreateOrderMutation();
    const updateStatusMutation = useUpdateOrderStatusMutation();
    const { currentTenant } = useEnvironmentStore();

    const [selectedStatus, setSelectedStatus] = useState<'ALL' | OrderStatus>('ALL');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const form = useForm<CreateOrderFormData>({
        resolver: zodResolver(createOrderSchema),
        defaultValues: {
            customerName: '',
            deliveryCity: 'Wrocław',
            items: [
                { sku: 'SKU-PLAST-01', name: 'Industrial HDPE Granulate 100', quantity: 100, unitPrice: 42.5 },
                { sku: 'SKU-PAL-01', name: 'Standard Wooden Pallets EPAL-1', quantity: 20, unitPrice: 105.0 },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' });
    const watchedItems = form.watch('items') || [];
    const totalCalculatedAmount = useMemo(
        () => watchedItems.reduce((acc, item) => acc + (Number(item?.quantity) || 0) * (Number(item?.unitPrice) || 0), 0),
        [watchedItems]
    );

    const handleAddItemRow = () =>
        append({ sku: 'SKU-STEEL-02', name: 'Galvanized Steel Strip 0.8mm', quantity: 50, unitPrice: 88.0 });

    const handleRemoveItemRow = (index: number) => {
        if (fields.length <= 1) return;
        remove(index);
    };

    const onSubmit = (data: CreateOrderFormData) => {
        createOrderMutation.mutate({
            customerName: data.customerName,
            totalAmount: totalCalculatedAmount,
            deliveryCity: data.deliveryCity,
            items: data.items,
        });
        setShowCreateModal(false);
        form.reset({
            customerName: '',
            deliveryCity: 'Wrocław',
            items: [
                { sku: 'SKU-PLAST-01', name: 'Industrial HDPE Granulate 100', quantity: 100, unitPrice: 42.5 },
                { sku: 'SKU-PAL-01', name: 'Standard Wooden Pallets EPAL-1', quantity: 20, unitPrice: 105.0 },
            ],
        });
    };

    const handleAdvanceStatus = (orderId: string, currentStatus: OrderStatus) => {
        const next = NEXT_STATUS[currentStatus] ?? 'COMPLETED';
        updateStatusMutation.mutate({ orderId, nextStatus: next });
    };

    const filteredOrders = selectedStatus === 'ALL' ? orders : orders.filter((o) => o.status === selectedStatus);

    return (
        <div className="space-y-6 max-w-7xl mx-auto min-w-0">
            <PageHeader
                title={
                    <span className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                        {t('buyer.orders.title')}
                    </span>
                }
                subtitle={t('buyer.orders.subtitle', { tenant: currentTenant.name })}
                actions={
                    <Button
                        size="sm"
                        onClick={() => setShowCreateModal(true)}
                        className="gap-2 shadow-xs w-full sm:w-auto shrink-0 h-8 font-medium"
                    >
                        <Plus className="h-4 w-4" />
                        {t('buyer.orders.createOrder')}
                    </Button>
                }
            />

            <div className="flex flex-wrap items-center gap-1.5 bg-card p-1.5 rounded-lg border border-border shadow-2xs">
                {(['ALL', ...FILTER_STATUSES] as const).map((id) => (
                    <button
                        key={id}
                        onClick={() => setSelectedStatus(id)}
                        className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-colors ${
                            selectedStatus === id
                                ? 'bg-primary text-primary-foreground shadow-2xs'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                    >
                        {t(id === 'ALL' ? 'buyer.orders.filters.all' : `buyer.orders.status.${id}`)}
                    </button>
                ))}
            </div>

            <Card className="border-border shadow-2xs bg-card overflow-hidden">
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-xs text-left min-w-[760px]">
                        <caption className="sr-only">{t('buyer.orders.title')}</caption>
                        <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border uppercase tracking-wider text-[11px] whitespace-nowrap">
                            <tr>
                                <th className="px-4 py-3 font-semibold">{t('buyer.orders.table.number')}</th>
                                <th className="px-4 py-3 font-semibold">{t('buyer.orders.table.customer')}</th>
                                <th className="px-4 py-3 font-semibold">{t('buyer.orders.table.destination')}</th>
                                <th className="px-4 py-3 font-semibold text-right">{t('buyer.orders.table.amount')}</th>
                                <th className="px-4 py-3 font-semibold">{t('buyer.orders.table.status')}</th>
                                <th className="px-4 py-3 font-semibold text-right">{t('buyer.orders.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3 font-mono font-bold text-xs text-foreground whitespace-nowrap">
                                        <Link
                                            to="/buyer/orders/$orderId"
                                            params={{ orderId: order.id }}
                                            className="hover:underline text-primary"
                                        >
                                            {order.orderNumber}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-foreground">
                                        {order.customerName}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                        {order.deliveryCity}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right">
                                        <MoneyDisplay amount={order.totalAmount} variant="inline" emphasize />
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <OrderStatusBadge status={order.status} t={t} />
                                    </td>
                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <Link to="/buyer/orders/$orderId" params={{ orderId: order.id }}>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 px-2.5 text-xs font-medium border-border"
                                                >
                                                    {t('buyer.orders.table.details')}
                                                </Button>
                                            </Link>
                                            {order.status !== 'COMPLETED' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleAdvanceStatus(order.id, order.status)}
                                                    className="h-7 px-2 gap-1 border-border text-xs text-primary hover:bg-primary/10"
                                                    title={t('buyer.orders.table.advanceTitle')}
                                                >
                                                    <span>{t('buyer.orders.table.advance')}</span>
                                                    <PackageCheck className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="border-b pb-3 border-border">
                        <DialogTitle className="text-lg font-bold">
                            {t('buyer.orders.create.title')}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            {t('buyer.orders.create.subtitle')}
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormFieldInput
                                    control={form.control}
                                    name="customerName"
                                    label={t('buyer.orders.create.customerLabel')}
                                    placeholder={t('buyer.orders.create.customerPlaceholder')}
                                    autoComplete="organization"
                                    className="text-xs"
                                />
                                <FormFieldInput
                                    control={form.control}
                                    name="deliveryCity"
                                    label={t('buyer.orders.create.destinationLabel')}
                                    placeholder={t('buyer.orders.create.destinationPlaceholder')}
                                    autoComplete="address-level2"
                                    className="text-xs"
                                />
                            </div>

                            <div className="space-y-2 pt-2 border-t border-border">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-bold text-foreground">
                                        {t('buyer.orders.create.itemsTitle', { count: fields.length })}
                                    </Label>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        aria-label={t('buyer.orders.create.addItem')}
                                        onClick={handleAddItemRow}
                                        className="text-xs h-7 gap-1 border-border"
                                    >
                                        <Plus className="h-3 w-3" />
                                        {t('buyer.orders.create.addItem')}
                                    </Button>
                                </div>

                                <div className="border border-border rounded-lg overflow-x-auto">
                                    <table className="w-full text-xs text-left min-w-[500px]">
                                        <caption className="sr-only">
                                            {t('buyer.orders.create.itemsTitle', { count: fields.length })}
                                        </caption>
                                        <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                                            <tr>
                                                <th className="py-2 px-3">
                                                    {t('buyer.orders.create.itemSku')} / {t('buyer.orders.create.itemName')}
                                                </th>
                                                <th className="py-2 px-3 w-24 text-right">
                                                    {t('buyer.orders.create.qty')}
                                                </th>
                                                <th className="py-2 px-3 w-28 text-right">
                                                    {t('buyer.orders.create.unitPrice')}
                                                </th>
                                                <th className="py-2 px-3 text-right w-28">
                                                    {t('buyer.orders.create.lineTotal')}
                                                </th>
                                                <th className="py-2 px-2 w-10 text-center"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {fields.map((field, idx) => {
                                                const lineTotal =
                                                    (Number(watchedItems[idx]?.quantity) || 0) *
                                                    (Number(watchedItems[idx]?.unitPrice) || 0);
                                                return (
                                                    <tr key={field.id} className="hover:bg-muted/30">
                                                        <td className="py-2 px-3 space-y-1">
                                                            <input
                                                                type="text"
                                                                {...form.register(`items.${idx}.name`)}
                                                                aria-label={`${t('buyer.orders.create.itemName')} ${idx + 1}`}
                                                                className="w-full bg-transparent font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary rounded px-1"
                                                                placeholder={t('buyer.orders.create.itemName')}
                                                            />
                                                            <input
                                                                type="text"
                                                                {...form.register(`items.${idx}.sku`)}
                                                                aria-label={`SKU ${t('buyer.orders.create.itemSku')} ${idx + 1}`}
                                                                className="w-full bg-transparent font-mono text-[11px] text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary rounded px-1"
                                                                placeholder="SKU-XXXX"
                                                            />
                                                        </td>
                                                        <td className="py-2 px-3">
                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                {...form.register(`items.${idx}.quantity`, { valueAsNumber: true })}
                                                                aria-label={`${t('buyer.orders.create.qty')} ${idx + 1}`}
                                                                className="h-7 text-xs font-mono tabular-nums text-right"
                                                            />
                                                        </td>
                                                        <td className="py-2 px-3">
                                                            <div className="flex items-center gap-1 justify-end">
                                                                <Input
                                                                    type="number"
                                                                    min={0.1}
                                                                    step={0.1}
                                                                    {...form.register(`items.${idx}.unitPrice`, { valueAsNumber: true })}
                                                                    aria-label={`${t('buyer.orders.create.unitPrice')} ${idx + 1}`}
                                                                    className="h-7 text-xs font-mono tabular-nums text-right"
                                                                />
                                                                <span className="text-[11px] text-muted-foreground">PLN</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-2 px-3 text-right">
                                                            <MoneyDisplay amount={lineTotal} variant="inline" emphasize />
                                                        </td>
                                                        <td className="py-2 px-2 text-center">
                                                            {fields.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    aria-label={`${t('buyer.orders.create.removeItem')} ${watchedItems[idx]?.name || idx + 1}`}
                                                                    title={`${t('buyer.orders.create.removeItem')} ${watchedItems[idx]?.name || idx + 1}`}
                                                                    onClick={() => handleRemoveItemRow(idx)}
                                                                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex justify-between items-center bg-muted/40 p-3 rounded-lg border border-border text-xs">
                                    <span className="font-semibold text-muted-foreground">
                                        {t('buyer.orders.create.totalLabel')}
                                    </span>
                                    <MoneyDisplay
                                        amount={totalCalculatedAmount}
                                        variant="inline"
                                        emphasize
                                        className="text-base text-primary"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowCreateModal(false)}
                                    className="text-xs"
                                >
                                    {t('buyer.orders.create.cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-1.5 shadow-xs"
                                >
                                    {fields.length > 1
                                        ? t('buyer.orders.create.submit', { count: fields.length })
                                        : t('buyer.orders.create.submitShort')}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default OrdersPage;