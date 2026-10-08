import { createFileRoute, Link } from '@tanstack/react-router';
import { Building2, ArrowRight, UserCheck, Plus, Search, X, ChevronDown } from 'lucide-react';
import { useState, useMemo } from 'react';

import { KycSubmissionModal } from '@/components/kyc/KycSubmissionModal';
import { MoneyDisplay } from '@/components/money-display';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLocale } from '@/hooks/useLocale';
import { useTenantListQuery, useKycApplicationsQuery } from '@/hooks/useScmQueries';
import { type TranslationPath } from '@/types/generated-locale';

export const Route = createFileRoute('/admin/users')({
  component: AdminTenantsDirectoryPage,
  staticData: {
    crumb: {
      label: 'nav.admin.users',
    },
  },
});

type RoleFilter = 'ALL' | 'BUYER' | 'SUPPLIER' | 'LOGISTICS_CARRIER';

const ROLE_FILTERS: { id: RoleFilter; labelKey: TranslationPath }[] = [
  { id: 'ALL', labelKey: 'admin.users.filter.all' },
  { id: 'BUYER', labelKey: 'admin.users.filter.buyer' },
  { id: 'SUPPLIER', labelKey: 'admin.users.filter.supplier' },
  { id: 'LOGISTICS_CARRIER', labelKey: 'admin.users.filter.carrier' },
];

const KYC_TONE: Record<'VERIFIED' | 'PENDING_AUDIT' | 'REJECTED' | 'NOT_SUBMITTED', 'success' | 'warning' | 'danger' | 'neutral'> = {
  VERIFIED: 'success',
  PENDING_AUDIT: 'warning',
  REJECTED: 'danger',
  NOT_SUBMITTED: 'neutral',
};

const KYC_LABEL_KEY: Record<'VERIFIED' | 'PENDING_AUDIT' | 'REJECTED' | 'NOT_SUBMITTED', TranslationPath> = {
  VERIFIED: 'admin.users.kyc.verified',
  PENDING_AUDIT: 'admin.users.kyc.pending',
  REJECTED: 'admin.users.kyc.rejected',
  NOT_SUBMITTED: 'admin.users.kyc.notSubmitted',
};

const ROLE_LABEL_KEY: Record<'BUYER' | 'SUPPLIER' | 'LOGISTICS_CARRIER', TranslationPath> = {
  BUYER: 'admin.users.role.buyer',
  SUPPLIER: 'admin.users.role.supplier',
  LOGISTICS_CARRIER: 'admin.users.role.carrier',
};

function AdminTenantsDirectoryPage() {
  const { t } = useLocale();
  const { data: tenants = [] } = useTenantListQuery();
  const { data: kycApps = [] } = useKycApplicationsQuery();
  const [filterRole, setFilterRole] = useState<RoleFilter>('ALL');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const pendingCount = kycApps.filter((a) => a.status === 'PENDING_AUDIT').length;

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    return tenants.filter((tenant) => {
      if (filterRole !== 'ALL' && tenant.role !== filterRole) return false;
      if (!s) return true;
      return (
        tenant.name.toLowerCase().includes(s) ||
        tenant.nip.includes(s) ||
        (tenant.krs ?? '').toLowerCase().includes(s)
      );
    });
  }, [tenants, filterRole, search]);

  const counts = useMemo(
    () => ({
      ALL: tenants.length,
      BUYER: tenants.filter((x) => x.role === 'BUYER').length,
      SUPPLIER: tenants.filter((x) => x.role === 'SUPPLIER').length,
      LOGISTICS_CARRIER: tenants.filter((x) => x.role === 'LOGISTICS_CARRIER').length,
    }),
    [tenants]
  );

  const allSelected = filtered.length > 0 && filtered.every((x) => selected.has(x.id));
  const someSelected = !allSelected && filtered.some((x) => selected.has(x.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((x) => x.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const hasFilters = filterRole !== 'ALL' || search.length > 0;
  const clearAll = () => {
    setFilterRole('ALL');
    setSearch('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto min-w-0">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {t('admin.users.title')}
          </span>
        }
        subtitle={t('admin.users.subtitle')}
        actions={
          <>
            <KycSubmissionModal
              triggerButton={
                <Button variant="outline" size="sm" className="gap-1.5 border-dashed w-full sm:w-auto font-medium">
                  <Plus className="h-4 w-4" />
                  {t('admin.users.actions.newEntity')}
                </Button>
              }
            />
            <Link to="/admin/users/verification" className="w-full sm:w-auto">
              <Button size="sm" className="gap-2 shadow-xs w-full sm:w-auto font-medium">
                <UserCheck className="h-4 w-4" />
                {t('admin.users.actions.kycQueue')}
                {pendingCount > 0 && (
                  <Badge variant="outline" className="ml-1 px-1.5 py-0 text-[10px] font-bold bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
                    {pendingCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="flex items-center gap-1 bg-card p-1 rounded-lg border border-border shadow-xs text-xs overflow-x-auto"
          role="group"
          aria-label={t('admin.users.filter.ariaLabel')}
        >
          {ROLE_FILTERS.map((f) => {
            const isActive = filterRole === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterRole(f.id)}
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
              placeholder={t('admin.users.searchPlaceholder')}
              aria-label={t('admin.users.searchLabel')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 w-full sm:w-[280px] text-xs bg-background border-input"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={t('admin.users.searchClear')}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs">
              {t('admin.users.clearAll')}
            </Button>
          )}
        </div>
      </div>

      {selected.size > 0 && (
        <div
          className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-primary/5 border border-primary/30 text-sm rounded-md"
          role="region"
          aria-label={t('admin.users.bulkActionsLabel')}
        >
          <span className="font-semibold text-foreground">
            {t('admin.users.selectedCount', { count: selected.size })}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              {t('admin.users.bulk.exportKyc')}
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              {t('admin.users.bulk.adjustCredit')}
            </Button>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSelected(new Set())}>
              {t('admin.users.bulk.clear')}
            </Button>
          </div>
        </div>
      )}

      <Card className="border-border shadow-xs overflow-hidden bg-card">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[900px]">
            <caption className="sr-only">{t('admin.users.title')}</caption>
            <thead className="bg-muted/40 border-b border-border text-muted-foreground whitespace-nowrap uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-3 w-10">
                  <input
                    type="checkbox"
                    aria-label={t('admin.users.bulk.selectAll')}
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">{t('admin.users.table.name')}</th>
                <th className="py-3 px-4">{t('admin.users.table.nip')}</th>
                <th className="py-3 px-4">{t('admin.users.table.role')}</th>
                <th className="py-3 px-4">{t('admin.users.table.kyc')}</th>
                <th className="py-3 px-4 text-right">{t('admin.users.table.creditLimit')}</th>
                <th className="py-3 px-4 min-w-[220px]">{t('admin.users.table.exposure')}</th>
                <th className="py-3 px-4">{t('admin.users.table.joined')}</th>
                <th className="py-3 px-4 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border whitespace-nowrap">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-sm text-muted-foreground">
                    <Building2 className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" aria-hidden="true" />
                    <p className="font-semibold text-foreground">{t('admin.users.empty.title')}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('admin.users.empty.subtitle')}</p>
                  </td>
                </tr>
              ) : (
                filtered.map((tenant) => {
                  const limit = tenant.tradeCreditLimitPln;
                  const used = tenant.creditUsedPln;
                  const utilizationPct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
                  const isHighExposure = utilizationPct >= 75;
                  const isSelected = selected.has(tenant.id);
                  return (
                    <tr
                      key={tenant.id}
                      className={`hover:bg-muted/40 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}
                    >
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          aria-label={t('admin.users.bulk.selectOne', { name: tenant.name })}
                          checked={isSelected}
                          onChange={() => toggleOne(tenant.id)}
                          className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          to="/admin/users/$tenantId"
                          params={{ tenantId: tenant.id }}
                          className="font-semibold text-foreground hover:text-primary"
                        >
                          {tenant.name}
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                        {tenant.nip}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[10px] font-mono font-semibold">
                          {t(ROLE_LABEL_KEY[tenant.role])}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge tone={KYC_TONE[tenant.kycStatus]} label={t(KYC_LABEL_KEY[tenant.kycStatus])} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        {limit > 0 ? (
                          <MoneyDisplay amount={limit} variant="inline" emphasize />
                        ) : (
                          <span className="text-xs text-muted-foreground italic">{t('admin.users.cashOnly')}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-semibold tabular-nums text-xs ${
                              isHighExposure ? 'text-rose-700 dark:text-rose-400' : 'text-foreground'
                            }`}
                          >
                            <MoneyDisplay amount={used} variant="inline" />
                          </span>
                          {limit > 0 && (
                            <div
                              className="flex-1 min-w-[80px] h-1.5 bg-muted rounded-full overflow-hidden"
                              role="progressbar"
                              aria-valuenow={Math.round(utilizationPct)}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label={t('admin.users.utilizationAria', {
                                name: tenant.name,
                                pct: utilizationPct.toFixed(0),
                              })}
                            >
                              <div
                                className={`h-full ${
                                  isHighExposure
                                    ? 'bg-rose-500'
                                    : utilizationPct >= 50
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${utilizationPct}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground font-mono">
                        {tenant.joinedDate}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to="/admin/users/$tenantId"
                            params={{ tenantId: tenant.id }}
                            aria-label={t('admin.users.actions.configureAria', { name: tenant.name })}
                          >
                            <Button variant="ghost" size="xs" className="gap-1">
                              {t('admin.users.actions.configure')}
                              <ArrowRight className="h-3 w-3 rtl:rotate-180" aria-hidden="true" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon-xs" aria-label={t('admin.users.actions.moreAria', { name: tenant.name })}>
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </div>
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

export default AdminTenantsDirectoryPage;