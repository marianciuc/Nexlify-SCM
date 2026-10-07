import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import {
  FileCheck,
  Printer,
  ShieldCheck,
  PenTool,
  Check,
  Eye,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { FormFieldInput, FormFieldTextarea } from '@/components/forms/common';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useLocale } from '@/hooks/useLocale';
import { useEcmrQuery, useSignEcmrMutation, type EcmrDocument } from '@/hooks/useScmQueries';
import { type TranslationPath } from '@/types/generated-locale';

export const Route = createFileRoute('/logistics/ecmr')({
  component: LogisticsEcmrPage,
  staticData: {
    crumb: {
      label: 'nav.logistics.ecmr',
    },
  },
});

const signPodSchema = z.object({
  signerName: z.string().min(2, 'signerNameRequired'),
  recipientPin: z.string().min(4, 'recipientPinRequired'),
  notes: z.string().optional(),
});

type SignPodFormData = z.infer<typeof signPodSchema>;

type SignatureStatus = EcmrDocument['signatureStatus'];

const SIGNATURE_TONE: Record<SignatureStatus, 'success' | 'warning'> = {
  SIGNED_ON_GLASS: 'success',
  PENDING_UNLOADING: 'warning',
};

const SIGNATURE_LABEL_KEY: Record<SignatureStatus, TranslationPath> = {
  SIGNED_ON_GLASS: 'logistics.ecmr.status.signed',
  PENDING_UNLOADING: 'logistics.ecmr.status.pending',
};

function LogisticsEcmrPage() {
  return <LogisticsEcmrContent />;
}

function LogisticsEcmrContent() {
  const { t } = useLocale();
  const { data: docs = [] } = useEcmrQuery();
  const signMutation = useSignEcmrMutation();

  const [activeDoc, setActiveDoc] = useState<EcmrDocument | null>(null);
  const [showSignModal, setShowSignModal] = useState<boolean>(false);

  const form = useForm<SignPodFormData>({
    resolver: zodResolver(signPodSchema),
    defaultValues: {
      signerName: '',
      recipientPin: '1234',
      notes: t('logistics.ecmr.signDialog.notesDefault'),
    },
  });

  const handleOpenSignModal = (doc: EcmrDocument) => {
    setActiveDoc(doc);
    form.reset({
      signerName: doc.consigneeName.split('(')[0]?.trim() || '',
      recipientPin: '1234',
      notes: t('logistics.ecmr.signDialog.notesDefault'),
    });
    setShowSignModal(true);
  };

  const onConfirmSign = async (data: SignPodFormData) => {
    if (!activeDoc) return;
    await signMutation.mutateAsync({
      cmrId: activeDoc.id,
      signerName: data.signerName,
    });
    setShowSignModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto min-w-0">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            {t('logistics.ecmr.title')}
          </span>
        }
        subtitle={t('logistics.ecmr.subtitle')}
      />

      <Card className="border-border shadow-xs overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[860px]">
            <caption className="sr-only">{t('logistics.ecmr.title')}</caption>
            <thead className="bg-muted/40 border-b border-border text-muted-foreground whitespace-nowrap uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">{t('logistics.ecmr.table.number')}</th>
                <th className="py-3 px-4">{t('logistics.ecmr.table.order')}</th>
                <th className="py-3 px-4">{t('logistics.ecmr.table.route')}</th>
                <th className="py-3 px-4">{t('logistics.ecmr.table.vehicle')}</th>
                <th className="py-3 px-4">{t('logistics.ecmr.table.issued')}</th>
                <th className="py-3 px-4">{t('logistics.ecmr.table.delivered')}</th>
                <th className="py-3 px-4">{t('logistics.ecmr.table.status')}</th>
                <th className="py-3 px-4 text-right sr-only">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {docs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                    <FileCheck className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" aria-hidden="true" />
                    <p className="font-semibold text-foreground">{t('logistics.ecmr.empty.title')}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('logistics.ecmr.empty.subtitle')}</p>
                  </td>
                </tr>
              ) : (
                docs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-foreground whitespace-nowrap">
                      {doc.cmrNumber}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {doc.orderNumber}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-foreground text-xs">{doc.consigneeName}</div>
                      <div className="text-xs text-muted-foreground">{doc.destinationCity}</div>
                    </td>
                    <td className="py-3 px-4 text-foreground text-xs whitespace-nowrap">
                      {doc.carrierName}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      <span dir="ltr">{doc.signedTimestamp ?? '—'}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      <span dir="ltr">{doc.signatureStatus === 'SIGNED_ON_GLASS' ? doc.signedTimestamp : '—'}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge tone={SIGNATURE_TONE[doc.signatureStatus]} label={t(SIGNATURE_LABEL_KEY[doc.signatureStatus])} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {doc.signatureStatus === 'PENDING_UNLOADING' && (
                          <Button
                            size="xs"
                            onClick={() => handleOpenSignModal(doc)}
                            aria-label={t('logistics.ecmr.actions.signAria', { cmr: doc.cmrNumber })}
                            className="gap-1 font-medium"
                          >
                            <PenTool className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{t('logistics.ecmr.actions.sign')}</span>
                          </Button>
                        )}
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => window.print()}
                          aria-label={t('logistics.ecmr.actions.printAria', { cmr: doc.cmrNumber })}
                          className="gap-1 text-muted-foreground hover:text-foreground"
                        >
                          <Printer className="h-3.5 w-3.5" aria-hidden="true" />
                          <span className="sr-only sm:not-sr-only">{t('logistics.ecmr.actions.print')}</span>
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          aria-label={t('logistics.ecmr.actions.viewAria', { cmr: doc.cmrNumber })}
                          className="gap-1 text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                          <span className="sr-only">{t('logistics.ecmr.actions.view')}</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Sign on Glass POD Dialog */}
      <Dialog open={showSignModal} onOpenChange={setShowSignModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <ShieldCheck className="h-5 w-5 text-emerald-600" aria-hidden="true" />
              {t('logistics.ecmr.signDialog.title')}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {t('logistics.ecmr.signDialog.body', { cmr: activeDoc?.cmrNumber ?? '', order: activeDoc?.orderNumber ?? '' })}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onConfirmSign)} className="space-y-4 pt-2">
              <FormFieldInput
                control={form.control}
                name="signerName"
                label={t('logistics.ecmr.signDialog.signerLabel')}
                placeholder={t('logistics.ecmr.signDialog.signerPlaceholder')}
                className="text-xs font-semibold"
              />

              <FormFieldInput
                control={form.control}
                name="recipientPin"
                label={t('logistics.ecmr.signDialog.pinLabel')}
                placeholder={t('logistics.ecmr.signDialog.pinPlaceholder')}
                className="text-xs font-mono font-bold"
              />

              <FormFieldTextarea
                control={form.control}
                name="notes"
                label={t('logistics.ecmr.signDialog.notesLabel')}
                rows={2}
                className="text-xs"
              />

              <div className="rounded-md border border-border bg-muted/40 p-3 text-center">
                <div className="text-[10px] font-bold text-foreground/70 uppercase tracking-wider mb-1">
                  {t('logistics.ecmr.signDialog.handshakeLabel')}
                </div>
                <div className="font-serif italic text-base text-foreground border-b border-border py-1 inline-block min-w-[180px]">
                  {form.watch('signerName') || t('logistics.ecmr.signDialog.handshakePlaceholder')}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  {t('logistics.ecmr.signDialog.handshakeHelper')}
                </div>
              </div>

              <DialogFooter className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSignModal(false)}
                  className="gap-1"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="gap-1.5 font-medium"
                >
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('logistics.ecmr.signDialog.confirm')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default LogisticsEcmrPage;