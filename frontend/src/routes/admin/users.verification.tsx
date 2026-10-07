import { createFileRoute, Link } from '@tanstack/react-router';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronLeft,
  Copy,
  Download,
  FileSearch,
  FileText,
  Plus,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { KycSubmissionModal } from '@/components/kyc/KycSubmissionModal';
import { MoneyDisplay } from '@/components/money-display';
import { PageHeader } from '@/components/page-header';
import { StatusBadge, type StatusTone } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocale } from '@/hooks/useLocale';
import {
  useKycApplicationsQuery,
  useReviewKycMutation,
  type KycApplication,
  type KycDocument,
} from '@/hooks/useScmQueries';
import { type TranslationPath } from '@/types/generated-locale';

export const Route = createFileRoute('/admin/users/verification')({
  component: AdminKycVerificationQueuePage,
  staticData: {
    crumb: {
      label: 'nav.admin.kyc',
    },
  },
});

type KycStatus = KycApplication['status'];
type StatusFilter = 'ALL' | KycStatus;
type PaymentTerms = NonNullable<KycApplication['paymentTerms']>;

const STATUS_FILTERS: { id: StatusFilter; labelKey: TranslationPath }[] = [
  { id: 'ALL', labelKey: 'admin.users.verification.filter.all' },
  { id: 'PENDING_AUDIT', labelKey: 'admin.users.verification.filter.pending' },
  { id: 'APPROVED', labelKey: 'admin.users.verification.filter.approved' },
  { id: 'REJECTED', labelKey: 'admin.users.verification.filter.rejected' },
];

const STATUS_TONE: Record<KycStatus, StatusTone> = {
  PENDING_AUDIT: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
};

const STATUS_LABEL_KEY: Record<KycStatus, TranslationPath> = {
  PENDING_AUDIT: 'admin.users.verification.status.pendingAudit',
  APPROVED: 'admin.users.verification.status.approved',
  REJECTED: 'admin.users.verification.status.rejected',
};

const ROLE_LABEL_KEY: Record<KycApplication['role'], TranslationPath> = {
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

/** Default audit note persisted with approvals — locale-independent, like the rejection reason values. */
const DEFAULT_APPROVAL_NOTES =
  'Zweryfikowano w rejestrze podatników VAT. Zgodność rachunku MPP potwierdzona.';

const DEFAULT_REJECTION_REASON =
  'Rachunek bankowy nie figuruje w wykazie Białej Listy Ministerstwa Finansów (Brak MPP)';

const REJECTION_REASONS: { id: string; value: string; labelKey: TranslationPath }[] = [
  { id: 'whiteList', value: DEFAULT_REJECTION_REASON, labelKey: 'admin.users.verification.rejectReasons.whiteList' },
  {
    id: 'krsMismatch',
    value: 'Niezgodność danych reprezentacji z Krajowym Rejestrem Sądowym (KRS)',
    labelKey: 'admin.users.verification.rejectReasons.krsMismatch',
  },
  {
    id: 'transportLicense',
    value: 'Brak wymaganej licencji transportowej GITD na przewóz rzeczy',
    labelKey: 'admin.users.verification.rejectReasons.transportLicense',
  },
  {
    id: 'vatRemoved',
    value: 'Podmiot wykreślony z rejestru czynnych podatników VAT',
    labelKey: 'admin.users.verification.rejectReasons.vatRemoved',
  },
  {
    id: 'creditRisk',
    value: 'Negatywna ocena ryzyka kredytowego i historii płatności',
    labelKey: 'admin.users.verification.rejectReasons.creditRisk',
  },
];

type RegistryCheckId = 'regon' | 'vatWhiteList' | 'accountMatch' | 'vies' | 'sanctions';

const REGISTRY_CHECKS: { id: RegistryCheckId; labelKey: TranslationPath; ok: (app: KycApplication) => boolean }[] = [
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

const DOC_TYPE_LABEL_KEY: Record<KycDocument['type'], TranslationPath> = {
  KRS_EXTRACT: 'admin.users.verification.docType.krsExtract',
  VAT_WHITE_LIST: 'admin.users.verification.docType.vatWhiteList',
  TRANSPORT_LICENSE: 'admin.users.verification.docType.transportLicense',
  BANK_CONFIRMATION: 'admin.users.verification.docType.bankConfirmation',
  ISO_CERTIFICATE: 'admin.users.verification.docType.isoCertificate',
};

/** Document types every application must contain regardless of role. */
const REQUIRED_DOC_TYPES: KycDocument['type'][] = ['KRS_EXTRACT', 'BANK_CONFIRMATION'];

/** Pending submissions older than this are highlighted in the queue. */
const AGE_WARNING_DAYS = 7;

function submissionAgeDays(submittedDate: string): number | null {
  const ts = new Date(submittedDate.replace(' ', 'T')).getTime();
  if (Number.isNaN(ts)) return null;
  return Math.max(0, Math.floor((Date.now() - ts) / 86_400_000));
}

function AdminKycVerificationQueuePage() {
  return <AdminKycVerificationQueueContent />;
}

function AdminKycVerificationQueueContent() {
  const { t } = useLocale();
  const { data: applications = [], isLoading } = useKycApplicationsQuery();
  const reviewMutation = useReviewKycMutation();

  const [filterStatus, setFilterStatus] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Review dialog state
  const [reviewingApp, setReviewingApp] = useState<KycApplication | null>(null);

  // Document Viewer Modal State
  const [inspectingDoc, setInspectingDoc] = useState<{
    docName: string;
    fileName: string;
    fileSize: string;
    companyName: string;
    nip: string;
  } | null>(null);

  // Approval Dialog State
  const [approvingApp, setApprovingApp] = useState<KycApplication | null>(null);
  const [approvedCreditLimit, setApprovedCreditLimit] = useState<number>(100000);
  const [paymentTerms, setPaymentTerms] = useState<'NET_15' | 'NET_30' | 'NET_60'>('NET_30');
  const [approvalNotes, setApprovalNotes] = useState<string>('');

  // Rejection Dialog State
  const [rejectingApp, setRejectingApp] = useState<KycApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>(DEFAULT_REJECTION_REASON);
  const [rejectionNotes, setRejectionNotes] = useState<string>('');

  const copyToClipboard = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(t('admin.users.verification.copiedToast', { label, value: text }));
    setTimeout(() => {
      setCopiedKey((curr) => (curr === key ? null : curr));
    }, 2000);
  };

  const counts = useMemo(
    () => ({
      ALL: applications.length,
      PENDING_AUDIT: applications.filter((a) => a.status === 'PENDING_AUDIT').length,
      APPROVED: applications.filter((a) => a.status === 'APPROVED').length,
      REJECTED: applications.filter((a) => a.status === 'REJECTED').length,
    }),
    [applications]
  );

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (filterStatus !== 'ALL' && app.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = app.companyName.toLowerCase().includes(q);
        const matchNip = app.nip.includes(q);
        const matchKrs = app.krs?.includes(q);
        const matchRole = app.role.toLowerCase().includes(q);
        if (!matchName && !matchNip && !matchKrs && !matchRole) return false;
      }
      return true;
    });
  }, [applications, filterStatus, searchQuery]);

  const selectedPending = useMemo(
    () => applications.filter((a) => selected.has(a.id) && a.status === 'PENDING_AUDIT'),
    [applications, selected]
  );

  const allSelected = filteredApplications.length > 0 && filteredApplications.every((x) => selected.has(x.id));
  const someSelected = !allSelected && filteredApplications.some((x) => selected.has(x.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredApplications.map((x) => x.id)));
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

  const hasFilters = filterStatus !== 'ALL' || searchQuery.length > 0;
  const clearAll = () => {
    setFilterStatus('ALL');
    setSearchQuery('');
  };

  const handleOpenApproveModal = (app: KycApplication) => {
    setApprovingApp(app);
    setApprovedCreditLimit(app.requestedCreditLimitPln || 100000);
    setPaymentTerms(((app.paymentTerms as 'NET_15' | 'NET_30' | 'NET_60') || 'NET_30'));
    setApprovalNotes(DEFAULT_APPROVAL_NOTES);
  };

  const handleConfirmApproval = () => {
    if (!approvingApp) return;
    reviewMutation.mutate(
      {
        applicationId: approvingApp.id,
        action: 'APPROVE',
        approvedCreditLimitPln: approvedCreditLimit,
        paymentTerms,
        notes: approvalNotes,
      },
      {
        onSuccess: () => {
          setApprovingApp(null);
        },
      }
    );
  };

  const handleOpenRejectModal = (app: KycApplication) => {
    setRejectingApp(app);
    setRejectionReason(DEFAULT_REJECTION_REASON);
    setRejectionNotes('');
  };

  const handleConfirmRejection = () => {
    if (!rejectingApp) return;
    reviewMutation.mutate(
      {
        applicationId: rejectingApp.id,
        action: 'REJECT',
        rejectionReason,
        notes: rejectionNotes,
      },
      {
        onSuccess: () => {
          setRejectingApp(null);
        },
      }
    );
  };

  // Bulk actions reuse the same mutation and the same defaults as the single flows.
  const handleBulkApprove = () => {
    selectedPending.forEach((app) => {
      reviewMutation.mutate({
        applicationId: app.id,
        action: 'APPROVE',
        approvedCreditLimitPln: app.requestedCreditLimitPln || 100000,
        paymentTerms: 'NET_30',
        notes: DEFAULT_APPROVAL_NOTES,
      });
    });
    setSelected(new Set());
  };

  const handleBulkReject = () => {
    selectedPending.forEach((app) => {
      reviewMutation.mutate({
        applicationId: app.id,
        action: 'REJECT',
        rejectionReason: DEFAULT_REJECTION_REASON,
        notes: '',
      });
    });
    setSelected(new Set());
  };

  const openReviewFromQueue = (app: KycApplication) => setReviewingApp(app);

  const startApproveFromReview = (app: KycApplication) => {
    setReviewingApp(null);
    handleOpenApproveModal(app);
  };

  const startRejectFromReview = (app: KycApplication) => {
    setReviewingApp(null);
    handleOpenRejectModal(app);
  };

  const reviewingAgeDays = reviewingApp ? submissionAgeDays(reviewingApp.submittedDate) : null;

  const missingRequiredDocs = (app: KycApplication): KycDocument['type'][] =>
    REQUIRED_DOC_TYPES.filter(
      (type) => !app.documents.some((doc) => doc.type === type)
    );

  const renderCheckIcon = (ok: boolean, title: string) => (
    <span title={title}>
      {ok ? (
        <Check className="h-3 w-3 text-emerald-600" aria-hidden="true" />
      ) : (
        <X className="h-3 w-3 text-rose-600" aria-hidden="true" />
      )}
    </span>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto min-w-0">
      <PageHeader
        eyebrow={
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
            {t('admin.users.verification.backToDirectory')}
          </Link>
        }
        title={
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            {t('admin.users.verification.title')}
          </span>
        }
        subtitle={t('admin.users.verification.subtitle')}
        actions={
          <KycSubmissionModal
            triggerButton={
              <Button variant="outline" size="sm" className="gap-1.5 border-dashed w-full sm:w-auto font-medium">
                <Plus className="h-4 w-4" aria-hidden="true" />
                {t('admin.users.verification.newApplication')}
              </Button>
            }
          />
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="flex items-center gap-1 bg-card p-1 rounded-lg border border-border shadow-xs text-xs overflow-x-auto"
          role="group"
          aria-label={t('admin.users.verification.filter.ariaLabel')}
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
              placeholder={t('admin.users.verification.searchPlaceholder')}
              aria-label={t('admin.users.verification.searchLabel')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 w-full sm:w-[280px] text-xs bg-background border-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={t('admin.users.verification.searchClear')}
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
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
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={handleBulkApprove}
              disabled={reviewMutation.isPending || selectedPending.length === 0}
            >
              {t('admin.users.verification.bulk.approve', { count: selectedPending.length })}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-destructive hover:text-destructive"
              onClick={handleBulkReject}
              disabled={reviewMutation.isPending || selectedPending.length === 0}
            >
              {t('admin.users.verification.bulk.reject', { count: selectedPending.length })}
            </Button>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSelected(new Set())}>
              {t('admin.users.bulk.clear')}
            </Button>
          </div>
        </div>
      )}

      <Card className="border-border shadow-xs overflow-hidden bg-card">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[1100px]">
            <caption className="sr-only">{t('admin.users.verification.table.caption')}</caption>
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
                <th className="py-3 px-4">{t('admin.users.verification.table.organization')}</th>
                <th className="py-3 px-4">{t('admin.users.verification.table.role')}</th>
                <th className="py-3 px-4">{t('admin.users.verification.table.status')}</th>
                <th className="py-3 px-4">{t('admin.users.verification.table.submitted')}</th>
                <th className="py-3 px-4">{t('admin.users.verification.table.age')}</th>
                <th className="py-3 px-4">{t('admin.users.verification.table.checks')}</th>
                <th className="py-3 px-4">{t('admin.users.verification.table.documents')}</th>
                <th className="py-3 px-4 text-right">{t('admin.users.verification.table.requestedLimit')}</th>
                <th className="py-3 px-4 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border whitespace-nowrap">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-sm text-muted-foreground">
                    {t('common.loading')}
                  </td>
                </tr>
              ) : filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-sm text-muted-foreground">
                    <FileSearch className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" aria-hidden="true" />
                    <p className="font-semibold text-foreground">
                      {t('admin.users.verification.empty.title')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('admin.users.verification.empty.subtitle')}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => {
                  const isSelected = selected.has(app.id);
                  const age = submissionAgeDays(app.submittedDate);
                  const passedChecks = REGISTRY_CHECKS.filter((c) => c.ok(app)).length;
                  const missing = missingRequiredDocs(app);
                  const missingLabel = missing
                    .map((type) => t(DOC_TYPE_LABEL_KEY[type]))
                    .join(', ');
                  return (
                    <tr
                      key={app.id}
                      className={`hover:bg-muted/40 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}
                    >
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          aria-label={t('admin.users.bulk.selectOne', { name: app.companyName })}
                          checked={isSelected}
                          onChange={() => toggleOne(app.id)}
                          className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground">{app.companyName}</div>
                        <div className="font-mono text-xs text-muted-foreground mt-0.5">NIP {app.nip}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[10px] font-mono font-semibold">
                          {t(ROLE_LABEL_KEY[app.role])}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge
                          tone={STATUS_TONE[app.status]}
                          label={t(STATUS_LABEL_KEY[app.status])}
                          size="sm"
                        />
                      </td>
                      <td
                        className="py-3 px-4 font-mono text-xs text-muted-foreground"
                        title={app.submittedDate}
                      >
                        {app.submittedDate}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs tabular-nums">
                        {age === null ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <span
                            className={
                              app.status === 'PENDING_AUDIT' && age >= AGE_WARNING_DAYS
                                ? 'text-amber-600 dark:text-amber-400 font-semibold'
                                : 'text-muted-foreground'
                            }
                            title={app.submittedDate}
                          >
                            {t('admin.users.verification.ageDays', { count: age })}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {REGISTRY_CHECKS.map((c) => {
                            const ok = c.ok(app);
                            return (
                              <span key={c.id}>
                                {renderCheckIcon(
                                  ok,
                                  `${t(c.labelKey)}: ${ok ? t('admin.users.verification.checks.pass') : t('admin.users.verification.checks.fail')}`
                                )}
                              </span>
                            );
                          })}
                          <span className="sr-only">
                            {t('admin.users.verification.checks.summary', {
                              passed: passedChecks,
                              total: REGISTRY_CHECKS.length,
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                          <span className="font-mono text-xs tabular-nums">{app.documents.length}</span>
                          {missing.length > 0 && (
                            <span
                              className="inline-flex items-center"
                              title={t('admin.users.verification.documents.incomplete', { types: missingLabel })}
                            >
                              <AlertTriangle
                                className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400"
                                aria-hidden="true"
                              />
                              <span className="sr-only">
                                {t('admin.users.verification.documents.incomplete', { types: missingLabel })}
                              </span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {app.requestedCreditLimitPln != null ? (
                          <MoneyDisplay amount={app.requestedCreditLimitPln} variant="inline" />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="xs"
                          className="gap-1"
                          onClick={() => openReviewFromQueue(app)}
                          aria-label={t('admin.users.verification.reviewAria', { name: app.companyName })}
                        >
                          {t('admin.users.verification.review')}
                          <ArrowRight className="h-3 w-3 rtl:rotate-180" aria-hidden="true" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Dialog: Application Review (documents and details live here, not on the queue) */}
      <Dialog open={!!reviewingApp} onOpenChange={(open) => !open && setReviewingApp(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
              {t('admin.users.verification.reviewDialog.title')}
            </DialogTitle>
            <DialogDescription>
              <strong className="text-foreground">{reviewingApp?.companyName}</strong> · NIP {reviewingApp?.nip}
            </DialogDescription>
          </DialogHeader>

          {reviewingApp && (
            <div className="space-y-5 text-sm">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <StatusBadge
                  tone={STATUS_TONE[reviewingApp.status]}
                  label={t(STATUS_LABEL_KEY[reviewingApp.status])}
                  size="sm"
                />
                <span>
                  {t('admin.users.verification.reviewDialog.submittedOn')}:{' '}
                  <span className="font-mono">{reviewingApp.submittedDate}</span>
                </span>
                {reviewingAgeDays !== null && (
                  <span>· {t('admin.users.verification.ageDays', { count: reviewingAgeDays })}</span>
                )}
                <Badge variant="outline" className="text-[10px] font-mono font-semibold">
                  {t(ROLE_LABEL_KEY[reviewingApp.role])}
                </Badge>
              </div>

              {/* Identity & registry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                <div>
                  <span className="text-xs text-muted-foreground block">
                    {t('admin.users.verification.reviewDialog.field.nip')}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono text-xs font-semibold">{reviewingApp.nip}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(reviewingApp.nip, `nip-${reviewingApp.id}`, t('admin.users.verification.copyNip'))}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label={t('admin.users.verification.copyNip')}
                    >
                      {copiedKey === `nip-${reviewingApp.id}` ? (
                        <Check className="h-3 w-3 text-emerald-600" aria-hidden="true" />
                      ) : (
                        <Copy className="h-3 w-3" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">
                    {t('admin.users.verification.reviewDialog.field.krs')}
                  </span>
                  <span className="font-mono text-xs font-semibold mt-0.5 block">
                    {reviewingApp.krs} · REGON {reviewingApp.regon}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-xs text-muted-foreground block">
                    {t('admin.users.verification.reviewDialog.field.iban')}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono text-xs font-semibold">{reviewingApp.iban}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(reviewingApp.iban, `iban-${reviewingApp.id}`, t('admin.users.verification.copyIban'))}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label={t('admin.users.verification.copyIban')}
                    >
                      {copiedKey === `iban-${reviewingApp.id}` ? (
                        <Check className="h-3 w-3 text-emerald-600" aria-hidden="true" />
                      ) : (
                        <Copy className="h-3 w-3" aria-hidden="true" />
                      )}
                    </button>
                    {reviewingApp.whiteListAccountMatch ? (
                      <StatusBadge
                        tone="success"
                        label={t('admin.users.verification.reviewDialog.whiteList.match')}
                        size="sm"
                      />
                    ) : (
                      <StatusBadge
                        tone="danger"
                        label={t('admin.users.verification.reviewDialog.whiteList.mismatch')}
                        size="sm"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">
                    {t('admin.users.verification.reviewDialog.field.email')}
                  </span>
                  <span className="text-xs font-semibold mt-0.5 block">{reviewingApp.contactEmail}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">
                    {t('admin.users.verification.reviewDialog.field.phone')}
                  </span>
                  <span className="font-mono text-xs font-semibold mt-0.5 block">{reviewingApp.contactPhone}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-xs text-muted-foreground block">
                    {t('admin.users.verification.reviewDialog.field.address')}
                  </span>
                  <span className="text-xs mt-0.5 block">{reviewingApp.address}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">
                    {t('admin.users.verification.reviewDialog.requestedLimit')}
                  </span>
                  <span className="mt-0.5 block">
                    {reviewingApp.requestedCreditLimitPln != null ? (
                      <MoneyDisplay amount={reviewingApp.requestedCreditLimitPln} variant="inline" emphasize />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Automated registry checks (real data) */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-foreground block">
                  {t('admin.users.verification.reviewDialog.checksTitle')}
                </span>
                <ul className="space-y-1">
                  {REGISTRY_CHECKS.map((c) => {
                    const ok = c.ok(reviewingApp);
                    return (
                      <li key={c.id} className="flex items-center gap-2 text-xs">
                        {renderCheckIcon(
                          ok,
                          `${t(c.labelKey)}: ${ok ? t('admin.users.verification.checks.pass') : t('admin.users.verification.checks.fail')}`
                        )}
                        <span className="text-foreground">{t(c.labelKey)}</span>
                        <span className="sr-only">
                          {ok ? t('admin.users.verification.checks.pass') : t('admin.users.verification.checks.fail')}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Attached documents */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-foreground block">
                  {t('admin.users.verification.documents.title')}
                </span>
                {reviewingApp.documents.length === 0 ? (
                  <p className="text-xs text-muted-foreground">{t('admin.users.verification.documents.none')}</p>
                ) : (
                  <ul className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                    {reviewingApp.documents.map((doc) => (
                      <li key={doc.id}>
                        <button
                          type="button"
                          onClick={() =>
                            setInspectingDoc({
                              docName: doc.name,
                              fileName: doc.fileName,
                              fileSize: doc.fileSize,
                              companyName: reviewingApp.companyName,
                              nip: reviewingApp.nip,
                            })
                          }
                          className="w-full flex items-center justify-between gap-3 px-3 py-2 text-left hover:bg-muted/50 transition-colors"
                          aria-label={t('admin.users.verification.documents.inspectAria', { name: doc.name })}
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            <FileSearch className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                            <span className="min-w-0">
                              <span className="block text-xs font-semibold text-foreground truncate">{doc.name}</span>
                              <span className="block font-mono text-[10px] text-muted-foreground truncate">
                                {doc.fileName} ({doc.fileSize})
                              </span>
                            </span>
                          </span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground rtl:rotate-180 shrink-0" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Outcome for decided applications */}
              {reviewingApp.status === 'APPROVED' && (
                <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground">
                      {t('admin.users.verification.reviewDialog.outcome.approved')}
                    </span>
                    <span className="flex items-baseline gap-1.5">
                      <MoneyDisplay amount={reviewingApp.approvedCreditLimitPln || 0} variant="inline" emphasize />
                      <span className="text-xs text-muted-foreground">
                        {t(PAYMENT_TERMS_LABEL_KEY[reviewingApp.paymentTerms ?? 'NET_30'])}
                      </span>
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {reviewingApp.notes || t('admin.users.verification.reviewDialog.noNotes')}
                  </p>
                </div>
              )}

              {reviewingApp.status === 'REJECTED' && (
                <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1">
                  <span className="text-xs font-semibold text-foreground block">
                    {t('admin.users.verification.reviewDialog.outcome.rejected')}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {t('admin.users.verification.reviewDialog.rejectionReason')}:{' '}
                    {reviewingApp.rejectionReason || reviewingApp.notes || t('admin.users.verification.reviewDialog.noNotes')}
                  </p>
                </div>
              )}
            </div>
          )}

          {reviewingApp?.status === 'PENDING_AUDIT' && (
            <DialogFooter className="gap-2 sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5 text-destructive hover:text-destructive"
                onClick={() => startRejectFromReview(reviewingApp)}
                disabled={reviewMutation.isPending}
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                {t('admin.users.verification.reviewDialog.reject')}
              </Button>
              <Button
                size="sm"
                className="text-xs gap-1.5"
                onClick={() => startApproveFromReview(reviewingApp)}
                disabled={reviewMutation.isPending}
              >
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                {t('admin.users.verification.reviewDialog.approve')}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal: Approve & Grant Trade Credit (business logic unchanged) */}
      <Dialog open={!!approvingApp} onOpenChange={(open) => !open && setApprovingApp(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              {t('admin.users.verification.approveDialog.title')}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {t('admin.users.verification.approveDialog.org', {
                name: approvingApp?.companyName ?? '',
                nip: approvingApp?.nip ?? '',
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-xs py-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">
                  {t('admin.users.verification.approveDialog.limitLabel')}
                </Label>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {t('admin.users.verification.approveDialog.requestedHint', {
                    amount: (approvingApp?.requestedCreditLimitPln ?? 0).toLocaleString(),
                  })}
                </span>
              </div>
              <Input
                type="number"
                step="10000"
                value={approvedCreditLimit}
                onChange={(e) => setApprovedCreditLimit(Number(e.target.value))}
                className="font-mono text-base font-bold"
              />
              <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                {[50000, 100000, 250000, 500000].map((amt) => {
                  const active = approvedCreditLimit === amt;
                  return (
                    <Button
                      key={amt}
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setApprovedCreditLimit(amt)}
                      className={`h-7 px-2 text-[10px] font-mono ${
                        active ? 'border-primary bg-primary/10 text-primary font-semibold' : 'text-muted-foreground'
                      }`}
                    >
                      {amt.toLocaleString()} zł
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t('admin.users.verification.approveDialog.termsLabel')}
              </Label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value as 'NET_15' | 'NET_30' | 'NET_60')}
                className="w-full h-9 p-2 rounded-md border border-input bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {(['NET_15', 'NET_30', 'NET_60'] as const).map((term) => (
                  <option key={term} value={term}>
                    {t(PAYMENT_TERMS_LABEL_KEY[term])}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t('admin.users.verification.approveDialog.notesLabel')}
              </Label>
              <Input
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder={t('admin.users.verification.approveDialog.notesPlaceholder')}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setApprovingApp(null)}>
              {t('common.cancel')}
            </Button>
            <Button size="sm" onClick={handleConfirmApproval} disabled={reviewMutation.isPending}>
              {t('admin.users.verification.approveDialog.confirm')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Reject Application (business logic unchanged) */}
      <Dialog open={!!rejectingApp} onOpenChange={(open) => !open && setRejectingApp(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <X className="h-4 w-4 text-rose-600" aria-hidden="true" />
              {t('admin.users.verification.rejectDialog.title')}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {t('admin.users.verification.rejectDialog.org', { name: rejectingApp?.companyName ?? '' })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-xs py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t('admin.users.verification.rejectDialog.reasonLabel')}
              </Label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full h-9 p-2 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {REJECTION_REASONS.map((r) => (
                  <option key={r.id} value={r.value}>
                    {t(r.labelKey)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t('admin.users.verification.rejectDialog.notesLabel')}
              </Label>
              <Input
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                placeholder={t('admin.users.verification.rejectDialog.notesPlaceholder')}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setRejectingApp(null)}>
              {t('common.cancel')}
            </Button>
            <Button size="sm" variant="destructive" onClick={handleConfirmRejection} disabled={reviewMutation.isPending}>
              {t('admin.users.verification.rejectDialog.confirm')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Compliance Document Inspector (business logic unchanged) */}
      <Dialog open={!!inspectingDoc} onOpenChange={(open) => !open && setInspectingDoc(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <FileSearch className="h-4 w-4 text-primary" aria-hidden="true" />
              {t('admin.users.verification.docPreview.title')}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {t('admin.users.verification.docPreview.org', {
                name: inspectingDoc?.companyName ?? '',
                nip: inspectingDoc?.nip ?? '',
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 rounded-lg border border-border bg-muted/40 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border gap-2">
              <div className="min-w-0">
                <span className="font-semibold text-foreground block truncate">{inspectingDoc?.docName}</span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {inspectingDoc?.fileName} · {inspectingDoc?.fileSize}
                </span>
              </div>
              <StatusBadge
                tone="success"
                label={t('admin.users.verification.docPreview.signature')}
                size="sm"
              />
            </div>

            <div className="p-4 bg-card rounded-md border border-border space-y-1.5 font-mono text-muted-foreground">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground/70 border-b border-border pb-1">
                <span>{t('admin.users.verification.docPreview.reportRegistry')}</span>
                <span>{t('admin.users.verification.docPreview.reportDate')}</span>
              </div>
              <p>
                {t('admin.users.verification.docPreview.entity')}{' '}
                <strong className="text-foreground">{inspectingDoc?.companyName}</strong>
              </p>
              <p>
                {t('admin.users.verification.docPreview.nipLabel')}{' '}
                <strong className="text-foreground">{inspectingDoc?.nip}</strong>
              </p>
              <p>
                {t('admin.users.verification.docPreview.vatStatus')}{' '}
                <span className="text-emerald-600 font-bold">
                  {t('admin.users.verification.docPreview.vatActive')}
                </span>
              </p>
              <p>
                {t('admin.users.verification.docPreview.mpp')}{' '}
                <span className="text-emerald-600 font-bold">
                  {t('admin.users.verification.docPreview.mppRegistered')}
                </span>
              </p>
              <p className="text-[10px] text-muted-foreground/70 pt-2 border-t border-border mt-2">
                {t('admin.users.verification.docPreview.checksum')}
              </p>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between gap-2">
            <Button variant="outline" size="sm" onClick={() => setInspectingDoc(null)} className="text-xs">
              {t('admin.users.verification.docPreview.close')}
            </Button>
            <Button
              size="sm"
              className="text-xs gap-1.5"
              onClick={() => {
                toast.success(
                  t('admin.users.verification.docPreview.downloadStarted', { file: inspectingDoc?.fileName ?? '' })
                );
                setInspectingDoc(null);
              }}
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              {t('admin.users.verification.docPreview.download')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminKycVerificationQueuePage;
