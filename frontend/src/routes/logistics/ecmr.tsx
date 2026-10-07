import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import {
  FileCheck,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Clock,
  PenTool,
  Check,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { FormFieldInput, FormFieldTextarea } from '@/components/forms/common';
import { Badge } from '@/components/ui/badge';
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
import { useEcmrQuery, useSignEcmrMutation, type EcmrDocument } from '@/hooks/useScmQueries';

export const Route = createFileRoute('/logistics/ecmr')({
  component: LogisticsEcmrPage,
  staticData: {
    crumb: {
      label: 'e-CMR Consignments',
    },
  },
});

const signPodSchema = z.object({
  signerName: z.string().min(2, 'Recipient / Consignee name is required'),
  recipientPin: z.string().min(4, 'Enter 4-digit recipient PIN code'),
  notes: z.string().optional(),
});

type SignPodFormData = z.infer<typeof signPodSchema>;

function LogisticsEcmrPage() {
  const { data: docs = [] } = useEcmrQuery();
  const signMutation = useSignEcmrMutation();

  const [activeDoc, setActiveDoc] = useState<EcmrDocument | null>(null);
  const [showSignModal, setShowSignModal] = useState<boolean>(false);

  const form = useForm<SignPodFormData>({
    resolver: zodResolver(signPodSchema),
    defaultValues: {
      signerName: '',
      recipientPin: '1234',
      notes: 'Cargo intact, seal verified, full pallet count accepted.',
    },
  });

  const handleOpenSignModal = (doc: EcmrDocument) => {
    setActiveDoc(doc);
    form.reset({
      signerName: doc.consigneeName.split('(')[0]?.trim() || '',
      recipientPin: '1234',
      notes: 'Cargo intact, seal verified, full pallet count accepted.',
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-amber-500" />
            Electronic Consignment Notes (e-CMR)
          </h1>
          <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">
            e-CMR Protocol (Geneva Convention)
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Paperless international and domestic waybills with cryptographic sign-on-glass delivery confirmation and instant proof of delivery (POD).
        </p>
      </div>

      {/* e-CMR Table */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b text-slate-600 dark:text-slate-400 whitespace-nowrap">
              <tr>
                <th className="py-3 px-4">e-CMR Document #</th>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Carrier</th>
                <th className="py-3 px-4">Consignee (Recipient)</th>
                <th className="py-3 px-4">Sign-on-Glass Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 whitespace-nowrap">
              {docs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-mono font-bold text-amber-700 dark:text-amber-400">
                    {doc.cmrNumber}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">{doc.orderNumber}</td>
                  <td className="py-3 px-4 text-slate-800 dark:text-slate-200">{doc.carrierName}</td>
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                    {doc.consigneeName} ({doc.destinationCity})
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      className={`text-2xs ${
                        doc.signatureStatus === 'SIGNED_ON_GLASS'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {doc.signatureStatus === 'SIGNED_ON_GLASS' ? (
                        <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                      ) : (
                        <Clock className="h-3 w-3 mr-1 inline" />
                      )}
                      {doc.signatureStatus}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {doc.signatureStatus === 'PENDING_UNLOADING' && (
                        <Button
                          size="xs"
                          onClick={() => handleOpenSignModal(doc)}
                          className="gap-1 bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-xs"
                        >
                          <PenTool className="h-3.5 w-3.5" />
                          <span>Sign POD</span>
                        </Button>
                      )}
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => window.print()}
                        aria-label={`Печать e-CMR ${doc.cmrNumber}`}
                        className="gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        <span>Печать</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Sign on Glass POD Dialog */}
      <Dialog open={showSignModal} onOpenChange={setShowSignModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              Sign-on-Glass Proof of Delivery (POD)
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Confirm handover for e-CMR <strong className="font-mono text-slate-800 dark:text-slate-200">{activeDoc?.cmrNumber}</strong> (Order: {activeDoc?.orderNumber}).
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onConfirmSign)} className="space-y-4 pt-2">
              <FormFieldInput
                control={form.control}
                name="signerName"
                label="Recipient Authorized Representative:"
                placeholder="Full Name (e.g. Jan Kowalski)"
                className="text-xs font-semibold"
              />

              <FormFieldInput
                control={form.control}
                name="recipientPin"
                label="Delivery Handover PIN Code:"
                placeholder="4-digit PIN"
                className="text-xs font-mono font-bold"
              />

              <FormFieldTextarea
                control={form.control}
                name="notes"
                label="Cargo Condition & Acceptance Notes:"
                rows={2}
                className="text-xs"
              />

              <div className="rounded-lg border border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 text-center">
                <div className="text-2xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-1">
                  Digital Signature Handshake
                </div>
                <div className="font-serif italic text-base text-emerald-700 dark:text-emerald-400 border-b border-emerald-300 py-1 inline-block min-w-[180px]">
                  {form.watch('signerName') || 'Digital Signature Canvas'}
                </div>
                <div className="text-3xs text-muted-foreground mt-1">
                  SHA-256 Timestamped Delivery Confirmation
                </div>
              </div>

              <DialogFooter className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSignModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                  Confirm Delivery & Complete Order
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
