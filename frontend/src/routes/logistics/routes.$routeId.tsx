import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';
import { INITIAL_ROUTES } from '@/service/logistics/route-data';
import { type TranslationPath } from '@/types/generated-locale';

export const Route = createFileRoute('/logistics/routes/$routeId')({
    component: RouteDetailPage,
    staticData: { crumb: { label: 'nav.logistics.routeDetail' } },
});

type TripStatus = 'ACTIVE_IN_TRANSIT' | 'PLANNED' | 'COMPLETED';

const STATUS_TONE: Record<TripStatus, 'info' | 'neutral' | 'success'> = {
    ACTIVE_IN_TRANSIT: 'info',
    PLANNED: 'neutral',
    COMPLETED: 'success',
};

const STATUS_LABEL_KEY: Record<TripStatus, TranslationPath> = {
    ACTIVE_IN_TRANSIT: 'logistics.routes.status.inTransit',
    PLANNED: 'logistics.routes.status.planned',
    COMPLETED: 'logistics.routes.status.completed',
};

function RouteDetailPage() {
    const { routeId } = Route.useParams();
    const { t } = useLocale();

    const trip = INITIAL_ROUTES.find(({ id }) => id === routeId);

    if (!trip) {
        return (
            <section className="max-w-3xl space-y-3" role="status">
                <h1 className="text-xl font-semibold">{t('logistics.routeDetail.notFoundTitle')}</h1>
                <p className="text-sm text-muted-foreground">{t('logistics.routeDetail.notFoundBody')}</p>
                <Button asChild variant="outline">
                    <Link to="/logistics/routes">{t('logistics.routeDetail.backToList')}</Link>
                </Button>
            </section>
        );
    }

    const fields = [
        { label: t('logistics.routeDetail.vehicle'), value: trip.vehicle },
        { label: t('logistics.routeDetail.driver'), value: trip.driver },
        {
            label: t('logistics.routeDetail.distance'),
            value: `${trip.distanceKm.toLocaleString('ru-RU')} км`,
        },
        {
            label: t('logistics.routeDetail.duration'),
            value: `${trip.durationHours.toLocaleString('ru-RU')} ч`,
        },
        { label: t('logistics.routeDetail.stops'), value: String(trip.stopsCount) },
        {
            label: t('logistics.routeDetail.co2'),
            value: `${trip.co2EmissionsKg.toLocaleString('ru-RU')} кг`,
        },
    ];

    return (
        <div className="space-y-6 max-w-4xl mx-auto min-w-0">
            <div>
                <Link
                    to="/logistics/routes"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                    {t('logistics.routeDetail.backToList')}
                </Link>
            </div>

            <PageHeader
                title={<span className="font-mono">{trip.routeCode}</span>}
                subtitle={`${trip.origin} → ${trip.destination}`}
                actions={
                    <StatusBadge tone={STATUS_TONE[trip.status]} label={t(STATUS_LABEL_KEY[trip.status])} size="md" />
                }
            />

            <dl className="grid gap-x-8 gap-y-5 border-y border-border py-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {fields.map((f) => (
                    <div key={f.label}>
                        <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {f.label}
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-foreground">{f.value}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}

export default RouteDetailPage;
