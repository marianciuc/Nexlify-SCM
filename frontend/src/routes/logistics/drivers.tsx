import { createFileRoute } from '@tanstack/react-router';
import { Users, Truck, Search, X, Clock, ShieldAlert } from 'lucide-react';
import { useState, useMemo } from 'react';

import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLocale } from '@/hooks/useLocale';
import { type TranslationPath } from '@/types/generated-locale';

export const Route = createFileRoute('/logistics/drivers')({
  component: LogisticsDriversPage,
  staticData: {
    crumb: {
      label: 'nav.logistics.drivers',
    },
  },
});

interface Driver {
  id: string;
  name: string;
  licenseCategory: string;
  phone: string;
  assignedTruck: string;
  drivingHoursToday: string;
  restHoursRemaining: string;
  adrCertified: boolean;
  status: 'ON_ROUTE' | 'RESTING' | 'OFF_SHIFT';
}

const DRIVERS_DATA: Driver[] = [
  {
    id: 'drv-01',
    name: 'Tomasz Lewandowski',
    licenseCategory: 'C + E (Code 95)',
    phone: '+48 601 234 501',
    assignedTruck: 'WI 49102 (Scania R450)',
    drivingHoursToday: '3h 45m / 9h max',
    restHoursRemaining: '11h mandatory rest completed',
    adrCertified: true,
    status: 'ON_ROUTE',
  },
  {
    id: 'drv-02',
    name: 'Paweł Kamiński',
    licenseCategory: 'C + E (Code 95)',
    phone: '+48 602 118 332',
    assignedTruck: 'ZS 8831A (Volvo FH)',
    drivingHoursToday: '0h (Shift starts 14:00)',
    restHoursRemaining: 'Fully rested',
    adrCertified: true,
    status: 'OFF_SHIFT',
  },
  {
    id: 'drv-03',
    name: 'Marek Szymański',
    licenseCategory: 'C + E (Code 95)',
    phone: '+48 603 992 814',
    assignedTruck: 'WI 30219 (MAN TGX)',
    drivingHoursToday: '4h 30m',
    restHoursRemaining: 'Taking 45m tachograph pause',
    adrCertified: false,
    status: 'RESTING',
  },
];

type DriverStatus = Driver['status'];

const STATUS_FILTERS: { id: 'ALL' | DriverStatus; labelKey: TranslationPath }[] = [
  { id: 'ALL', labelKey: 'logistics.drivers.filter.all' },
  { id: 'ON_ROUTE', labelKey: 'logistics.drivers.status.onRoute' },
  { id: 'RESTING', labelKey: 'logistics.drivers.status.resting' },
  { id: 'OFF_SHIFT', labelKey: 'logistics.drivers.status.offShift' },
];

const STATUS_TONE: Record<DriverStatus, 'success' | 'warning' | 'neutral'> = {
  ON_ROUTE: 'success',
  RESTING: 'warning',
  OFF_SHIFT: 'neutral',
};

const STATUS_LABEL_KEY: Record<DriverStatus, TranslationPath> = {
  ON_ROUTE: 'logistics.drivers.status.onRoute',
  RESTING: 'logistics.drivers.status.resting',
  OFF_SHIFT: 'logistics.drivers.status.offShift',
};

function LogisticsDriversPage() {
  return <LogisticsDriversContent />;
}

function LogisticsDriversContent() {
  const { t } = useLocale();
  const [drivers] = useState<Driver[]>(DRIVERS_DATA);
  const [filterStatus, setFilterStatus] = useState<'ALL' | DriverStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const counts = useMemo(() => {
    return {
      ALL: drivers.length,
      ON_ROUTE: drivers.filter((d) => d.status === 'ON_ROUTE').length,
      RESTING: drivers.filter((d) => d.status === 'RESTING').length,
      OFF_SHIFT: drivers.filter((d) => d.status === 'OFF_SHIFT').length,
    };
  }, [drivers]);

  const filtered = useMemo(() => {
    const s = searchQuery.toLowerCase().trim();
    return drivers.filter((d) => {
      if (filterStatus !== 'ALL' && d.status !== filterStatus) return false;
      if (!s) return true;
      return (
        d.name.toLowerCase().includes(s) ||
        d.licenseCategory.toLowerCase().includes(s) ||
        d.assignedTruck.toLowerCase().includes(s)
      );
    });
  }, [drivers, filterStatus, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: drivers.length,
      onRoute: drivers.filter((d) => d.status === 'ON_ROUTE').length,
      resting: drivers.filter((d) => d.status === 'RESTING').length,
      adr: drivers.filter((d) => d.adrCertified).length,
    };
  }, [drivers]);

  const hasFilters = filterStatus !== 'ALL' || searchQuery.length > 0;
  const clearAll = () => {
    setFilterStatus('ALL');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto min-w-0">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" aria-hidden="true" />
            {t('logistics.drivers.title')}
          </span>
        }
        subtitle={t('logistics.drivers.subtitle')}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCell icon={<Users className="h-4 w-4 text-muted-foreground" />} label={t('logistics.drivers.stats.total')} value={stats.total} sublabel={t('logistics.drivers.stats.totalHelper')} />
        <StatCell icon={<Truck className="h-4 w-4 text-emerald-600" />} label={t('logistics.drivers.stats.onRoute')} value={stats.onRoute} sublabel={t('logistics.drivers.stats.onRouteHelper')} tone="success" />
        <StatCell icon={<Clock className="h-4 w-4 text-amber-600" />} label={t('logistics.drivers.stats.resting')} value={stats.resting} sublabel={t('logistics.drivers.stats.restingHelper')} tone="warning" />
        <StatCell icon={<ShieldAlert className="h-4 w-4 text-muted-foreground" />} label={t('logistics.drivers.stats.adr')} value={stats.adr} sublabel={t('logistics.drivers.stats.adrHelper')} />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="flex items-center gap-1 bg-card p-1 rounded-lg border border-border shadow-xs text-xs overflow-x-auto"
          role="group"
          aria-label={t('logistics.drivers.filter.ariaLabel')}
        >
          {STATUS_FILTERS.map((f) => {
            const isActive = filterStatus === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterStatus(f.id)}
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
              placeholder={t('logistics.drivers.searchPlaceholder')}
              aria-label={t('logistics.drivers.searchLabel')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 w-full sm:w-[280px] text-xs bg-background border-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={t('logistics.drivers.searchClear')}
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs">
              {t('logistics.drivers.clearAll')}
            </Button>
          )}
        </div>
      </div>

      <Card className="border-border shadow-xs overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[860px]">
            <caption className="sr-only">{t('logistics.drivers.title')}</caption>
            <thead className="bg-muted/40 border-b border-border text-muted-foreground whitespace-nowrap uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">{t('logistics.drivers.table.name')}</th>
                <th className="py-3 px-4">{t('logistics.drivers.table.license')}</th>
                <th className="py-3 px-4">{t('logistics.drivers.table.phone')}</th>
                <th className="py-3 px-4">{t('logistics.drivers.table.vehicle')}</th>
                <th className="py-3 px-4">{t('logistics.drivers.table.hours')}</th>
                <th className="py-3 px-4">{t('logistics.drivers.table.rest')}</th>
                <th className="py-3 px-4">{t('logistics.drivers.table.adr')}</th>
                <th className="py-3 px-4">{t('logistics.drivers.table.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" aria-hidden="true" />
                    <p className="font-semibold text-foreground">{t('logistics.drivers.empty.title')}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('logistics.drivers.empty.subtitle')}</p>
                    {hasFilters && (
                      <Button variant="outline" size="sm" onClick={clearAll} className="mt-3 text-xs">
                        {t('logistics.drivers.clearAll')}
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-foreground whitespace-nowrap">
                      {d.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {d.licenseCategory}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-foreground whitespace-nowrap" dir="ltr">
                      {d.phone}
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground whitespace-nowrap text-xs">
                      {d.assignedTruck}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold tabular-nums text-foreground whitespace-nowrap text-xs">
                      {d.drivingHoursToday}
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                      {d.restHoursRemaining}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge
                        tone={d.adrCertified ? 'info' : 'neutral'}
                        label={t(d.adrCertified ? 'logistics.drivers.adr.yes' : 'logistics.drivers.adr.no')}
                        size="sm"
                      />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge tone={STATUS_TONE[d.status]} label={t(STATUS_LABEL_KEY[d.status])} size="sm" />
                    </td>
                  </tr>
                ))
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

export default LogisticsDriversPage;