import { createFileRoute, Link } from '@tanstack/react-router';
import { Truck, Plus, Calendar, Wrench, Fuel, ArrowRight, Search, X } from 'lucide-react';
import { useState, useMemo } from 'react';

import { QuantityDisplay } from '@/components/money-display';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLocale } from '@/hooks/useLocale';
import { useFleetQuery, INITIAL_FLEET } from '@/hooks/useScmQueries';
import { type TranslationPath } from '@/types/generated-locale';

export const Route = createFileRoute('/logistics/fleet/')({
  component: LogisticsFleetPage,
});

type TypeFilter = 'ALL' | 'HEAVY_TRUCK' | 'MEDIUM_VAN';
type VehicleStatus = 'ACTIVE_ON_ROAD' | 'AVAILABLE_DEPOT' | 'IN_MAINTENANCE';

const TYPE_FILTERS: { id: TypeFilter; labelKey: TranslationPath }[] = [
  { id: 'ALL', labelKey: 'logistics.fleet.filter.all' },
  { id: 'HEAVY_TRUCK', labelKey: 'logistics.fleet.filter.heavy' },
  { id: 'MEDIUM_VAN', labelKey: 'logistics.fleet.filter.medium' },
];

const STATUS_TONE: Record<VehicleStatus, 'success' | 'info' | 'warning'> = {
  ACTIVE_ON_ROAD: 'success',
  AVAILABLE_DEPOT: 'info',
  IN_MAINTENANCE: 'warning',
};

const STATUS_LABEL_KEY: Record<VehicleStatus, TranslationPath> = {
  ACTIVE_ON_ROAD: 'logistics.fleet.status.active',
  AVAILABLE_DEPOT: 'logistics.fleet.status.depot',
  IN_MAINTENANCE: 'logistics.fleet.status.maintenance',
};

function LogisticsFleetPage() {
  const { t } = useLocale();
  const { data: vehicles = INITIAL_FLEET } = useFleetQuery();
  const [filterType, setFilterType] = useState<TypeFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const counts = useMemo(() => {
    return {
      ALL: vehicles.length,
      HEAVY_TRUCK: vehicles.filter((v) => v.type === 'HEAVY_TRUCK').length,
      MEDIUM_VAN: vehicles.filter((v) => v.type === 'MEDIUM_VAN').length,
    };
  }, [vehicles]);

  const filtered = useMemo(() => {
    const s = searchQuery.toLowerCase().trim();
    return vehicles.filter((v) => {
      const matchesType = filterType === 'ALL' || v.type === filterType;
      if (!matchesType) return false;
      if (!s) return true;
      return (
        v.plateNumber.toLowerCase().includes(s) ||
        v.makeModel.toLowerCase().includes(s) ||
        v.assignedDriver.toLowerCase().includes(s)
      );
    });
  }, [vehicles, filterType, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: vehicles.length,
      active: vehicles.filter((v) => v.status === 'ACTIVE_ON_ROAD').length,
      depot: vehicles.filter((v) => v.status === 'AVAILABLE_DEPOT').length,
      maintenance: vehicles.filter((v) => v.status === 'IN_MAINTENANCE').length,
      totalPayloadTons: Math.round(vehicles.reduce((acc, v) => acc + v.maxPayloadKg, 0) / 1000),
      totalVolumeM3: Math.round(vehicles.reduce((acc, v) => acc + v.cargoVolumeM3, 0)),
    };
  }, [vehicles]);

  const maxPayloadRef = 24000;
  const hasFilters = filterType !== 'ALL' || searchQuery.length > 0;
  const clearAll = () => {
    setFilterType('ALL');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6 min-w-0 max-w-7xl mx-auto">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            {t('logistics.fleet.title')}
          </span>
        }
        subtitle={t('logistics.fleet.subtitle')}
        actions={
          <Link to="/logistics/fleet/new">
            <Button size="sm" className="gap-2 shadow-xs font-medium w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              {t('logistics.fleet.actions.addVehicle')}
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCell icon={<Truck className="h-4 w-4 text-muted-foreground" />} label={t('logistics.fleet.stats.total')} value={stats.total} sublabel={t('logistics.fleet.stats.totalHelper')} />
        <StatCell icon={null} label={t('logistics.fleet.stats.active')} value={stats.active} sublabel={t('logistics.fleet.stats.activeHelper')} tone="success" />
        <StatCell icon={null} label={t('logistics.fleet.stats.depot')} value={stats.depot} sublabel={t('logistics.fleet.stats.depotHelper')} tone="info" />
        <StatCell icon={<Wrench className="h-4 w-4 text-amber-500" />} label={t('logistics.fleet.stats.maintenance')} value={stats.maintenance} sublabel={t('logistics.fleet.stats.maintenanceHelper')} tone="warning" />
        <StatCell icon={<Fuel className="h-4 w-4 text-muted-foreground" />} label={t('logistics.fleet.stats.payload')} value={`${stats.totalPayloadTons} t`} sublabel={`${stats.totalVolumeM3} m³ ${t('logistics.fleet.stats.volumeHelper')}`} className="col-span-2 sm:col-span-1" />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="flex items-center gap-1 bg-card p-1 rounded-lg border border-border shadow-xs text-xs overflow-x-auto"
          role="group"
          aria-label={t('logistics.fleet.filter.ariaLabel')}
        >
          {TYPE_FILTERS.map((f) => {
            const isActive = filterType === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterType(f.id)}
                aria-pressed={isActive}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <span>{t(f.labelKey)}</span>
                <span
                  className={`tabular-nums px-1.5 rounded text-[10px] font-bold ${
                    isActive ? 'bg-primary-foreground/15 text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {counts[f.id]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder={t('logistics.fleet.searchPlaceholder')}
              aria-label={t('logistics.fleet.searchLabel')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 w-full sm:w-[280px] text-xs bg-background border-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={t('logistics.fleet.searchClear')}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs">
              {t('logistics.fleet.clearAll')}
            </Button>
          )}
        </div>
      </div>

      <Card className="border-border shadow-xs overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[860px]">
            <caption className="sr-only">{t('logistics.fleet.title')}</caption>
            <thead className="bg-muted/40 border-b border-border text-muted-foreground whitespace-nowrap uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">{t('logistics.fleet.table.plate')}</th>
                <th className="py-3 px-4">{t('logistics.fleet.table.model')}</th>
                <th className="py-3 px-4">{t('logistics.fleet.table.type')}</th>
                <th className="py-3 px-4">{t('logistics.fleet.table.payload')}</th>
                <th className="py-3 px-4 text-right">{t('logistics.fleet.table.volume')}</th>
                <th className="py-3 px-4">{t('logistics.fleet.table.driver')}</th>
                <th className="py-3 px-4">{t('logistics.fleet.table.inspection')}</th>
                <th className="py-3 px-4">{t('logistics.fleet.table.status')}</th>
                <th className="py-3 px-4 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-sm text-muted-foreground">
                    <Truck className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" aria-hidden="true" />
                    <p className="font-semibold text-foreground">{t('logistics.fleet.empty.title')}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('logistics.fleet.empty.subtitle')}</p>
                    {hasFilters && (
                      <Button variant="outline" size="sm" onClick={clearAll} className="mt-3 text-xs">
                        {t('logistics.fleet.clearAll')}
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((v) => {
                  const payloadPercent = Math.min(100, Math.round((v.maxPayloadKg / maxPayloadRef) * 100));
                  return (
                    <tr key={v.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-foreground whitespace-nowrap">
                        <Link
                          to="/logistics/fleet/$vehicleId"
                          params={{ vehicleId: v.id }}
                          className="hover:text-primary"
                        >
                          {v.plateNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-semibold text-foreground whitespace-nowrap">
                        {v.makeModel}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-xs text-muted-foreground font-mono">
                        {v.type === 'HEAVY_TRUCK' ? '40t tractor' : '3.5t van'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 w-44">
                          <QuantityDisplay amount={v.maxPayloadKg} unit="kg" className="text-xs whitespace-nowrap" />
                            <div
                              className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden"
                              role="progressbar"
                              aria-valuenow={payloadPercent}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label={t('logistics.fleet.payloadAria', {
                                plate: v.plateNumber,
                                pct: payloadPercent,
                              })}
                            >
                              <div
                                className={`h-full ${v.type === 'HEAVY_TRUCK' ? 'bg-amber-500' : 'bg-sky-500'}`}
                                style={{ width: `${payloadPercent}%` }}
                              />
                            </div>
                          </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold tabular-nums text-right whitespace-nowrap">
                        {v.cargoVolumeM3} m³
                      </td>
                      <td className="py-3 px-4 text-foreground font-medium whitespace-nowrap text-xs">
                        {v.assignedDriver}
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground font-mono whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                          {v.inspectionExpiry}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge tone={STATUS_TONE[v.status]} label={t(STATUS_LABEL_KEY[v.status])} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <Link
                          to="/logistics/fleet/$vehicleId"
                          params={{ vehicleId: v.id }}
                          aria-label={t('logistics.fleet.actions.passportAria', { plate: v.plateNumber })}
                        >
                          <Button variant="ghost" size="xs" className="gap-1">
                            {t('logistics.fleet.actions.passport')}
                            <ArrowRight className="h-3 w-3 rtl:rotate-180" aria-hidden="true" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
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
  sublabel,
  tone,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sublabel?: string;
  tone?: 'success' | 'info' | 'warning';
  className?: string;
}) {
  const toneClass = tone === 'success'
    ? 'border-emerald-500/20 bg-emerald-500/5'
    : tone === 'info'
    ? 'border-sky-500/20 bg-sky-500/5'
    : tone === 'warning'
    ? 'border-amber-500/20 bg-amber-500/5'
    : 'border-border bg-card';
  const toneText = tone === 'success'
    ? 'text-emerald-700 dark:text-emerald-400'
    : tone === 'info'
    ? 'text-sky-700 dark:text-sky-400'
    : tone === 'warning'
    ? 'text-amber-700 dark:text-amber-400'
    : 'text-muted-foreground';
  return (
    <div className={`p-4 rounded-md border shadow-xs ${toneClass} ${className ?? ''}`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${toneText}`}>{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold text-foreground mt-2 font-mono tabular-nums">{value}</div>
      {sublabel && <span className={`text-[10px] ${toneText} font-medium`}>{sublabel}</span>}
    </div>
  );
}

export default LogisticsFleetPage;