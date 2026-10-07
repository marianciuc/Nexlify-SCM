import {zodResolver} from '@hookform/resolvers/zod';
import {createFileRoute} from '@tanstack/react-router';
import {Truck, Navigation, Send, MapPin, Route as RouteIcon, Clock, Leaf, Fuel} from 'lucide-react';
import {useMemo, useState} from 'react';
import {useForm} from 'react-hook-form';
import {toast} from 'sonner';
import {z} from 'zod';

import {FormFieldInput} from '@/components/forms/common';
import {InteractiveLogisticsMap} from '@/components/logistics/InteractiveLogisticsMap';
import {PageHeader} from '@/components/page-header';
import {StatusBadge} from '@/components/status-badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Form} from '@/components/ui/form';
import {useLocale} from '@/hooks/useLocale';
import {
    useShipmentsQuery,
    useOptimizeRouteMutation,
    INITIAL_SHIPMENTS,
} from '@/hooks/useScmQueries';
import { type TranslationPath } from '@/types/generated-locale';
import type {Shipment, RouteOptimizationResult} from '@/types/scm-domain';

type ShipmentStatus = 'PLANNED' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED';

type ShipmentTone = 'info' | 'success' | 'neutral' | 'warning';

const SHIPMENT_TONE: Record<ShipmentStatus, ShipmentTone> = {
    IN_TRANSIT: 'info',
    DELIVERED: 'success',
    PLANNED: 'neutral',
    DISPATCHED: 'warning',
};

const SHIPMENT_LABEL_KEY: Record<ShipmentStatus, TranslationPath> = {
    IN_TRANSIT: 'logistics.map.status.inTransit',
    DELIVERED: 'logistics.map.status.delivered',
    PLANNED: 'logistics.map.status.planned',
    DISPATCHED: 'logistics.map.status.dispatched',
};

export const Route = createFileRoute('/logistics/map')({
    component: LogisticsMapPage,
    staticData: {
        crumb: {
            label: 'nav.logistics.map',
        },
    },
});

function LogisticsMapPage() {
    return <LogisticsMapContent />;
}

function LogisticsMapContent() {
    const {t} = useLocale();
    const {data: shipmentsData = INITIAL_SHIPMENTS} = useShipmentsQuery();
    const optimizeMutation = useOptimizeRouteMutation();
    const [shipments, setShipments] = useState<Shipment[]>(shipmentsData);
    const [routeResult, setRouteResult] = useState<RouteOptimizationResult | null>(null);

    // Validation messages are user-visible, so the schema is rebuilt with the active locale.
    const routeCalcSchema = useMemo(
        () =>
            z.object({
                origin: z.string().min(1, t('logistics.map.calculator.validation.originRequired')),
                destination: z.string().min(1, t('logistics.map.calculator.validation.destinationRequired')),
            }),
        [t]
    );

    type RouteCalcFormData = z.infer<typeof routeCalcSchema>;

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
        setShipments(shipments.map(s => s.id === id ? {...s, status: 'IN_TRANSIT' as const, eta: '3h 45m remaining'} : s));
        toast.success(t('logistics.map.dispatchToast'));
    };

    return (
        <div className='space-y-6 max-w-7xl mx-auto min-w-0'>
            <PageHeader
                title={
                    <span className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-primary" aria-hidden="true" />
                        {t('logistics.map.title')}
                    </span>
                }
                subtitle={t('logistics.map.subtitle')}
            />

            <Card className='border-border shadow-xs bg-card'>
                <CardContent className='p-4 sm:p-6 space-y-4'>
                    <div className='flex items-center justify-between gap-2'>
                        <span className='text-sm font-semibold text-foreground flex items-center gap-2'>
                            <Navigation className='h-4 w-4 text-primary' aria-hidden="true" />
                            {t('logistics.map.calculator.title')}
                        </span>
                    </div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleCalculateRoute)} className='grid gap-3 sm:grid-cols-3 items-end'>
                            <FormFieldInput
                                control={form.control}
                                name='origin'
                                label={t('logistics.map.calculator.originLabel')}
                                className='h-9 text-xs'
                            />
                            <FormFieldInput
                                control={form.control}
                                name='destination'
                                label={t('logistics.map.calculator.destinationLabel')}
                                className='h-9 text-xs'
                            />
                            <div>
                                <Button type='submit' className='h-9 w-full gap-2 text-xs font-medium shadow-xs'>
                                    <Navigation className='h-3.5 w-3.5' aria-hidden="true" />
                                    {t('logistics.map.calculator.submit')}
                                </Button>
                            </div>
                        </form>
                    </Form>

                    {routeResult && (
                        <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-border'>
                            <StatCell icon={<MapPin className='h-4 w-4 text-muted-foreground' />} label={t('logistics.map.calculator.distance')} value={`${routeResult.distanceKm} km`} />
                            <StatCell icon={<Clock className='h-4 w-4 text-muted-foreground' />} label={t('logistics.map.calculator.duration')} value={`${routeResult.durationHours} h`} />
                            <StatCell icon={<Fuel className='h-4 w-4 text-muted-foreground' />} label={t('logistics.map.calculator.cost')} value={`${routeResult.costPln.toFixed(2)} PLN`} tone="success" />
                            <StatCell icon={<Leaf className='h-4 w-4 text-muted-foreground' />} label={t('logistics.map.calculator.co2')} value={`${routeResult.co2Kg} kg`} tone="warning" />
                        </div>
                    )}
                </CardContent>
            </Card>

            <InteractiveLogisticsMap
                shipments={shipments}
                onSelectRoute={(origin, dest) => {
                    form.setValue('origin', origin);
                    form.setValue('destination', dest);
                }}
            />

            <Card className='border-border shadow-xs bg-card'>
                <CardContent className='p-0 overflow-x-auto'>
                    <div className='flex items-center justify-between px-4 py-3 border-b border-border'>
                        <span className='text-sm font-semibold text-foreground flex items-center gap-2'>
                            <RouteIcon className='h-4 w-4 text-primary' aria-hidden="true" />
                            {t('logistics.map.shipments.title')}
                        </span>
                        <span className='text-xs text-muted-foreground'>
                            {t('logistics.map.shipments.count', { count: shipments.length })}
                        </span>
                    </div>
                    <table className='w-full text-sm text-left min-w-[860px]'>
                        <caption className="sr-only">{t('logistics.map.shipments.title')}</caption>
                        <thead className='uppercase bg-muted/40 text-muted-foreground border-b border-border text-[11px] tracking-wider font-semibold'>
                            <tr>
                                <th className='px-4 py-3'>{t('logistics.map.shipments.table.tracking')}</th>
                                <th className='px-4 py-3'>{t('logistics.map.shipments.table.carrier')}</th>
                                <th className='px-4 py-3'>{t('logistics.map.shipments.table.route')}</th>
                                <th className='px-4 py-3 text-right'>{t('logistics.map.shipments.table.distance')}</th>
                                <th className='px-4 py-3'>{t('logistics.map.shipments.table.status')}</th>
                                <th className='px-4 py-3'>{t('logistics.map.shipments.table.eta')}</th>
                                <th className='px-4 py-3 text-right sr-only'>{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-border'>
                            {shipments.map(shipment => (
                                <tr key={shipment.id} className='hover:bg-muted/40 transition-colors'>
                                    <td className='px-4 py-3 font-mono font-bold text-xs text-primary'>
                                        {shipment.trackingNumber}
                                        <div className='text-[11px] text-muted-foreground font-normal font-sans'>{shipment.orderNumber}</div>
                                    </td>
                                    <td className='px-4 py-3 font-medium text-foreground'>
                                        {shipment.carrier}
                                        <div className='text-xs text-muted-foreground font-normal'>{shipment.vehicle}</div>
                                    </td>
                                    <td className='px-4 py-3 text-xs text-muted-foreground whitespace-nowrap'>
                                        {shipment.origin} → {shipment.destination}
                                    </td>
                                    <td className='px-4 py-3 text-xs font-semibold tabular-nums text-foreground text-right whitespace-nowrap'>
                                        {shipment.distanceKm} km
                                    </td>
                                    <td className='px-4 py-3'>
                                        <StatusBadge
                                            tone={SHIPMENT_TONE[shipment.status]}
                                            label={t(SHIPMENT_LABEL_KEY[shipment.status])}
                                            size="sm"
                                        />
                                    </td>
                                    <td className='px-4 py-3 text-xs font-medium text-foreground whitespace-nowrap'>
                                        {shipment.eta}
                                    </td>
                                    <td className='px-4 py-3 text-right'>
                                        {shipment.status === 'PLANNED' && (
                                            <Button
                                                variant='outline'
                                                size='xs'
                                                onClick={() => handleDispatch(shipment.id)}
                                                aria-label={t('logistics.map.shipments.actions.dispatchAria', { tracking: shipment.trackingNumber })}
                                                className='gap-1 font-medium'
                                            >
                                                <Send className='h-3 w-3 rtl:rotate-180' aria-hidden="true" />
                                                <span>{t('logistics.map.shipments.actions.dispatch')}</span>
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

function StatCell({
  icon,
  label,
  value,
  tone,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  tone?: 'success' | 'warning';
  className?: string;
}) {
  const toneClass = tone === 'success'
    ? 'border-emerald-500/20 bg-emerald-500/5'
    : tone === 'warning'
    ? 'border-amber-500/20 bg-amber-500/5'
    : 'border-border bg-card';
  const toneText = tone === 'success'
    ? 'text-emerald-700 dark:text-emerald-400'
    : tone === 'warning'
    ? 'text-amber-700 dark:text-amber-400'
    : 'text-muted-foreground';
  return (
    <div className={`p-3 rounded-md border shadow-xs ${toneClass} ${className ?? ''}`}>
      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-medium ${toneText}`}>{label}</span>
        {icon}
      </div>
      <div className="text-lg font-bold text-foreground mt-2 font-mono tabular-nums">{value}</div>
    </div>
  );
}

export default LogisticsMapPage;