import {createFileRoute, Link, Outlet, useChildMatches} from '@tanstack/react-router';
import {ShoppingCart, Plus, PackageCheck, Trash2} from 'lucide-react';
import {useState, useMemo} from 'react';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
    useOrdersQuery,
    useCreateOrderMutation,
    useUpdateOrderStatusMutation,
    INITIAL_ORDERS,
} from '@/hooks/useScmQueries';
import useEnvironmentStore from '@/service/env/environment-store';
import type {Order, OrderStatus} from '@/types/scm-domain';

export const Route = createFileRoute('/buyer/orders')({
    component: OrdersPage,
    staticData: {
        crumb: {
            label: 'Orders',
        },
    },
});

function OrdersPage() {
    const childMatches = useChildMatches();
    if (childMatches.length > 0) {
        return <Outlet />;
    }
    return <OrdersPageContent />;
}

function OrdersPageContent() {
    const {data: orders = INITIAL_ORDERS} = useOrdersQuery();
    const createOrderMutation = useCreateOrderMutation();
    const updateStatusMutation = useUpdateOrderStatusMutation();

    const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
    const [newCustomer, setNewCustomer] = useState<string>('');
    const [newCity, setNewCity] = useState<string>('Wrocław');
    const [orderItems, setOrderItems] = useState([
        { sku: 'SKU-PLAST-01', name: 'Industrial HDPE Granulate 100', quantity: 100, unitPrice: 42.50 },
        { sku: 'SKU-PAL-01', name: 'Standard Wooden Pallets EPAL-1', quantity: 20, unitPrice: 105.00 },
    ]);

    const totalCalculatedAmount = useMemo(() => {
        return orderItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    }, [orderItems]);

    const {currentTenant} = useEnvironmentStore();

    const handleAddItemRow = () => {
        setOrderItems([
            ...orderItems,
            { sku: 'SKU-STEEL-02', name: 'Galvanized Steel Strip 0.8mm', quantity: 50, unitPrice: 88.00 },
        ]);
    };

    const handleRemoveItemRow = (index: number) => {
        if (orderItems.length <= 1) return;
        setOrderItems(orderItems.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: string, value: string | number) => {
        const updated = [...orderItems];
        const current = updated[index];
        if (current) {
            updated[index] = { ...current, [field]: value };
            setOrderItems(updated);
        }
    };

    const handleCreateOrder = (e: React.FormEvent) => {
        e.preventDefault();
        createOrderMutation.mutate({
            customerName: newCustomer || 'Nexlify Partner Sp. z o.o.',
            totalAmount: totalCalculatedAmount,
            deliveryCity: newCity,
            items: orderItems,
        });
        setShowCreateModal(false);
        setNewCustomer('');
    };

    const handleAdvanceStatus = (orderId: string, currentStatus: OrderStatus) => {
        const nextStatusMap: Record<OrderStatus, OrderStatus> = {
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

        const next = nextStatusMap[currentStatus] || 'COMPLETED';
        updateStatusMutation.mutate({orderId, nextStatus: next});
    };

    const filteredOrders = selectedStatus === 'ALL'
        ? orders
        : orders.filter(o => o.status === selectedStatus);

    const getStatusBadge = (status: Order['status']) => {
        switch (status) {
            case 'SUBMITTED':
                return <Badge variant='outline' className='bg-blue-50 text-blue-700 border-blue-200'>Submitted</Badge>;
            case 'RESERVED':
                return <Badge variant='outline' className='bg-amber-50 text-amber-700 border-amber-200'>Stock Reserved</Badge>;
            case 'PAID':
                return <Badge variant='outline' className='bg-emerald-50 text-emerald-700 border-emerald-200'>Paid (Net-30)</Badge>;
            case 'SHIPPED':
                return <Badge variant='outline' className='bg-purple-50 text-purple-700 border-purple-200'>Dispatched</Badge>;
            case 'COMPLETED':
                return <Badge variant='outline' className='bg-slate-100 text-slate-700 border-slate-300'>Delivered</Badge>;
            default:
                return <Badge variant='outline'>{status}</Badge>;
        }
    };

    return (
        <div className='space-y-6 max-w-7xl mx-auto'>
            {/* Header */}
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                <div>
                    <h1 className='text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2'>
                        <ShoppingCart className='h-6 w-6 text-blue-600' />
                        Order Management (FSM)
                    </h1>
                    <p className='text-sm text-slate-500'>
                        Transactional Outbox & FSM state lifecycle for tenant <strong>{currentTenant.name}</strong>
                    </p>
                </div>
                <Button onClick={() => setShowCreateModal(true)} className='gap-2 shadow-sm'>
                    <Plus className='h-4 w-4' />
                    Create B2B Order
                </Button>
            </div>

            {/* Filter Tabs */}
            <div className='flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/80 dark:border-slate-800'>
                {['ALL', 'SUBMITTED', 'RESERVED', 'PAID', 'SHIPPED', 'COMPLETED'].map(st => (
                    <button
                        key={st}
                        onClick={() => setSelectedStatus(st)}
                        className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-colors ${
                            selectedStatus === st
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    >
                        {st}
                    </button>
                ))}
            </div>

            {/* Orders Table Card */}
            <Card className='border-slate-200/80 dark:border-slate-800 shadow-sm'>
                <CardContent className='p-0 overflow-x-auto'>
                    <table className='w-full text-sm text-left'>
                        <thead className='text-xs uppercase bg-slate-50 dark:bg-slate-900/60 text-slate-500 border-b border-slate-200/80 dark:border-slate-800'>
                            <tr>
                                <th className='px-4 py-3 font-semibold'>Order #</th>
                                <th className='px-4 py-3 font-semibold'>Customer</th>
                                <th className='px-4 py-3 font-semibold'>Destination</th>
                                <th className='px-4 py-3 font-semibold'>Gross Amount</th>
                                <th className='px-4 py-3 font-semibold'>Lifecycle Status</th>
                                <th className='px-4 py-3 font-semibold text-right'>Action</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-slate-100 dark:divide-slate-800/80'>
                            {filteredOrders.map(order => (
                                <tr key={order.id} className='hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors'>
                                    <td className='px-4 py-3 font-mono font-bold text-xs text-primary'>
                                        <Link
                                            to='/buyer/orders/$orderId'
                                            params={{ orderId: order.id }}
                                            className='hover:underline text-emerald-600'
                                        >
                                            {order.orderNumber}
                                        </Link>
                                    </td>
                                    <td className='px-4 py-3 font-medium text-slate-900 dark:text-slate-100'>
                                        {order.customerName}
                                    </td>
                                    <td className='px-4 py-3 text-slate-600 dark:text-slate-400'>
                                        {order.deliveryCity}
                                    </td>
                                    <td className='px-4 py-3 font-semibold text-slate-900 dark:text-slate-100'>
                                        {order.totalAmount.toLocaleString('pl-PL', {minimumFractionDigits: 2})} {order.currency}
                                    </td>
                                    <td className='px-4 py-3'>
                                        {getStatusBadge(order.status)}
                                    </td>
                                    <td className='px-4 py-3 text-right'>
                                        <div className='flex items-center justify-end gap-2'>
                                            <Link
                                                to='/buyer/orders/$orderId'
                                                params={{ orderId: order.id }}
                                            >
                                                <Button variant='ghost' size='sm' className='h-7 text-xs'>
                                                    Details
                                                </Button>
                                            </Link>
                                            {order.status !== 'COMPLETED' && (
                                                <Button
                                                    variant='outline'
                                                    size='sm'
                                                    onClick={() => handleAdvanceStatus(order.id, order.status)}
                                                    className='h-7 text-xs gap-1 border-slate-200'
                                                >
                                                    <span>Advance</span>
                                                    <PackageCheck className='h-3 w-3 text-primary' />
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

            {/* Modal for Creating New Order with Granular Line Items */}
            {showCreateModal && (
                <div
                    role='dialog'
                    aria-modal='true'
                    aria-labelledby='order-modal-title'
                    className='fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto'
                >
                    <div className='bg-white dark:bg-slate-900 rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 my-8'>
                        <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                            <div>
                                <h2 id='order-modal-title' className='text-lg font-bold text-slate-900 dark:text-slate-100'>
                                    Create New B2B Order
                                </h2>
                                <p className="text-xs text-slate-500">Configure delivery destination, customer details, and individual line items</p>
                            </div>
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                                FSM Saga Transaction
                            </Badge>
                        </div>

                        <form onSubmit={handleCreateOrder} className='space-y-4'>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className='space-y-1.5'>
                                    <Label htmlFor='customer' className="text-xs font-semibold">Customer / Ordering Party</Label>
                                    <Input
                                        id='customer'
                                        name='customer'
                                        autoComplete='organization'
                                        placeholder='Silesia Distribution Sp. z o.o.'
                                        value={newCustomer}
                                        onChange={e => setNewCustomer(e.target.value)}
                                        className="text-xs"
                                        required
                                    />
                                </div>

                                <div className='space-y-1.5'>
                                    <Label htmlFor='city' className="text-xs font-semibold">Delivery Destination Ramp</Label>
                                    <Input
                                        id='city'
                                        name='deliveryCity'
                                        autoComplete='address-level2'
                                        placeholder='Wrocław Logistics Center (Ramp 4)'
                                        value={newCity}
                                        onChange={e => setNewCity(e.target.value)}
                                        className="text-xs"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Line Items Management Section */}
                            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Order Line Items ({orderItems.length})
                                    </Label>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        aria-label="Добавить новую позицию в заказ"
                                        onClick={handleAddItemRow}
                                        className="text-xs h-7 gap-1 border-slate-200"
                                    >
                                        <Plus className="h-3 w-3" />
                                        Add Item
                                    </Button>
                                </div>

                                <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto">
                                    <table className="w-full text-xs text-left min-w-[500px]">
                                        <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                                            <tr>
                                                <th className="py-2 px-3">SKU & Item Name</th>
                                                <th className="py-2 px-3 w-24">Quantity</th>
                                                <th className="py-2 px-3 w-28">Unit Price</th>
                                                <th className="py-2 px-3 text-right w-28">Line Total</th>
                                                <th className="py-2 px-2 w-10 text-center"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {orderItems.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/50">
                                                    <td className="py-2 px-3">
                                                        <input
                                                            type="text"
                                                            value={item.name}
                                                            aria-label={`Наименование позиции ${idx + 1}`}
                                                            onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                                                            className="w-full bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1"
                                                            placeholder="Product name"
                                                            required
                                                        />
                                                        <input
                                                            type="text"
                                                            value={item.sku}
                                                            aria-label={`Артикул SKU позиции ${idx + 1}`}
                                                            onChange={(e) => handleItemChange(idx, 'sku', e.target.value)}
                                                            className="w-full bg-transparent font-mono text-2xs text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1"
                                                            placeholder="SKU-XXXX"
                                                            required
                                                        />
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <Input
                                                            type="number"
                                                            min={1}
                                                            value={item.quantity}
                                                            aria-label={`Количество единиц позиции ${idx + 1}`}
                                                            onChange={(e) => handleItemChange(idx, 'quantity', Math.max(1, Number(e.target.value)))}
                                                            className="h-7 text-xs font-mono tabular-nums text-center"
                                                            required
                                                        />
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <div className="flex items-center gap-1">
                                                            <Input
                                                                type="number"
                                                                min={0.1}
                                                                step={0.1}
                                                                value={item.unitPrice}
                                                                aria-label={`Цена за единицу PLN позиции ${idx + 1}`}
                                                                onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                                                                className="h-7 text-xs font-mono tabular-nums text-right"
                                                                required
                                                            />
                                                            <span className="text-2xs text-slate-400">PLN</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-2 px-3 text-right font-mono tabular-nums font-bold text-slate-800 dark:text-slate-200">
                                                        {(item.quantity * item.unitPrice).toFixed(2)}&nbsp;PLN
                                                    </td>
                                                    <td className="py-2 px-2 text-center">
                                                        {orderItems.length > 1 && (
                                                            <button
                                                                type="button"
                                                                aria-label={`Удалить позицию ${item.name || idx + 1}`}
                                                                title={`Удалить позицию ${item.name || idx + 1}`}
                                                                onClick={() => handleRemoveItemRow(idx)}
                                                                className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-mono tabular-nums">
                                    <span className="font-semibold text-slate-600 dark:text-slate-400">Calculated Total Gross Amount:</span>
                                    <span className="text-base font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                                        {totalCalculatedAmount.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
                                    </span>
                                </div>
                            </div>

                            <div className='flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800'>
                                <Button type='button' variant='outline' onClick={() => setShowCreateModal(false)} className="text-xs">
                                    Cancel
                                </Button>
                                <Button type='submit' className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shadow-xs">
                                    <span>Submit B2B Order ({orderItems.length} items)</span>
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default OrdersPage;
