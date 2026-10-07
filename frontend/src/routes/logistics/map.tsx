import {zodResolver} from '@hookform/resolvers/zod';
import {createFileRoute} from '@tanstack/react-router';
import {Truck, Navigation, Send} from 'lucide-react';
import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {toast} from 'sonner';
import {z} from 'zod';

import {FormFieldInput} from '@/components/forms/common';
import {InteractiveLogisticsMap} from '@/components/logistics/InteractiveLogisticsMap';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Form} from '@/components/ui/form';
import {
    useShipmentsQuery,
    useOptimizeRouteMutation,
    INITIAL_SHIPMENTS,
} from '@/hooks/useScmQueries';
import type {Shipment, RouteOptimizationResult} from '@/types/scm-domain';

const routeCalcSchema = z.object({
    origin: z.string().min(1, 'Origin warehouse is required'),
    destination: z.string().min(1, 'Destination is required'),
});

type RouteCalcFormData = z.infer<typeof routeCalcSchema>;

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
    const [routeResult, setRouteResult] = useState<RouteOptimizationResult | null>(null);

    const form = useForm<RouteCalcFormData>({
        resolver: zodResolver(routeCalcSchema),
        defaultValues: {
            origin: 'Warszawa DC',
            destination: 'Wrocław',
        },
    });

    const handleCalculateRoute = (data: RouteCalcFormData) => {
        optimizeMutation.mutate(
            {origin: data.origin, destination: data.destination},
            {
                onSuccess: (result) => {
                    setRouteResult(result);
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
                <h1 className='text-2xl font-bold tracking-tight text-foreground flex items-center gap-2'>
                    <Truck className='h-6 w-6 text-primary' />
                    Логистика, диспетчеризация флота и оптимизация маршрутов
                </h1>
                <p className='text-sm text-muted-foreground mt-1'>
                    Интерактивная карта трасс, мульти-стоп оптимизация перевозок и онлайн-мониторинг отгрузок.
                </p>
            </div>

            {/* Route Calculator Widget */}
            <Card className='border-border shadow-2xs bg-card'>
                <CardHeader className='pb-3'>
                    <div className='flex items-center justify-between'>
                        <CardTitle className='text-sm font-bold flex items-center gap-2 text-foreground'>
                            <Navigation className='h-4 w-4 text-primary' />
                            Калькулятор расстояний и стоимости маршрута
                        </CardTitle>
                        <Badge variant='outline' className='text-[10px] bg-primary/10 text-primary border-primary/20'>
                            Тяжеловесный грузовой транспорт (HGV)
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleCalculateRoute)} className='grid gap-4 sm:grid-cols-3 items-end'>
                            <FormFieldInput
                                control={form.control}
                                name='origin'
                                label='Склад отправления / Хаб'
                                className='h-9 text-xs'
                            />
                            <FormFieldInput
                                control={form.control}
                                name='destination'
                                label='Город назначения / Терминал'
                                className='h-9 text-xs'
                            />
                            <div>
                                <Button type='submit' className='h-9 w-full gap-2 text-xs font-medium shadow-xs'>
                                    <Navigation className='h-3.5 w-3.5' />
                                    Рассчитать оптимальный маршрут
                                </Button>
                            </div>
                        </form>
                    </Form>

                    {routeResult && (
                        <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border'>
                            <div className='bg-muted/40 p-2.5 rounded-lg border border-border'>
                                <span className='text-[11px] text-muted-foreground font-medium'>Расстояние (OSM)</span>
                                <div className='text-base font-bold text-foreground tabular-nums'>{routeResult.distanceKm} км</div>
                            </div>
                            <div className='bg-muted/40 p-2.5 rounded-lg border border-border'>
                                <span className='text-[11px] text-muted-foreground font-medium'>Время в пути</span>
                                <div className='text-base font-bold text-foreground tabular-nums'>{routeResult.durationHours} ч.</div>
                            </div>
                            <div className='bg-muted/40 p-2.5 rounded-lg border border-border'>
                                <span className='text-[11px] text-muted-foreground font-medium'>Топливо и сборы</span>
                                <div className='text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums'>{routeResult.costPln.toFixed(2)} PLN</div>
                            </div>
                            <div className='bg-muted/40 p-2.5 rounded-lg border border-border'>
                                <span className='text-[11px] text-muted-foreground font-medium'>Выбросы CO2</span>
                                <div className='text-base font-bold text-foreground tabular-nums'>{routeResult.co2Kg} кг CO2e</div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Interactive Real-Time Logistics Corridor Map */}
            <InteractiveLogisticsMap
                shipments={shipments}
                onSelectRoute={(origin, dest) => {
                    form.setValue('origin', origin);
                    form.setValue('destination', dest);
                }}
            />

            {/* Active Shipments Table */}
            <Card className='border-border shadow-2xs bg-card'>
                <CardHeader className='pb-3'>
                    <CardTitle className='text-base font-bold text-foreground'>Активные транспортные манифесты и отправления</CardTitle>
                </CardHeader>
                <CardContent className='p-0 overflow-x-auto'>
                    <table className='w-full text-xs text-left min-w-[760px]'>
                        <thead className='uppercase bg-muted/40 text-muted-foreground border-b border-border font-semibold'>
                            <tr>
                                <th className='px-4 py-3'>Трек-номер</th>
                                <th className='px-4 py-3'>Перевозчик и ТС</th>
                                <th className='px-4 py-3'>Маршрут</th>
                                <th className='px-4 py-3 text-right'>Дистанция</th>
                                <th className='px-4 py-3'>Статус</th>
                                <th className='px-4 py-3'>ETA прибытия</th>
                                <th className='px-4 py-3 text-right'>Отправка</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-border'>
                            {shipments.map(shipment => (
                                <tr key={shipment.id} className='hover:bg-muted/40 transition-colors'>
                                    <td className='px-4 py-3 font-mono font-bold text-xs text-primary'>
                                        {shipment.trackingNumber}
                                        <div className='text-[11px] text-muted-foreground font-normal'>{shipment.orderNumber}</div>
                                    </td>
                                    <td className='px-4 py-3 font-medium text-foreground'>
                                        {shipment.carrier}
                                        <div className='text-xs text-muted-foreground font-normal'>{shipment.vehicle}</div>
                                    </td>
                                    <td className='px-4 py-3 text-xs text-muted-foreground'>
                                        {shipment.origin} → {shipment.destination}
                                    </td>
                                    <td className='px-4 py-3 text-xs font-semibold tabular-nums text-foreground text-right'>
                                        {shipment.distanceKm} км
                                    </td>
                                    <td className='px-4 py-3'>
                                        <Badge variant='outline' className={`text-[10px] font-bold ${
                                            shipment.status === 'IN_TRANSIT' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' :
                                            shipment.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                                            'bg-muted text-muted-foreground border-border'
                                        }`}>
                                            {shipment.status === 'IN_TRANSIT' ? 'В РЕЙСЕ' : shipment.status === 'DELIVERED' ? 'ДОСТАВЛЕНО' : 'ЗАПЛАНИРОВАНО'}
                                        </Badge>
                                    </td>
                                    <td className='px-4 py-3 text-xs font-medium text-foreground'>
                                        {shipment.eta}
                                    </td>
                                    <td className='px-4 py-3 text-right'>
                                        {shipment.status === 'PLANNED' && (
                                            <Button
                                                variant='outline'
                                                size='sm'
                                                onClick={() => handleDispatch(shipment.id)}
                                                className='h-7 text-xs gap-1 font-medium'
                                            >
                                                <Send className='h-3 w-3' />
                                                <span>Отправить</span>
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
