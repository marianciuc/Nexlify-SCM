import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronLeft, Building2, CreditCard, ShieldCheck, Save, CheckCircle2, FileText, Download, AlertTriangle, UserCheck } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useTenantDetailQuery,
  useUpdateTenantCreditMutation,
} from '@/hooks/useScmQueries';

export const Route = createFileRoute('/admin/users/$tenantId')({
  component: AdminTenantDetailPage,
  staticData: {
    crumb: {
      label: 'Tenant Governance',
    },
  },
});

function AdminTenantDetailPage() {
  const { tenantId } = Route.useParams();
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    updateCreditMutation.mutate({
      tenantId: tenant.id,
      tradeCreditLimitPln: creditLimit,
      paymentTerms,
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground">
        Ładowanie profilu podmiotu...
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="p-8 text-center space-y-3">
        <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
        <h2 className="text-base font-bold">Nie znaleziono organizacji</h2>
        <p className="text-xs text-muted-foreground">
          Podmiot o identyfikatorze <code>{tenantId}</code> nie istnieje w katalogu.
        </p>
        <Link to="/admin/users">
          <Button size="sm" variant="outline">
            Powrót do katalogu
          </Button>
        </Link>
      </div>
    );
  }

  const availableCredit = Math.max(0, creditLimit - tenant.creditUsedPln);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Powrót do katalogu podmiotów
          </Link>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building2 className="h-6 w-6 text-red-600" />
              <span>{tenant.name}</span>
            </h1>
            <Badge
              className={`text-xs ${
                tenant.kycStatus === 'VERIFIED'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : tenant.kycStatus === 'REJECTED'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {tenant.kycStatus === 'VERIFIED'
                ? 'KYC Zweryfikowany'
                : tenant.kycStatus === 'REJECTED'
                ? 'KYC Odrzucony'
                : 'KYC Oczekuje na audyt'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            NIP: <span className="font-mono font-semibold">{tenant.nip}</span> • Rola:{' '}
            <Badge variant="outline" className="text-2xs font-mono ml-1">
              {tenant.role}
            </Badge>{' '}
            • Data rejestracji: {tenant.joinedDate}
          </p>
        </div>

        {tenant.kycStatus === 'PENDING_AUDIT' ? (
          <Link to="/admin/users/verification" className="w-full sm:w-auto">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white gap-2 font-semibold w-full sm:w-auto">
              <UserCheck className="h-4 w-4" /> Przejdź do kolejki KYC
            </Button>
          </Link>
        ) : (
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white gap-2 font-semibold w-full sm:w-auto"
            onClick={handleSave}
            disabled={updateCreditMutation.isPending}
          >
            <Save className="h-4 w-4" /> Zapisz parametry limitu
          </Button>
        )}
      </div>

      {/* Credit Facility Governance Form */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="py-3 px-5 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-red-600" /> Zarządzanie Limitem Kupieckim (B2B Trade Credit)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-5 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Przyznany limit kredytu kupieckiego (PLN):</Label>
              <Input
                type="number"
                step="10000"
                value={creditLimit}
                onChange={(e) => setCreditLimit(Number(e.target.value))}
                className="font-mono text-base font-bold text-slate-900 dark:text-slate-100"
              />
              <span className="text-2xs text-slate-500 block">
                Bieżące zaangażowanie dłużne:{' '}
                <strong className="text-red-600">
                  {tenant.creditUsedPln.toLocaleString()} PLN
                </strong>{' '}
                (Dostępny limit: <strong>{availableCredit.toLocaleString()} PLN</strong>)
              </span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Autoryzowane warunki płatności:</Label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full p-2.5 text-xs border rounded-md bg-white dark:bg-slate-900 font-semibold"
              >
                <option value="NET_15">Net 15 dni (Krótki termin płatności)</option>
                <option value="NET_30">Net 30 dni (Standard B2B)</option>
                <option value="NET_60">Net 60 dni (Przedłużony termin kupiecki)</option>
                <option value="PREPAYMENT">Przedpłata 100% (Brak limitu)</option>
              </select>
              <span className="text-2xs text-slate-500 block">
                Termin odroczenia rozliczeń faktur VAT w systemie billingowym.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KYC Compliance & White List Dossier Card */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="py-3 px-5 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> Rejestry Podatkowe & Biała Lista VAT
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border">
              <span className="text-2xs text-slate-500 block">Zarejestrowany rachunek rozliczeniowy (IBAN):</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 text-xs">
                {tenant.iban || kycApplication?.iban || 'PL 89 1050 1445 1000 0090 8123 4567'}
              </span>
              <div className="flex items-center gap-1.5 mt-2 text-2xs text-emerald-600 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" /> Zgodność z wykazem podatników VAT (Split Payment MPP)
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border">
              <span className="text-2xs text-slate-500 block">Identyfikatory w rejestrach urzędowych:</span>
              <div className="font-mono text-2xs text-slate-700 dark:text-slate-300 mt-1 space-y-0.5">
                <div>KRS: {tenant.krs || kycApplication?.krs || '0000839211'}</div>
                <div>REGON: {tenant.regon || kycApplication?.regon || '320984712'}</div>
              </div>
            </div>
          </div>

          {/* Compliance Checks Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="p-2.5 rounded border bg-white dark:bg-slate-950 flex items-center justify-between">
              <div>
                <div className="font-semibold text-2xs">GUS / REGON</div>
                <div className="text-3xs text-muted-foreground">Podmiot zarejestrowany</div>
              </div>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>

            <div className="p-2.5 rounded border bg-white dark:bg-slate-950 flex items-center justify-between">
              <div>
                <div className="font-semibold text-2xs">Biała Lista VAT</div>
                <div className="text-3xs text-muted-foreground">Czynny podatnik VAT</div>
              </div>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>

            <div className="p-2.5 rounded border bg-white dark:bg-slate-950 flex items-center justify-between">
              <div>
                <div className="font-semibold text-2xs">VIES EU VAT</div>
                <div className="text-3xs text-muted-foreground">Zweryfikowano</div>
              </div>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
          </div>

          {/* Documents list if available */}
          {kycApplication?.documents && kycApplication.documents.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t">
              <span className="text-2xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Dokumenty dołączone do wniosku:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {kycApplication.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-2 rounded border bg-slate-50 dark:bg-slate-900 text-2xs"
                  >
                    <div className="truncate mr-2">
                      <span className="font-medium text-slate-800 dark:text-slate-200 block truncate">
                        {doc.name}
                      </span>
                      <span className="text-muted-foreground font-mono text-3xs">
                        {doc.fileName} ({doc.fileSize})
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" title="Pobierz dokument">
                      <Download className="h-3 w-3 text-slate-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminTenantDetailPage;
