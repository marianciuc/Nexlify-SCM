import {createFileRoute} from '@tanstack/react-router';
import {Truck, Navigation, Send} from 'lucide-react';
import {useState} from 'react';
import {toast} from 'sonner';

import {InteractiveLogisticsMap} from '@/components/logistics/InteractiveLogisticsMap';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
    useShipmentsQuery,
    useOptimizeRouteMutation,
    INITIAL_SHIPMENTS,
} from '@/hooks/useScmQueries';
import type {Shipment, RouteOptimizationResult} from '@/types/scm-domain';

export const Route = createFileRoute('/logistics/map')({
    component: LogisticsPage,
    staticData: {
        crumb: {
            label: 'Logistics',
        },
    },
});

function LogisticsPage() {
    const {data: shipmentsData = INITIAL_SHIPMENTS} = useShipmentsQuery();
    const optimizeMutation = useOptimizeRouteMutation();
    const [shipments, setShipments] = useState<Shipment[]>(shipmentsData);
    const [calcOrigin, setCalcOrigin] = useState<string>('Warszawa DC');
    const [calcDest, setCalcDest] = useState<string>('Wrocław');
    const [routeResult, setRouteResult] = useState<RouteOptimizationResult | null>(null);

    const handleCalculateRoute = (e: React.FormEvent) => {
        e.preventDefault();
        optimizeMutation.mutate(
            {origin: calcOrigin, destination: calcDest},
            {
                onSuccess: (data) => {
                    setRouteResult(data);
                },
            }
        );
    };

    const handleDispatch = (id: string) => {
        setShipments(shipments.map(s => s.id === id ? {...s, status: 'IN_TRANSIT', eta: '3h 45m remaining'} : s));
        toast.success('Fleet vehicle dispatched with digital e-CMR manifest!');
    };

    return (
        <div className='space-y-6 max-w-7xl mx-auto'>
            {/* Header */}
            <div>
                <h1 className='text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2'>
                    <Truck className='h-6 w-6 text-purple-600' />
                    Logistics, Fleet Dispatch & GraphHopper VRP
                </h1>
                <p className='text-sm text-slate-500'>
                    OpenStreetMap road matrix routing, jsprit vehicle routing problem (VRP) optimization & live tracking
                </p>
            </div>

            {/* GraphHopper Route Calculator Widget */}
            <Card className='border-slate-200/80 dark:border-slate-800 shadow-sm bg-gradient-to-r from-purple-50/30 to-blue-50/20 dark:from-slate-900 dark:to-slate-900'>
                <CardHeader className='pb-3'>
                    <div className='flex items-center justify-between'>
                        <CardTitle className='text-sm font-bold flex items-center gap-2'>
                            <Navigation className='h-4 w-4 text-purple-600' />
                            GraphHopper 9.x Distance Matrix & Route Cost Calculator
                        </CardTitle>
                        <Badge variant='outline' className='text-[10px] bg-purple-50 text-purple-700 border-purple-200'>
                            Heavy Truck (40t) Profile
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCalculateRoute} className='grid gap-4 sm:grid-cols-3 items-end'>
                        <div className='space-y-1'>
                            <Label htmlFor='origin' className='text-xs'>Origin Warehouse / Node</Label>
                            <Input
                                id='origin'
                                value={calcOrigin}
                                onChange={e => setCalcOrigin(e.target.value)}
                                className='h-9 text-xs'
                                required
                            />
                        </div>
                        <div className='space-y-1'>
                            <Label htmlFor='dest' className='text-xs'>Destination Delivery City</Label>
                            <Input
                                id='dest'
                                value={calcDest}
                                onChange={e => setCalcDest(e.target.value)}
                                className='h-9 text-xs'
                                required
                            />
                        </div>
                        <div>
                            <Button type='submit' className='h-9 w-full gap-2 text-xs'>
                                <Navigation className='h-3.5 w-3.5' />
                                Calculate Optimal VRP
                            </Button>
                        </div>
                    </form>

                    {routeResult && (
                        <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-purple-100 dark:border-slate-800'>
                            <div className='bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800'>
                                <span className='text-[11px] text-slate-500 font-medium'>Distance (OSM)</span>
                                <div className='text-base font-bold text-slate-900 dark:text-slate-100'>{routeResult.distanceKm} km</div>
                            </div>
                            <div className='bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800'>
                                <span className='text-[11px] text-slate-500 font-medium'>Estimated Transit</span>
                                <div className='text-base font-bold text-slate-900 dark:text-slate-100'>{routeResult.durationHours} hours</div>
                            </div>
                            <div className='bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800'>
                                <span className='text-[11px] text-slate-500 font-medium'>Fuel & Toll Cost</span>
                                <div className='text-base font-bold text-emerald-600'>{routeResult.costPln.toFixed(2)} PLN</div>
                            </div>
                            <div className='bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800'>
                                <span className='text-[11px] text-slate-500 font-medium'>CO2 Emission</span>
                                <div className='text-base font-bold text-slate-700 dark:text-slate-300'>{routeResult.co2Kg} kg CO2e</div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Interactive Real-Time Logistics Corridor Map */}
            <InteractiveLogisticsMap
                shipments={shipments}
                onSelectRoute={(origin, dest) => {
                    setCalcOrigin(origin);
                    setCalcDest(dest);
                }}
            />

            {/* Active Shipments Table */}
            <Card className='border-slate-200/80 dark:border-slate-800 shadow-sm'>
                <CardHeader className='pb-3'>
                    <CardTitle className='text-base font-bold'>Active Transport Manifests & Shipments</CardTitle>
                </CardHeader>
                <CardContent className='p-0 overflow-x-auto'>
                    <table className='w-full text-sm text-left'>
                        <thead className='text-xs uppercase bg-slate-50 dark:bg-slate-900/60 text-slate-500 border-b border-slate-200/80 dark:border-slate-800'>
                            <tr>
                                <th className='px-4 py-3 font-semibold'>Tracking #</th>
                                <th className='px-4 py-3 font-semibold'>Carrier & Vehicle</th>
                                <th className='px-4 py-3 font-semibold'>Route</th>
                                <th className='px-4 py-3 font-semibold'>Distance</th>
                                <th className='px-4 py-3 font-semibold'>Status</th>
                                <th className='px-4 py-3 font-semibold'>ETA</th>
                                <th className='px-4 py-3 font-semibold text-right'>Dispatch</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-slate-100 dark:divide-slate-800/80'>
                            {shipments.map(shipment => (
                                <tr key={shipment.id} className='hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors'>
                                    <td className='px-4 py-3 font-mono font-bold text-xs text-primary'>
                                        {shipment.trackingNumber}
                                        <div className='text-[11px] text-slate-500 font-normal'>{shipment.orderNumber}</div>
                                    </td>
                                    <td className='px-4 py-3 font-medium text-slate-900 dark:text-slate-100'>
                                        {shipment.carrier}
                                        <div className='text-xs text-slate-500 font-normal'>{shipment.vehicle}</div>
                                    </td>
                                    <td className='px-4 py-3 text-xs text-slate-600 dark:text-slate-400'>
                                        {shipment.origin} → {shipment.destination}
                                    </td>
                                    <td className='px-4 py-3 text-xs font-semibold'>
                                        {shipment.distanceKm} km
                                    </td>
                                    <td className='px-4 py-3'>
                                        <Badge variant='outline' className={`text-[10px] font-bold ${
                                            shipment.status === 'IN_TRANSIT' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                            shipment.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            'bg-slate-100 text-slate-700 border-slate-300'
                                        }`}>
                                            {shipment.status}
                                        </Badge>
                                    </td>
                                    <td className='px-4 py-3 text-xs font-medium text-slate-700 dark:text-slate-300'>
                                        {shipment.eta}
                                    </td>
                                    <td className='px-4 py-3 text-right'>
                                        {shipment.status === 'PLANNED' && (
                                            <Button
                                                variant='outline'
                                                size='sm'
                                                onClick={() => handleDispatch(shipment.id)}
                                                className='h-7 text-xs gap-1 border-purple-200 text-purple-700 hover:bg-purple-50'
                                            >
                                                <Send className='h-3 w-3' />
                                                <span>Dispatch</span>
                                            </Button>
                                        )}
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

export default LogisticsPage;
