import {createFileRoute, Link, Outlet, useChildMatches} from '@tanstack/react-router';
import {Package, Search, Warehouse, Lock, Plus} from 'lucide-react';
import {useState} from 'react';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {useInventoryQuery, useReserveStockMutation, INITIAL_STOCK} from '@/hooks/useScmQueries';

export const Route = createFileRoute('/supplier/products')({
    component: InventoryPage,
    staticData: {
        crumb: {
            label: 'Inventory',
        },
    },
});

function InventoryPage() {
    const childMatches = useChildMatches();
    if (childMatches.length > 0) {
        return <Outlet />;
    }
    return <InventoryPageContent />;
}

function InventoryPageContent() {
    const {data: stock = INITIAL_STOCK} = useInventoryQuery();
    const reserveMutation = useReserveStockMutation();
    const [search, setSearch] = useState<string>('');

    const handleSoftReserve = (sku: string) => {
        reserveMutation.mutate({sku, quantity: 10});
    };

    const filteredStock = stock.filter(item =>
        item.sku.toLowerCase().includes(search.toLowerCase()) ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className='space-y-6 max-w-7xl mx-auto'>
            {/* Header */}
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                <div>
                    <h1 className='text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2'>
                        <Package className='h-6 w-6 text-amber-600' />
                        Warehouse Inventory & Multi-Stock Management
                    </h1>
                    <p className='text-sm text-slate-500'>
                        Multi-warehouse stock partition, soft/hard reservations with Redisson lock protection
                    </p>
                </div>
                <Link to='/supplier/products/new'>
                    <Button className='bg-amber-600 hover:bg-amber-700 text-white gap-2 shadow-xs text-xs'>
                        <Plus className='h-4 w-4' />
                        Add New SKU
                    </Button>
                </Link>
            </div>

            {/* Warehouse Capacity Overview */}
            <div className='grid gap-4 md:grid-cols-2'>
                <Card className='border-slate-200/80 dark:border-slate-800 shadow-sm'>
                    <CardHeader className='pb-2'>
                        <div className='flex items-center justify-between'>
                            <CardTitle className='text-sm font-bold flex items-center gap-2'>
                                <Warehouse className='h-4 w-4 text-primary' />
                                Central DC Warszawa (WH-WAW-01)
                            </CardTitle>
                            <Badge variant='outline' className='bg-emerald-50 text-emerald-700 border-emerald-200 text-xs'>
                                78.8% Full
                            </Badge>
                        </div>
                        <CardDescription className='text-xs'>
                            ul. Przemysłowa 88, Ożarów Mazowiecki • Temp: 15°C - 25°C
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden mt-1'>
                            <div className='bg-primary h-2.5 rounded-full' style={{width: '78.8%'}} />
                        </div>
                        <div className='flex justify-between text-xs text-slate-500 mt-2 font-medium'>
                            <span>9,450 Utilized Pallets</span>
                            <span>12,000 Capacity</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className='border-slate-200/80 dark:border-slate-800 shadow-sm'>
                    <CardHeader className='pb-2'>
                        <div className='flex items-center justify-between'>
                            <CardTitle className='text-sm font-bold flex items-center gap-2'>
                                <Warehouse className='h-4 w-4 text-purple-600' />
                                Port Logistics Hub Szczecin (WH-SZC-02)
                            </CardTitle>
                            <Badge variant='outline' className='bg-purple-50 text-purple-700 border-purple-200 text-xs'>
                                71.8% Full
                            </Badge>
                        </div>
                        <CardDescription className='text-xs'>
                            ul. Gdańska 21, Szczecin • Cold Zone: 2°C - 8°C
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden mt-1'>
                            <div className='bg-purple-600 h-2.5 rounded-full' style={{width: '71.8%'}} />
                        </div>
                        <div className='flex justify-between text-xs text-slate-500 mt-2 font-medium'>
                            <span>6,100 Utilized Pallets</span>
                            <span>8,500 Capacity</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search Input */}
            <div className='flex items-center gap-2 max-w-sm'>
                <div className='relative w-full'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400' aria-hidden="true" />
                    <Input
                        placeholder='Search SKU, Item name, Category...'
                        aria-label='Search inventory by SKU, Item name, or Category'
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className='pl-9 h-9 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    />
                </div>
            </div>

            {/* Inventory Table */}
            <Card className='border-slate-200/80 dark:border-slate-800 shadow-sm'>
                <CardContent className='p-0 overflow-x-auto'>
                    <table className='w-full text-sm text-left min-w-[720px]'>
                        <thead className='text-xs uppercase bg-slate-50 dark:bg-slate-900/60 text-slate-500 border-b border-slate-200/80 dark:border-slate-800'>
                            <tr>
                                <th className='px-4 py-3 font-semibold'>SKU</th>
                                <th className='px-4 py-3 font-semibold'>Item Name</th>
                                <th className='px-4 py-3 font-semibold'>Warehouse</th>
                                <th className='px-4 py-3 font-semibold text-right'>Available</th>
                                <th className='px-4 py-3 font-semibold text-right'>Reserved</th>
                                <th className='px-4 py-3 font-semibold text-right'>Unit Price</th>
                                <th className='px-4 py-3 font-semibold text-right'>Actions</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-slate-100 dark:divide-slate-800/80'>
                            {filteredStock.map(item => (
                                <tr key={item.id} className='hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors'>
                                    <td className='px-4 py-3 font-mono font-bold text-xs text-primary'>
                                        <Link
                                            to='/supplier/products/$sku'
                                            params={{ sku: item.sku }}
                                            className='hover:underline text-amber-600'
                                        >
                                            {item.sku}
                                        </Link>
                                    </td>
                                    <td className='px-4 py-3 font-medium text-slate-900 dark:text-slate-100'>
                                        {item.name}
                                        <div className='text-xs text-slate-500 font-normal'>{item.category}</div>
                                    </td>
                                    <td className='px-4 py-3 text-xs text-slate-600 dark:text-slate-400'>
                                        {item.warehouse}
                                    </td>
                                    <td className='px-4 py-3 text-right font-bold tabular-nums text-emerald-600'>
                                        {item.quantityAvailable.toLocaleString()}&nbsp;{item.unit}
                                    </td>
                                    <td className='px-4 py-3 text-right font-medium tabular-nums text-amber-600'>
                                        {item.quantityReserved.toLocaleString()}&nbsp;{item.unit}
                                    </td>
                                    <td className='px-4 py-3 text-right font-semibold tabular-nums text-slate-900 dark:text-slate-100'>
                                        {item.unitPrice.toFixed(2)}&nbsp;PLN
                                    </td>
                                    <td className='px-4 py-3 text-right'>
                                        <div className='flex items-center justify-end gap-2'>
                                            <Link
                                                to='/supplier/products/$sku'
                                                params={{ sku: item.sku }}
                                                aria-label={`Manage product ${item.name} SKU ${item.sku}`}
                                            >
                                                <Button variant='ghost' size='sm' className='h-7 text-xs'>
                                                    Manage
                                                </Button>
                                            </Link>
                                            <Button
                                                variant='outline'
                                                size='sm'
                                                aria-label={`Reserve 10 units of ${item.sku}`}
                                                onClick={() => handleSoftReserve(item.sku)}
                                                className='h-7 text-xs gap-1 border-slate-200'
                                            >
                                                <Lock className='h-3 w-3 text-amber-600' aria-hidden="true" />
                                                <span>Reserve 10</span>
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}

export default InventoryPage;
