import { createFileRoute, Link } from '@tanstack/react-router';
import { Route as RouteIcon, Plus, ArrowRight } from 'lucide-react';
import 'sonner';

import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocale } from '@/hooks/useLocale';
import { INITIAL_ROUTES } from '@/service/logistics/route-data';
import { type TranslationPath } from '@/types/generated-locale';

export const Route = createFileRoute('/logistics/routes/')({
    component: LogisticsRoutesPage,
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

function LogisticsRoutesPage() {
    const { t } = useLocale();
    const routes = INITIAL_ROUTES;

    return (
        <div className="space-y-6 max-w-7xl mx-auto min-w-0">
            <PageHeader
                title={
                    <span className="flex items-center gap-2">
                        <RouteIcon className="h-5 w-5 text-primary" aria-hidden="true" />
                        {t('logistics.routes.title')}
                    </span>
                }
                subtitle={t('logistics.routes.subtitle')}
                actions={
                    <Link to="/logistics/routes/planner" className="w-full sm:w-auto">
                        <Button size="sm" className="gap-2 shadow-xs w-full sm:w-auto font-medium">
                            <Plus className="h-4 w-4" aria-hidden="true" />
                            {t('logistics.routes.openPlanner')}
                        </Button>
                    </Link>
                }
            />

            <Card className="border-border shadow-xs overflow-hidden bg-card">
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-left text-sm min-w-[860px]">
                        <caption className="sr-only">{t('logistics.routes.title')}</caption>
                        <thead className="bg-muted/40 border-b border-border text-muted-foreground whitespace-nowrap text-xs uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="py-3 px-4">{t('logistics.routes.col.code')}</th>
                                <th className="py-3 px-4">{t('logistics.routes.col.corridor')}</th>
                                <th className="py-3 px-4">{t('logistics.routes.col.vehicleDriver')}</th>
                                <th className="py-3 px-4 text-right">{t('logistics.routes.col.distanceTime')}</th>
                                <th className="py-3 px-4 text-right">{t('logistics.routes.col.stops')}</th>
                                <th className="py-3 px-4 text-right">{t('logistics.routes.col.co2')}</th>
                                <th className="py-3 px-4">{t('common.status')}</th>
                                <th className="py-3 px-4 text-right sr-only">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border whitespace-nowrap">
                            {routes.map((r) => (
                                <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                                    <td className="py-3 px-4 font-mono font-bold text-primary">
                                        <Link
                                            to="/logistics/routes/$routeId"
                                            params={{ routeId: r.id }}
                                            className="hover:underline"
                                        >
                                            {r.routeCode}
                                        </Link>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="font-semibold text-foreground">{r.origin}</div>
                                        <div className="text-xs text-muted-foreground">➔ {r.destination}</div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="font-semibold text-foreground">{r.vehicle}</div>
                                        <div className="text-xs text-muted-foreground">{r.driver}</div>
                                    </td>
                                    <td className="py-3 px-4 font-mono text-right">
                                        <div className="font-bold tabular-nums text-foreground">
                                            {r.distanceKm.toLocaleString('ru-RU')}&nbsp;км
                                        </div>
                                        <div className="text-xs tabular-nums text-muted-foreground">
                                            {r.durationHours.toLocaleString('ru-RU')}&nbsp;ч
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 font-mono text-right tabular-nums text-foreground">
                                        {r.stopsCount}
                                    </td>
                                    <td className="py-3 px-4 font-mono text-right tabular-nums text-muted-foreground">
                                        {r.co2EmissionsKg.toLocaleString('ru-RU')}&nbsp;кг
                                    </td>
                                    <td className="py-3 px-4">
                                        <StatusBadge
                                            tone={STATUS_TONE[r.status]}
                                            label={t(STATUS_LABEL_KEY[r.status])}
                                            size="sm"
                                        />
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <Link
                                            to="/logistics/routes/$routeId"
                                            params={{ routeId: r.id }}
                                            aria-label={`${t('logistics.routes.openRoute')} ${r.routeCode}`}
                                        >
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                                            </Button>
                                        </Link>
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

export default LogisticsRoutesPage;
