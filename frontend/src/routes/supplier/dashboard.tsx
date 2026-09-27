import {createFileRoute, Link} from '@tanstack/react-router';
import {
    TrendingUp,
    ShoppingCart,
    Package,
    Truck,
    ArrowUpRight,
    Clock,
    CheckCircle2,
    Building2,
    ShieldCheck,
} from 'lucide-react';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import useAuthStore from '@/service/auth/auth-store';
import useEnvironmentStore from '@/service/env/environment-store';

export const Route = createFileRoute('/supplier/dashboard')({
    component: DashboardOverviewPage,
    staticData: {
        crumb: {
            label: 'Overview',
        },
    },
});

function DashboardOverviewPage() {
    const {userData} = useAuthStore();
    const {currentTenant} = useEnvironmentStore();

    const pipelineSteps = [
        {status: 'SUBMITTED', count: 14, color: 'bg-blue-500', label: 'Submitted'},
        {status: 'RESERVED', count: 8, color: 'bg-amber-500', label: 'Stock Reserved'},
        {status: 'PAID', count: 12, color: 'bg-emerald-500', label: 'Paid / Net-30'},
        {status: 'SHIPPED', count: 5, color: 'bg-purple-500', label: 'In Transit'},
        {status: 'COMPLETED', count: 82, color: 'bg-slate-400', label: 'Delivered'},
    ];

    const recentOrders = [
        {id: 'ORD-2026-0891', customer: 'Baltic Retail Group Sp. z o.o.', total: '28,450.00 PLN', status: 'SUBMITTED', destination: 'Warszawa'},
        {id: 'ORD-2026-0892', customer: 'Silesia Freight & Logistics S.A.', total: '14,200.50 PLN', status: 'RESERVED', destination: 'Katowice'},
        {id: 'ORD-2026-0893', customer: 'Pomerania Foods Sp. k.', total: '67,300.00 PLN', status: 'SHIPPED', destination: 'Gdańsk'},
    ];

    const recentShipments = [
        {tracking: 'TRK-PL-88219', destination: 'Gdańsk Port', eta: '1h 15m', status: 'IN_TRANSIT', carrier: 'Nexlify Fleet'},
        {tracking: 'TRK-PL-88220', destination: 'Katowice Hub', eta: 'Tomorrow, 09:00', status: 'PLANNED', carrier: 'Baltic Freight'},
    ];

    return (
        <div className='space-y-6 max-w-7xl mx-auto'>
            {/* Top Welcome Banner */}
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm'>
                <div className='space-y-1'>
                    <div className='flex items-center gap-2'>
                        <h1 className='text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100'>
                            Welcome back, {userData?.firstName || 'Administrator'}!
                        </h1>
                        <Badge variant='outline' className='bg-blue-50 text-blue-700 border-blue-200 text-xs flex items-center gap-1'>
                            <ShieldCheck className='h-3 w-3' />
                            Opaque Auth Active
                        </Badge>
                    </div>
                    <p className='text-sm text-slate-500 flex items-center gap-2'>
                        <Building2 className='h-4 w-4 text-slate-400' />
                        <span>Active Context: <strong className='text-slate-700 dark:text-slate-300'>{currentTenant.name}</strong></span>
                        <span>•</span>
                        <span className='font-mono text-xs'>NIP: {currentTenant.nip}</span>
                    </p>
                </div>
                <div className='flex items-center gap-2 shrink-0'>
                    <Link to='/buyer/orders'>
                        <Button className='gap-1.5 shadow-sm'>
                            <ShoppingCart className='h-4 w-4' />
                            Manage Orders
                        </Button>
                    </Link>
                </div>
            </div>

            {/* 4 Metric Cards */}
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <Card className='border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow transition-shadow'>
                    <CardHeader className='flex flex-row items-center justify-between pb-2'>
                        <CardTitle className='text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                            Monthly Volume (GMV)
                        </CardTitle>
                        <TrendingUp className='h-4 w-4 text-emerald-600' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
                            245,800 PLN
                        </div>
                        <p className='text-xs text-emerald-600 flex items-center gap-1 mt-1 font-medium'>
                            <ArrowUpRight className='h-3 w-3' />
                            +14.2% vs last month
                        </p>
                    </CardContent>
                </Card>

                <Card className='border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow transition-shadow'>
                    <CardHeader className='flex flex-row items-center justify-between pb-2'>
                        <CardTitle className='text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                            Active Orders
                        </CardTitle>
                        <ShoppingCart className='h-4 w-4 text-blue-600' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
                            22 Active
                        </div>
                        <p className='text-xs text-slate-500 mt-1'>
                            8 reserved, 5 in transit
                        </p>
                    </CardContent>
                </Card>

                <Card className='border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow transition-shadow'>
                    <CardHeader className='flex flex-row items-center justify-between pb-2'>
                        <CardTitle className='text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                            Warehouse Fill Rate
                        </CardTitle>
                        <Package className='h-4 w-4 text-amber-600' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
                            78.8%
                        </div>
                        <p className='text-xs text-slate-500 mt-1'>
                            9,450 / 12,000 pallets in DC Warszawa
                        </p>
                    </CardContent>
                </Card>

                <Card className='border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow transition-shadow'>
                    <CardHeader className='flex flex-row items-center justify-between pb-2'>
                        <CardTitle className='text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                            OTIF Delivery Rate
                        </CardTitle>
                        <Truck className='h-4 w-4 text-purple-600' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
                            98.4%
                        </div>
                        <p className='text-xs text-emerald-600 flex items-center gap-1 mt-1 font-medium'>
                            <CheckCircle2 className='h-3 w-3' />
                            Exceeds SLA target (98.0%)
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Pipeline Visualizer */}
            <Card className='border-slate-200/80 dark:border-slate-800 shadow-sm'>
                <CardHeader className='pb-3'>
                    <CardTitle className='text-base font-bold'>End-to-End Order FSM Pipeline</CardTitle>
                    <CardDescription className='text-xs'>
                        Live lifecycle state machine monitoring across microservices (Order, Inventory, Billing, Logistics)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
                        {pipelineSteps.map((step, idx) => (
                            <div key={idx} className='p-3 rounded-lg border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30'>
                                <div className='flex items-center gap-2 mb-1.5'>
                                    <span className={`w-2.5 h-2.5 rounded-full ${step.color}`} />
                                    <span className='text-xs font-semibold text-slate-600 dark:text-slate-400'>{step.label}</span>
                                </div>
                                <div className='text-xl font-bold text-slate-900 dark:text-slate-100'>
                                    {step.count}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Two Column Layout: Recent Orders & Fleet Status */}
            <div className='grid gap-6 md:grid-cols-2'>
                {/* Orders Card */}
                <Card className='border-slate-200/80 dark:border-slate-800 shadow-sm'>
                    <CardHeader className='flex flex-row items-center justify-between pb-3'>
                        <div>
                            <CardTitle className='text-base font-bold'>Recent B2B Orders</CardTitle>
                            <CardDescription className='text-xs'>Active transactions via Order Service</CardDescription>
                        </div>
                        <Link to='/buyer/orders' className='text-xs text-primary hover:underline font-semibold'>
                            View all
                        </Link>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                        {recentOrders.map(order => (
                            <div key={order.id} className='flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors'>
                                <div>
                                    <div className='flex items-center gap-2'>
                                        <span className='font-mono font-bold text-xs text-slate-900 dark:text-slate-100'>{order.id}</span>
                                        <Badge variant='outline' className='text-[10px] py-0 px-1.5 font-bold uppercase'>
                                            {order.status}
                                        </Badge>
                                    </div>
                                    <p className='text-xs text-slate-500 mt-0.5'>{order.customer} • {order.destination}</p>
                                </div>
                                <div className='text-right'>
                                    <span className='font-semibold text-sm text-slate-900 dark:text-slate-100'>{order.total}</span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Fleet Logistics Card */}
                <Card className='border-slate-200/80 dark:border-slate-800 shadow-sm'>
                    <CardHeader className='flex flex-row items-center justify-between pb-3'>
                        <div>
                            <CardTitle className='text-base font-bold'>Logistics & Dispatch</CardTitle>
                            <CardDescription className='text-xs'>GraphHopper 9.x VRP active routes</CardDescription>
                        </div>
                        <Link to='/logistics/map' className='text-xs text-primary hover:underline font-semibold'>
                            View routes
                        </Link>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                        {recentShipments.map(shipment => (
                            <div key={shipment.tracking} className='flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors'>
                                <div>
                                    <div className='flex items-center gap-2'>
                                        <span className='font-mono font-bold text-xs text-slate-900 dark:text-slate-100'>{shipment.tracking}</span>
                                        <Badge variant='outline' className='text-[10px] py-0 px-1.5 font-bold uppercase bg-purple-50 text-purple-700 border-purple-200'>
                                            {shipment.status}
                                        </Badge>
                                    </div>
                                    <p className='text-xs text-slate-500 mt-0.5'>{shipment.destination} • {shipment.carrier}</p>
                                </div>
                                <div className='text-right'>
                                    <div className='flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300 font-medium'>
                                        <Clock className='h-3 w-3 text-slate-400' />
                                        <span>ETA: {shipment.eta}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default DashboardOverviewPage;
