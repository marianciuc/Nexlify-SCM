import { createFileRoute, Link } from '@tanstack/react-router';
import { TrendingUp, ShoppingCart, Package, Truck, ArrowUpRight, Clock, ShieldCheck } from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { OrderStatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/hooks/useLocale';
import useAuthStore from '@/service/auth/auth-store';
import useEnvironmentStore from '@/service/env/environment-store';
import { type TranslationPath } from '@/types/generated-locale';

export const Route = createFileRoute('/supplier/dashboard')({
  component: DashboardOverviewPage,
  staticData: {
    crumb: {
      label: 'nav.supplier.dashboard',
    },
  },
});

function DashboardOverviewPage() {
  const { userData } = useAuthStore();
  const { currentTenant } = useEnvironmentStore();
  const { t } = useLocale();

  const pipelineSteps: { status: string; count: number; tone: 'info' | 'warning' | 'success' | 'neutral' | 'purple'; labelKey: TranslationPath }[] = [
    { status: 'SUBMITTED', count: 14, tone: 'info', labelKey: 'supplier.dashboard.pipeline.submitted' },
    { status: 'RESERVED', count: 8, tone: 'warning', labelKey: 'supplier.dashboard.pipeline.reserved' },
    { status: 'PAID', count: 12, tone: 'success', labelKey: 'supplier.dashboard.pipeline.paid' },
    { status: 'SHIPPED', count: 5, tone: 'purple', labelKey: 'supplier.dashboard.pipeline.shipped' },
    { status: 'COMPLETED', count: 82, tone: 'neutral', labelKey: 'supplier.dashboard.pipeline.completed' },
  ];

  const recentOrders: { id: string; status: any; customer: string; total: string; destination: string }[] = [
    {
      id: 'ORD-2026-0891',
      customer: 'Baltic Retail Group Sp. z o.o.',
      total: '28,450.00 PLN',
      status: 'SUBMITTED',
      destination: 'Warszawa',
    },
    {
      id: 'ORD-2026-0892',
      customer: 'Silesia Freight & Logistics S.A.',
      total: '14,200.50 PLN',
      status: 'RESERVED',
      destination: 'Katowice',
    },
    {
      id: 'ORD-2026-0893',
      customer: 'Pomerania Foods Sp. k.',
      total: '67,300.00 PLN',
      status: 'SHIPPED',
      destination: 'Gdańsk',
    },
  ];

  const recentShipments: { tracking: string; destination: string; eta: string; status: 'IN_TRANSIT' | 'PLANNED'; carrier: string }[] = [
    { tracking: 'TRK-PL-88219', destination: 'Gdańsk Port', eta: '1h 15m', status: 'IN_TRANSIT', carrier: 'Nexlify Fleet' },
    {
      tracking: 'TRK-PL-88220',
      destination: 'Katowice Hub',
      eta: 'Tomorrow 09:00',
      status: 'PLANNED',
      carrier: 'Baltic Freight',
    },
  ];

  const toneClass: Record<'info' | 'warning' | 'success' | 'neutral' | 'purple', string> = {
    info: 'bg-sky-500',
    warning: 'bg-amber-500',
    success: 'bg-emerald-500',
    neutral: 'bg-muted-foreground/60',
    purple: 'bg-purple-500',
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto min-w-0">
      <PageHeader
        eyebrow={
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t('supplier.dashboard.verifiedSupplier')}
          </span>
        }
        title={t('supplier.dashboard.welcome', { name: userData?.firstName || t('common.administrator') })}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <span>{t('supplier.dashboard.activeContext')}:</span>
            <strong className="text-foreground">{currentTenant.name}</strong>
            <span className="text-muted-foreground">•</span>
            <span className="font-mono text-xs">NIP: {currentTenant.nip}</span>
          </span>
        }
        actions={
          <Link to="/supplier/orders">
            <Button size="sm" className="w-full sm:w-auto gap-1.5 shadow-xs font-medium">
              <Package className="h-4 w-4" />
              {t('supplier.dashboard.openOrdersQueue')}
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t('supplier.dashboard.kpi.gmv')}
          value="245,800 PLN"
          delta={{ value: '+14.2%', direction: 'up', helper: t('supplier.dashboard.kpi.vsLastMonth') }}
          icon={<TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
        />
        <KpiCard
          label={t('supplier.dashboard.kpi.activeOrders')}
          value="22"
          helper="8 in reserve, 5 in transit"
          icon={<ShoppingCart className="h-4 w-4 text-sky-500" />}
        />
        <KpiCard
          label={t('supplier.dashboard.kpi.warehouseFill')}
          value="78.8%"
          helper="9,450 / 12,000 pallets in DC Warsaw"
          icon={<Package className="h-4 w-4 text-amber-500" />}
        />
        <KpiCard
          label={t('supplier.dashboard.kpi.otif')}
          value="98.4%"
          delta={{ value: t('supplier.dashboard.kpi.aboveSla'), direction: 'up', helper: t('supplier.dashboard.kpi.targetSla', { pct: '98.0%' }) }}
          icon={<Truck className="h-4 w-4 text-purple-500" />}
        />
      </div>

      <Card className="border-border shadow-xs bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-foreground">
            {t('supplier.dashboard.pipeline.title')}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {t('supplier.dashboard.pipeline.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {pipelineSteps.map((step) => (
              <div key={step.status} className="p-3 rounded-md border border-border bg-muted/30">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`w-2 h-2 rounded-full ${toneClass[step.tone]}`} aria-hidden="true" />
                  <span className="text-xs font-semibold text-muted-foreground">{t(step.labelKey)}</span>
                </div>
                <div className="text-xl font-bold text-foreground tabular-nums">{step.count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                {t('supplier.dashboard.recentOrders.title')}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {t('supplier.dashboard.recentOrders.subtitle')}
              </CardDescription>
            </div>
            <Link to="/supplier/orders" className="text-xs text-primary hover:underline font-semibold">
              {t('supplier.dashboard.allOrders')}
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <caption className="sr-only">{t('supplier.dashboard.recentOrders.title')}</caption>
              <thead className="bg-muted/30 text-xs text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="text-left py-2 px-4 font-semibold">{t('supplier.orders.table.orderNumber')}</th>
                  <th className="text-left py-2 px-4 font-semibold">{t('supplier.orders.table.status')}</th>
                  <th className="text-right py-2 px-4 font-semibold">{t('supplier.orders.table.total')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-4">
                      <Link
                        to="/supplier/orders/$orderId/fulfillment"
                        params={{ orderId: order.id }}
                        className="font-mono font-bold text-xs text-foreground hover:text-primary"
                      >
                        {order.id}
                      </Link>
                      <div className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[260px]">
                        {order.customer} • {order.destination}
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <OrderStatusBadge status={order.status} t={t as never} size="sm" />
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold tabular-nums text-foreground">
                      {order.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                {t('supplier.dashboard.fleet.title')}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {t('supplier.dashboard.fleet.subtitle')}
              </CardDescription>
            </div>
            <Link to="/logistics/map" className="text-xs text-primary hover:underline font-semibold">
              {t('supplier.dashboard.routeMap')}
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <caption className="sr-only">{t('supplier.dashboard.fleet.title')}</caption>
              <thead className="bg-muted/30 text-xs text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="text-left py-2 px-4 font-semibold">Tracking</th>
                  <th className="text-left py-2 px-4 font-semibold">Status</th>
                  <th className="text-right py-2 px-4 font-semibold">ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentShipments.map((s) => (
                  <tr key={s.tracking} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="font-mono font-bold text-xs text-foreground">{s.tracking}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[260px]">
                        {s.destination} • {s.carrier}
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <Badge
                        variant="outline"
                        className={
                          s.status === 'IN_TRANSIT'
                            ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20 text-[10px]'
                            : 'bg-muted text-muted-foreground text-[10px]'
                        }
                      >
                        {s.status === 'IN_TRANSIT' ? t('supplier.dashboard.fleet.inTransit') : t('supplier.dashboard.fleet.planned')}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-4 text-right text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 font-medium">
                        <Clock className="h-3 w-3" />
                        {s.eta}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  helper,
  delta,
  icon,
}: {
  label: string;
  value: string;
  helper?: string;
  delta?: { value: string; direction: 'up' | 'down'; helper: string };
  icon: React.ReactNode;
}) {
  return (
      <Card className="border-border shadow-xs bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {label}
          </CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground tabular-nums">{value}</div>
          {delta ? (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-medium">
              {delta.direction === 'up' ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowUpRight className="h-3 w-3 rotate-180" />
              )}
              {delta.value}{' '}
              <span className="text-muted-foreground font-normal">{delta.helper}</span>
            </p>
          ) : helper ? (
            <p className="text-xs text-muted-foreground mt-1">{helper}</p>
          ) : null}
        </CardContent>
      </Card>
  );
}

export default DashboardOverviewPage;