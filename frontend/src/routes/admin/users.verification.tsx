import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronLeft, UserCheck, Building2, ShieldCheck, CheckCircle2, XCircle, FileText, Clock, ExternalLink, Download, Search, Copy, Check, Wallet, FileSearch, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { KycSubmissionModal } from '@/components/kyc/KycSubmissionModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useKycApplicationsQuery,
  useReviewKycMutation,
  type KycApplication,
} from '@/hooks/useScmQueries';

export const Route = createFileRoute('/admin/users/verification')({
  component: AdminKycVerificationQueuePage,
  staticData: {
    crumb: {
      label: 'KYC Queue',
    },
  },
});

function AdminKycVerificationQueuePage() {
  const { data: applications = [], isLoading } = useKycApplicationsQuery();
  const reviewMutation = useReviewKycMutation();

  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING_AUDIT' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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
  const [rejectionReason, setRejectionReason] = useState<string>(
    'Rachunek bankowy nie figuruje w wykazie Białej Listy Ministerstwa Finansów (Brak MPP)'
  );
  const [rejectionNotes, setRejectionNotes] = useState<string>('');

  const copyToClipboard = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Skopiowano ${label}: ${text}`);
    setTimeout(() => {
      setCopiedKey((curr) => (curr === key ? null : curr));
    }, 2000);
  };

  // KPIs
  const totalCount = applications.length;
  const pendingCount = applications.filter((a) => a.status === 'PENDING_AUDIT').length;
  const approvedCount = applications.filter((a) => a.status === 'APPROVED').length;
  const whiteListVerifiedCount = applications.filter((a) => a.whiteListAccountMatch).length;
  const totalGrantedCreditPln = applications
    .filter((a) => a.status === 'APPROVED')
    .reduce((acc, curr) => acc + (curr.approvedCreditLimitPln || 0), 0);

  const filteredApplications = applications.filter((app) => {
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

  const handleOpenApproveModal = (app: KycApplication) => {
    setApprovingApp(app);
    setApprovedCreditLimit(app.requestedCreditLimitPln || 100000);
    setPaymentTerms((app.paymentTerms as any) || 'NET_30');
    setApprovalNotes('Zweryfikowano w rejestrze podatników VAT. Zgodność rachunku MPP potwierdzona.');
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
    setRejectionReason('Rachunek bankowy nie figuruje w wykazie Białej Listy Ministerstwa Finansów (Brak MPP)');
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Powrót do katalogu organizacji (Tenants)
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-red-700 bg-red-50/80 dark:bg-red-950/30 border-red-200 text-xs gap-1.5 py-1">
            <ShieldCheck className="h-3.5 w-3.5 text-red-600" />
            Compliance & Biała Lista VAT MF
          </Badge>
          <KycSubmissionModal
            triggerButton={
              <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5 border-dashed border-red-300 hover:border-red-400 hover:bg-red-50/50">
                <Sparkles className="h-3.5 w-3.5 text-red-600" />
                + Nowy wniosek rejestracyjny
              </Button>
            }
          />
        </div>
      </div>

      {/* Main Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-red-100 dark:bg-red-950/50 text-red-600">
              <UserCheck className="h-6 w-6" />
            </span>
            Kolejka Weryfikacji Organizacji (KYC & Tax Registration)
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-3xl leading-relaxed">
            Weryfikacja podmiotów gospodarczych, automatyczna kontrola Białej Listy Podatników VAT (Ministerstwo Finansów),
            rejestrów KRS/GUS, licencji transportowych oraz nadawanie limitów kredytu kupieckiego Net-30 / Net-60.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider block">Wszystkie wnioski</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">{totalCount}</span>
              <span className="text-3xs text-slate-500 mt-1 block">Zarejestrowane w systemie</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Building2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 dark:border-amber-900/50 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-950/10 shadow-xs hover:border-amber-300 transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xs font-semibold text-amber-800 dark:text-amber-400 uppercase tracking-wider block">Oczekują na audyt</span>
                {pendingCount > 0 && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                )}
              </div>
              <span className="text-2xl font-bold text-amber-800 dark:text-amber-300 mt-0.5 block">{pendingCount}</span>
              <span className="text-3xs text-amber-700 dark:text-amber-400 mt-1 block">Wymaga decyzji Compliance</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/10 shadow-xs hover:border-emerald-300 transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-2xs font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">Biała Lista VAT MF</span>
              <span className="text-2xl font-bold text-emerald-800 dark:text-emerald-300 mt-0.5 block">{whiteListVerifiedCount} / {totalCount}</span>
              <span className="text-3xs text-emerald-700 dark:text-emerald-400 mt-1 block">Zgodność rachunku Split Payment</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/10 shadow-xs hover:border-blue-300 transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-2xs font-semibold text-blue-800 dark:text-blue-400 uppercase tracking-wider block">Przyznany limit kupiecki</span>
              <span className="text-xl font-bold font-mono text-blue-800 dark:text-blue-300 mt-0.5 block">
                {totalGrantedCreditPln.toLocaleString()} PLN
              </span>
              <span className="text-3xs text-blue-700 dark:text-blue-400 mt-1 block">{approvedCount} aktywnych limitów Net-30</span>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
              <Wallet className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            size="sm"
            variant={filterStatus === 'ALL' ? 'default' : 'ghost'}
            onClick={() => setFilterStatus('ALL')}
            className="text-xs h-8 rounded-lg"
          >
            Wszystkie ({totalCount})
          </Button>
          <Button
            size="sm"
            variant={filterStatus === 'PENDING_AUDIT' ? 'default' : 'ghost'}
            onClick={() => setFilterStatus('PENDING_AUDIT')}
            className={`text-xs h-8 gap-1.5 rounded-lg ${
              filterStatus === 'PENDING_AUDIT'
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            Do audytu ({pendingCount})
          </Button>
          <Button
            size="sm"
            variant={filterStatus === 'APPROVED' ? 'default' : 'ghost'}
            onClick={() => setFilterStatus('APPROVED')}
            className={`text-xs h-8 gap-1.5 rounded-lg ${
              filterStatus === 'APPROVED'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Zatwierdzone ({approvedCount})
          </Button>
          <Button
            size="sm"
            variant={filterStatus === 'REJECTED' ? 'default' : 'ghost'}
            onClick={() => setFilterStatus('REJECTED')}
            className={`text-xs h-8 gap-1.5 rounded-lg ${
              filterStatus === 'REJECTED'
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            <XCircle className="h-3.5 w-3.5" />
            Odrzucone ({applications.filter((a) => a.status === 'REJECTED').length})
          </Button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Szukaj po nazwie firmy, NIP, KRS..."
            className="pl-8 pr-8 text-xs h-8 bg-white dark:bg-slate-950 rounded-lg border-slate-200 dark:border-slate-800"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {isLoading ? (
          <div role="status" aria-live="polite" className="space-y-3 py-4 text-sm text-muted-foreground">
            <span>Загружаем заявки…</span>
            <div className="h-20 animate-pulse rounded-md bg-muted" />
            <div className="h-20 animate-pulse rounded-md bg-muted" />
          </div>
        ) : filteredApplications.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <UserCheck className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Brak wniosków spełniających kryteria filtru
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Wszystkie zgłoszenia KYC zostały przetworzone lub nie ma nowych rejestracji.
            </p>
          </Card>
        ) : (
          filteredApplications.map((app) => (
            <Card key={app.id} className="border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all overflow-hidden">
              <CardHeader className="bg-slate-50/80 dark:bg-slate-900/60 border-b py-3 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{app.companyName}</h3>
                      <Badge variant="outline" className="text-2xs font-mono font-semibold">
                        {app.role}
                      </Badge>
                    </div>
                    <div className="font-mono text-2xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span>NIP: <strong className="text-slate-700 dark:text-slate-300">{app.nip}</strong></span>
                      <button
                        onClick={() => copyToClipboard(app.nip, `nip-${app.id}`, 'NIP')}
                        className="text-slate-400 hover:text-slate-600 inline-flex items-center"
                        title="Kopiuj NIP"
                      >
                        {copiedKey === `nip-${app.id}` ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                      <span>• KRS: {app.krs} • REGON: {app.regon}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-2xs text-muted-foreground font-mono hidden sm:inline-block">
                    Złożono: {app.submittedDate}
                  </span>
                  <Badge
                    className={
                      app.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold'
                        : app.status === 'REJECTED'
                        ? 'bg-red-50 text-red-700 border-red-200 text-xs font-semibold'
                        : 'bg-amber-50 text-amber-700 border-amber-200 text-xs font-semibold'
                    }
                  >
                    {app.status === 'APPROVED'
                      ? 'ZATWIERDZONY'
                      : app.status === 'REJECTED'
                      ? 'ODRZUCONY'
                      : 'OCZEKUJE NA AUDYT'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4 text-xs">
                {/* Bank Account & White List Verification */}
                <div className="p-3 bg-slate-50/70 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-2xs text-slate-500 block">Rachunek bankowy do rozliczeń (Split Payment):</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 text-xs">
                        {app.iban}
                      </span>
                      <button
                        onClick={() => copyToClipboard(app.iban, `iban-${app.id}`, 'IBAN')}
                        className="text-slate-400 hover:text-slate-600 inline-flex items-center"
                        title="Kopiuj numer konta"
                      >
                        {copiedKey === `iban-${app.id}` ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {app.whiteListAccountMatch ? (
                      <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-2xs gap-1.5 py-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Biała Lista MF: Zgodny
                      </Badge>
                    ) : (
                      <Badge className="bg-rose-100 text-rose-800 text-2xs gap-1.5 py-1">
                        <XCircle className="h-3.5 w-3.5 text-rose-600" /> Niezgodność konta
                      </Badge>
                    )}

                    <div className="text-right pl-3 border-l border-slate-200 dark:border-slate-800">
                      <span className="text-2xs text-slate-500 block">Wnioskowany limit:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">
                        {app.requestedCreditLimitPln?.toLocaleString()} PLN
                      </span>
                    </div>
                  </div>
                </div>

                {/* Automated Registry Checks Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  <div className="p-2.5 rounded-lg border bg-white dark:bg-slate-950 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200 text-2xs">Baza GUS / REGON</div>
                      <div className="text-2xs text-slate-500">Podmiot aktywny</div>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  </div>

                  <div className="p-2.5 rounded-lg border bg-white dark:bg-slate-950 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200 text-2xs">Biała Lista VAT (MF)</div>
                      <div className="text-2xs text-slate-500">Czynny podatnik VAT</div>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  </div>

                  <div className="p-2.5 rounded-lg border bg-white dark:bg-slate-950 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200 text-2xs">VIES EU VAT</div>
                      <div className="text-2xs text-slate-500">Wewnątrzwspólnotowy</div>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  </div>

                  <div className="p-2.5 rounded-lg border bg-white dark:bg-slate-950 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200 text-2xs">Listy Sankcyjne & PEP</div>
                      <div className="text-2xs text-slate-500">Brak naruszeń</div>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  </div>
                </div>

                {/* Attached Compliance Documents */}
                {app.documents && app.documents.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-2xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" /> Załączone dokumenty rejestrowe i licencje:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {app.documents.map((doc) => (
                        <div
                          key={doc.id}
                          onClick={() =>
                            setInspectingDoc({
                              docName: doc.name,
                              fileName: doc.fileName,
                              fileSize: doc.fileSize,
                              companyName: app.companyName,
                              nip: app.nip,
                            })
                          }
                          className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-2xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer group"
                        >
                          <div className="truncate mr-2 flex items-center gap-2">
                            <FileSearch className="h-4 w-4 text-slate-400 group-hover:text-red-600 transition-colors shrink-0" />
                            <div className="truncate">
                              <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate group-hover:text-red-700 dark:group-hover:text-red-400">
                                {doc.name}
                              </span>
                              <span className="text-muted-foreground font-mono text-3xs">
                                {doc.fileName} ({doc.fileSize})
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0 group-hover:bg-white dark:group-hover:bg-slate-900"
                            title="Podgląd dokumentu"
                          >
                            <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-red-600" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Outcome Display for Approved/Rejected */}
                {app.status === 'APPROVED' && (
                  <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 block text-xs">
                        Zweryfikowano przez Compliance • Przyznano limit Net-30
                      </span>
                      <span className="text-2xs text-emerald-700 dark:text-emerald-400">
                        {app.notes || 'Pełna zgodność z wymogami podatkowymi i rejestrowymi.'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xs text-slate-500 block">Aktywny limit kupiecki:</span>
                      <span className="font-mono font-bold text-emerald-700 text-sm">
                        {(app.approvedCreditLimitPln || 0).toLocaleString()} PLN ({app.paymentTerms || 'Net 30'})
                      </span>
                    </div>
                  </div>
                )}

                {app.status === 'REJECTED' && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 rounded-lg">
                    <span className="font-bold text-rose-800 dark:text-rose-300 block text-xs">
                      Wniosek odrzucony przez Compliance
                    </span>
                    <span className="text-2xs text-rose-700 dark:text-rose-400">
                      Powód: {app.rejectionReason || app.notes || 'Niespełnione kryteria formalne.'}
                    </span>
                  </div>
                )}

                {/* Pending Actions */}
                {app.status === 'PENDING_AUDIT' && (
                  <div className="flex justify-end gap-3 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                      onClick={() => handleOpenRejectModal(app)}
                      disabled={reviewMutation.isPending}
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Odrzuć rejestrację
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 font-semibold"
                      onClick={() => handleOpenApproveModal(app)}
                      disabled={reviewMutation.isPending}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Zatwierdź & Nadaj limit kupiecki
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal: Approve & Grant Trade Credit */}
      <Dialog open={!!approvingApp} onOpenChange={(open) => !open && setApprovingApp(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
              Zatwierdzenie organizacji i nadanie limitu
            </DialogTitle>
            <DialogDescription className="text-xs">
              Organizacja: <strong>{approvingApp?.companyName}</strong> (NIP {approvingApp?.nip})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-xs py-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Przyznany limit kredytu kupieckiego (PLN):</Label>
                <span className="text-3xs text-muted-foreground">
                  Wnioskowano: {approvingApp?.requestedCreditLimitPln?.toLocaleString()} PLN
                </span>
              </div>
              <Input
                type="number"
                step="10000"
                value={approvedCreditLimit}
                onChange={(e) => setApprovedCreditLimit(Number(e.target.value))}
                className="font-mono text-base font-bold text-emerald-700 dark:text-emerald-400"
              />
              <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                {[50000, 100000, 250000, 500000].map((amt) => (
                  <Button
                    key={amt}
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setApprovedCreditLimit(amt)}
                    className={`text-2xs h-6 px-2 ${
                      approvedCreditLimit === amt
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 font-bold'
                        : 'text-slate-600'
                    }`}
                  >
                    {amt.toLocaleString()} zł
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Warunki płatności (Termin odroczenia):</Label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value as any)}
                className="w-full p-2 border rounded text-xs bg-white dark:bg-slate-900 font-semibold"
              >
                <option value="NET_15">Net 15 dni (Krótki termin)</option>
                <option value="NET_30">Net 30 dni (Standard B2B)</option>
                <option value="NET_60">Net 60 dni (Rozszerzony limit)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Notatka z audytu compliance:</Label>
              <Input
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="np. Zweryfikowano w Białej Liście MF, KRS aktualny."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" size="sm" onClick={() => setApprovingApp(null)}>
              Anuluj
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              onClick={handleConfirmApproval}
              disabled={reviewMutation.isPending}
            >
              Potwierdź i aktywuj organizację
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Reject Application */}
      <Dialog open={!!rejectingApp} onOpenChange={(open) => !open && setRejectingApp(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-rose-700">
              <XCircle className="h-5 w-5" />
              Odrzucenie wniosku rejestracyjnego
            </DialogTitle>
            <DialogDescription className="text-xs">
              Organizacja: <strong>{rejectingApp?.companyName}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-xs py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Powód odmowy weryfikacji:</Label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2 border rounded text-xs bg-white dark:bg-slate-900"
              >
                <option value="Rachunek bankowy nie figuruje w wykazie Białej Listy Ministerstwa Finansów (Brak MPP)">
                  Rachunek bankowy nie figuruje w wykazie Białej Listy MF (Brak MPP)
                </option>
                <option value="Niezgodność danych reprezentacji z Krajowym Rejestrem Sądowym (KRS)">
                  Niezgodność danych reprezentacji z KRS / CEIDG
                </option>
                <option value="Brak wymaganej licencji transportowej GITD na przewóz rzeczy">
                  Brak wymaganej licencji transportowej GITD
                </option>
                <option value="Podmiot wykreślony z rejestru czynnych podatników VAT">
                  Podmiot wykreślony z rejestru czynnych podatników VAT
                </option>
                <option value="Negatywna ocena ryzyka kredytowego i historii płatności">
                  Negatywna ocena ryzyka kredytowego
                </option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Dodatkowe zalecenia dla podmiotu:</Label>
              <Input
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                placeholder="np. Zaktualizuj numer konta w urzędzie skarbowym i złóż wniosek ponownie."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" size="sm" onClick={() => setRejectingApp(null)}>
              Anuluj
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleConfirmRejection}
              disabled={reviewMutation.isPending}
            >
              Potwierdź odrzucenie
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Interactive Compliance Document Inspector */}
      <Dialog open={!!inspectingDoc} onOpenChange={(open) => !open && setInspectingDoc(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <FileSearch className="h-5 w-5 text-red-600" />
              Podgląd dokumentu compliance
            </DialogTitle>
            <DialogDescription className="text-xs">
              Organizacja: <strong>{inspectingDoc?.companyName}</strong> (NIP: {inspectingDoc?.nip})
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs">
                  {inspectingDoc?.docName}
                </span>
                <span className="font-mono text-3xs text-slate-500">
                  {inspectingDoc?.fileName} • {inspectingDoc?.fileSize}
                </span>
              </div>
              <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-3xs gap-1">
                <CheckCircle2 className="h-3 w-3" /> Podpis kwalifikowany eIDAS
              </Badge>
            </div>

            <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border text-2xs space-y-2 font-mono text-slate-600 dark:text-slate-400">
              <div className="flex items-center justify-between text-3xs text-slate-400 border-b pb-1">
                <span>REJESTR PAŃSTWOWY RP (BIAŁA LISTA MF)</span>
                <span>DATA RAPORTU: 2026-09-28</span>
              </div>
              <p>Podmiot gospodarczy: <strong className="text-slate-800 dark:text-slate-200">{inspectingDoc?.companyName}</strong></p>
              <p>Identyfikator podatkowy NIP: <strong className="text-slate-800 dark:text-slate-200">{inspectingDoc?.nip}</strong></p>
              <p>Status podatnika: <span className="text-emerald-600 font-bold">CZYNNY PODATNIK VAT</span></p>
              <p>Mechanizm podzielonej płatności (MPP): <span className="text-emerald-600 font-bold">TAK - ZAREJESTROWANY</span></p>
              <p className="text-3xs text-slate-400 pt-2 border-t mt-2">
                Suma kontrolna SHA-256: 4e9f7a812b03c94d8ef51...d8a2bc
              </p>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between gap-2">
            <Button variant="outline" size="sm" onClick={() => setInspectingDoc(null)} className="text-xs">
              Zamknij podgląd
            </Button>
            <Button
              size="sm"
              className="text-xs gap-1.5 bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                toast.success(`Rozpoczęto pobieranie: ${inspectingDoc?.fileName}`);
                setInspectingDoc(null);
              }}
            >
              <Download className="h-3.5 w-3.5" /> Pobierz oryginał PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
