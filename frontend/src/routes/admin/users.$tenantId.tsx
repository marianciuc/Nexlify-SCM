import { createFileRoute, Link } from '@tanstack/react-router';
import {
  AlertTriangle,
  Building2,
  Check,
  ChevronLeft,
  CreditCard,
  Download,
  FileText,
  Save,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { MoneyDisplay } from '@/components/money-display';
import { PageHeader } from '@/components/page-header';
import { StatusBadge, type StatusTone } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocale } from '@/hooks/useLocale';
import {
  useTenantDetailQuery,
  useUpdateTenantCreditMutation,
  type KycApplication,
  type TenantRecord,
} from '@/hooks/useScmQueries';
import { type TranslationPath } from '@/types/generated-locale';

export const Route = createFileRoute('/admin/users/$tenantId')({
  component: AdminTenantDetailPage,
  staticData: {
    crumb: {
      label: 'nav.admin.tenantDetail',
    },
  },
});

type KycStatus = TenantRecord['kycStatus'];
type PaymentTerms = NonNullable<KycApplication['paymentTerms']>;

const KYC_TONE: Record<KycStatus, StatusTone> = {
  VERIFIED: 'success',
  PENDING_AUDIT: 'warning',
  REJECTED: 'danger',
  NOT_SUBMITTED: 'neutral',
};

const KYC_LABEL_KEY: Record<KycStatus, TranslationPath> = {
  VERIFIED: 'admin.users.kyc.verified',
  PENDING_AUDIT: 'admin.users.kyc.pending',
  REJECTED: 'admin.users.kyc.rejected',
  NOT_SUBMITTED: 'admin.users.kyc.notSubmitted',
};

const ROLE_LABEL_KEY: Record<TenantRecord['role'], TranslationPath> = {
  BUYER: 'admin.users.role.buyer',
  SUPPLIER: 'admin.users.role.supplier',
  LOGISTICS_CARRIER: 'admin.users.role.carrier',
};

const PAYMENT_TERMS_LABEL_KEY: Record<PaymentTerms, TranslationPath> = {
  NET_15: 'admin.users.verification.paymentTerms.net15',
  NET_30: 'admin.users.verification.paymentTerms.net30',
  NET_60: 'admin.users.verification.paymentTerms.net60',
  PREPAYMENT: 'admin.users.verification.paymentTerms.prepayment',
};

/** Option values are persisted to the tenant record — locale-independent constants. */
const PAYMENT_TERMS_OPTIONS: PaymentTerms[] = ['NET_15', 'NET_30', 'NET_60', 'PREPAYMENT'];

const REGISTRY_CHECKS: { id: string; labelKey: TranslationPath; ok: (app: KycApplication) => boolean }[] = [
  { id: 'regon', labelKey: 'admin.users.verification.checks.regon', ok: (a) => a.regonChecked },
  { id: 'vatWhiteList', labelKey: 'admin.users.verification.checks.vatWhiteList', ok: (a) => a.whiteListVatChecked },
  {
    id: 'accountMatch',
    labelKey: 'admin.users.verification.checks.accountMatch',
    ok: (a) => a.whiteListAccountMatch,
  },
  { id: 'vies', labelKey: 'admin.users.verification.checks.vies', ok: (a) => a.viesEuChecked },
  { id: 'sanctions', labelKey: 'admin.users.verification.checks.sanctions', ok: (a) => a.sanctionListCleared },
];

function AdminTenantDetailPage() {
  const { tenantId } = Route.useParams();
  const { t } = useLocale();
  const { tenant, kycApplication, isLoading } = useTenantDetailQuery(tenantId);
  const updateCreditMutation = useUpdateTenantCreditMutation();

  const [creditLimit, setCreditLimit] = useState(tenant?.tradeCreditLimitPln ?? 150000);
  const [paymentTerms, setPaymentTerms] = useState(tenant?.paymentTerms ?? 'NET_30');

  useEffect(() => {
    if (tenant) {
      setCreditLimit(tenant.tradeCreditLimitPln);
      setPaymentTerms(tenant.paymentTerms);
    }
  }, [tenant]);

  const handleSave = () => {
    if (!tenant) return;
    updateCreditMutation.mutate({
      tenantId: tenant.id,
      tradeCreditLimitPln: creditLimit,
      paymentTerms,
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground" role="status">
        {t('common.loading')}
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="p-8 text-center space-y-3 max-w-md mx-auto">
        <AlertTriangle className="h-8 w-8 mx-auto text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <h2 className="text-base font-bold text-foreground">{t('admin.users.detail.notFound.title')}</h2>
        <p className="text-xs text-muted-foreground">
          {t('admin.users.detail.notFound.description', { id: tenantId })}
        </p>
        <Link to="/admin/users">
          <Button size="sm" variant="outline">
            {t('admin.users.detail.notFound.back')}
          </Button>
        </Link>
      </div>
    );
  }

  const limit = tenant.tradeCreditLimitPln;
  const used = tenant.creditUsedPln;
  const utilizationPct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const isHighExposure = utilizationPct >= 75;
  const availableCredit = Math.max(0, creditLimit - used);
  const storedTermsLabel = PAYMENT_TERMS_LABEL_KEY[tenant.paymentTerms as PaymentTerms];

  return (
    <div className="space-y-6 max-w-5xl mx-auto min-w-0">
      <PageHeader
        eyebrow={
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
            {t('admin.users.detail.backToDirectory')}
          </Link>
        }
        title={
          <span className="flex flex-wrap items-center gap-2.5">
            <Building2 className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
            <span className="break-words">{tenant.name}</span>
            <StatusBadge
              tone={KYC_TONE[tenant.kycStatus]}
              label={t(KYC_LABEL_KEY[tenant.kycStatus])}
              size="sm"
            />
          </span>
        }
        subtitle={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-normal">
            <span className="font-mono">{t('admin.users.table.nip')} {tenant.nip}</span>
            <Badge variant="outline" className="text-[10px] font-mono font-semibold">
              {t(ROLE_LABEL_KEY[tenant.role])}
            </Badge>
            <span>
              {t('admin.users.detail.joined')}:{' '}
              <span className="font-mono">{tenant.joinedDate}</span>
            </span>
          </span>
        }
        actions={
          tenant.kycStatus === 'PENDING_AUDIT' ? (
            <Link to="/admin/users/verification" className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="gap-1.5 w-full sm:w-auto font-medium">
                <UserCheck className="h-4 w-4" aria-hidden="true" />
                {t('admin.users.detail.openKycQueue')}
              </Button>
            </Link>
          ) : (
            <Button
              size="sm"
              className="gap-1.5 w-full sm:w-auto font-medium"
              onClick={handleSave}
              disabled={updateCreditMutation.isPending}
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {t('admin.users.detail.saveCredit')}
            </Button>
          )
        }
      />

      {/* Credit line, exposure and the governance form — one dense card, no card soup */}
      <Card className="border-border shadow-xs overflow-hidden bg-card">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <caption className="sr-only">
              {t('admin.users.detail.credit.caption', { name: tenant.name })}
            </caption>
            <tbody className="divide-y divide-border">
              <tr>
                <th
                  scope="row"
                  className="py-2.5 px-4 sm:px-6 text-left align-top text-xs font-medium text-muted-foreground w-[38%]"
                >
                  {t('admin.users.table.creditLimit')}
                </th>
                <td className="py-2.5 px-4 sm:px-6">
                  {limit > 0 ? (
                    <MoneyDisplay amount={limit} variant="inline" emphasize />
                  ) : (
                    <span className="text-xs italic text-muted-foreground">{t('admin.users.cashOnly')}</span>
                  )}
                </td>
              </tr>
              <tr>
                <th scope="row" className="py-2.5 px-4 sm:px-6 text-left align-top text-xs font-medium text-muted-foreground">
                  {t('admin.users.detail.credit.used')}
                </th>
                <td className="py-2.5 px-4 sm:px-6">
                  <MoneyDisplay
                    amount={used}
                    variant="inline"
                    className={isHighExposure ? 'font-semibold text-rose-700 dark:text-rose-400' : ''}
                  />
                </td>
              </tr>
              <tr>
                <th scope="row" className="py-2.5 px-4 sm:px-6 text-left align-top text-xs font-medium text-muted-foreground">
                  {t('admin.users.detail.credit.available')}
                </th>
                <td className="py-2.5 px-4 sm:px-6">
                  <MoneyDisplay amount={Math.max(0, limit - used)} variant="inline" />
                </td>
              </tr>
              <tr>
                <th scope="row" className="py-2.5 px-4 sm:px-6 text-left align-middle text-xs font-medium text-muted-foreground">
                  {t('admin.users.detail.credit.utilization')}
                </th>
                <td className="py-2.5 px-4 sm:px-6">
                  {limit > 0 ? (
                    <div className="flex items-center gap-3">
                      <div
                        className="flex-1 min-w-[120px] h-1.5 bg-muted rounded-full overflow-hidden"
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
                      <span className="font-mono text-xs tabular-nums text-muted-foreground w-10 text-right">
                        {utilizationPct.toFixed(0)}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
              <tr>
                <th scope="row" className="py-2.5 px-4 sm:px-6 text-left align-top text-xs font-medium text-muted-foreground">
                  {t('admin.users.detail.credit.terms')}
                </th>
                <td className="py-2.5 px-4 sm:px-6 text-xs">
                  {storedTermsLabel ? (
                    t(storedTermsLabel)
                  ) : (
                    <span className="font-mono">{tenant.paymentTerms}</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Credit line governance form (mutation unchanged) */}
          <div className="border-t border-border p-4 sm:px-6 sm:py-5 space-y-4">
            <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <CreditCard className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              {t('admin.users.detail.form.title')}
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold" htmlFor="tenant-credit-limit">
                  {t('admin.users.detail.form.limitLabel')}
                </Label>
                <Input
                  id="tenant-credit-limit"
                  type="number"
                  step="10000"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(Number(e.target.value))}
                  className="font-mono text-base font-bold"
                />
                <p className="text-[11px] text-muted-foreground">
                  {t('admin.users.detail.form.limitHelper', {
                    used: used.toLocaleString(),
                    available: availableCredit.toLocaleString(),
                  })}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold" htmlFor="tenant-payment-terms">
                  {t('admin.users.detail.form.termsLabel')}
                </Label>
                <select
                  id="tenant-payment-terms"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full h-9 p-2 rounded-md border border-input bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {PAYMENT_TERMS_OPTIONS.map((term) => (
                    <option key={term} value={term}>
                      {t(PAYMENT_TERMS_LABEL_KEY[term])}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground">
                  {t('admin.users.detail.form.termsHelper')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registry identity, automated checks and dossier documents */}
      <Card className="border-border shadow-xs overflow-hidden bg-card">
        <div className="flex items-center gap-2 px-4 sm:px-6 py-3 border-b border-border">
          <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
          <span className="text-sm font-semibold text-foreground">{t('admin.users.detail.registry.title')}</span>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 px-4 sm:px-6 py-4">
          <div>
            <dt className="text-xs text-muted-foreground">{t('admin.users.detail.registry.iban')}</dt>
            <dd className="font-mono text-xs font-semibold mt-0.5 break-all">
              {tenant.iban || kycApplication?.iban || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{t('admin.users.detail.registry.krs')}</dt>
            <dd className="font-mono text-xs font-semibold mt-0.5">{tenant.krs || kycApplication?.krs || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{t('admin.users.detail.registry.regon')}</dt>
            <dd className="font-mono text-xs font-semibold mt-0.5">{tenant.regon || kycApplication?.regon || '—'}</dd>
          </div>
          {kycApplication && (
            <div>
              <dt className="text-xs text-muted-foreground">{t('admin.users.detail.registry.submitted')}</dt>
              <dd className="font-mono text-xs font-semibold mt-0.5">{kycApplication.submittedDate}</dd>
            </div>
          )}
        </dl>

        {kycApplication ? (
          <>
            <table className="w-full border-t border-border">
              <caption className="sr-only">{t('admin.users.verification.reviewDialog.checksTitle')}</caption>
              <tbody className="divide-y divide-border">
                {REGISTRY_CHECKS.map((check) => {
                  const ok = check.ok(kycApplication);
                  return (
                    <tr key={check.id}>
                      <th
                        scope="row"
                        className="py-2 px-4 sm:px-6 text-left font-normal text-xs text-muted-foreground"
                      >
                        {t(check.labelKey)}
                      </th>
                      <td className="py-2 px-4 sm:px-6 text-right">
                        {ok ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600 inline" aria-hidden="true" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-rose-600 inline" aria-hidden="true" />
                        )}
                        <span className="sr-only">
                          {ok
                            ? t('admin.users.verification.checks.pass')
                            : t('admin.users.verification.checks.fail')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {kycApplication.documents.length > 0 && (
              <div className="border-t border-border px-4 sm:px-6 py-4 space-y-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                  {t('admin.users.verification.documents.title')}
                </span>
                <ul className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                  {kycApplication.documents.map((doc) => (
                    <li key={doc.id} className="flex items-center justify-between gap-3 px-3 py-2">
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold text-foreground truncate">{doc.name}</span>
                        <span className="block font-mono text-[10px] text-muted-foreground truncate">
                          {doc.fileName} ({doc.fileSize})
                        </span>
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="shrink-0"
                        aria-label={t('admin.users.detail.docs.downloadAria', { name: doc.name })}
                        title={t('admin.users.detail.docs.downloadAria', { name: doc.name })}
                      >
                        <Download className="h-3 w-3" aria-hidden="true" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <p className="border-t border-border px-4 sm:px-6 py-4 text-xs text-muted-foreground">
            {t('admin.users.detail.registry.noApplication')}
          </p>
        )}
      </Card>
    </div>
  );
}

export default AdminTenantDetailPage;
