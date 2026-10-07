import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { AlertTriangle, Plus, ShieldAlert, CheckCircle2, Clock, Check } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { FormFieldSelect, FormFieldNumber, FormFieldTextarea } from '@/components/forms/common';
import { MoneyDisplay } from '@/components/money-display';
import { PageHeader } from '@/components/page-header';
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
import { useClaimsQuery, useCreateClaimMutation, useOrdersQuery } from '@/hooks/useScmQueries';

export const Route = createFileRoute('/buyer/claims')({
    component: BuyerClaimsPage,
    staticData: { crumb: { label: 'nav.buyer.claims' } },
});

const reportClaimSchema = z.object({
    orderNumber: z.string().min(1, 'Order reference is required'),
    reasonType: z.string().min(1, 'Discrepancy category is required'),
    claimAmountPln: z.number().positive('Claim amount must be positive'),
    notes: z.string().min(5, 'Please provide details of the discrepancy'),
});

type ReportClaimFormData = z.infer<typeof reportClaimSchema>;

const DISCREPANCY_OPTIONS = [
    { value: 'DAMAGED_CARGO',     labelKey: 'buyer.claims.reasons.DAMAGED_CARGO' },
    { value: 'MISSING_QUANTITY',  labelKey: 'buyer.claims.reasons.MISSING_QUANTITY' },
    { value: 'QUALITY_DEFECT',    labelKey: 'buyer.claims.reasons.QUALITY_DEFECT' },
    { value: 'WRONG_ITEM',        labelKey: 'buyer.claims.reasons.WRONG_ITEM' },
] as const;

const CLAIM_STATUS_META = {
    APPROVED_CREDIT_NOTE: { tone: 'success' as const, labelKey: 'buyer.claims.status.approved' },
    UNDER_REVIEW:        { tone: 'warning' as const, labelKey: 'buyer.claims.status.underReview' },
};

function BuyerClaimsPage() {
    const { t } = useLocale();
    const { data: claims = [] } = useClaimsQuery();
    const { data: orders = [] } = useOrdersQuery();
    const createClaimMutation = useCreateClaimMutation();

    const [showClaimModal, setShowClaimModal] = useState(false);

    const orderOptions = orders.map((o) => ({
        value: o.orderNumber,
        label: `${o.orderNumber} • ${o.customerName} (${o.totalAmount.toLocaleString('pl-PL')} ${o.currency})`,
    }));

    const form = useForm<ReportClaimFormData>({
        resolver: zodResolver(reportClaimSchema),
        defaultValues: {
            orderNumber: orders[0]?.orderNumber || 'ORD-2026-0891',
            reasonType: 'DAMAGED_CARGO',
            claimAmountPln: 1200,
            notes: '',
        },
    });

    const onSubmitClaim = async (data: ReportClaimFormData) => {
        const selectedOrder = orders.find((o) => o.orderNumber === data.orderNumber);
        const categoryLabel =
            DISCREPANCY_OPTIONS.find((d) => d.value === data.reasonType)?.labelKey ?? data.reasonType;

        await createClaimMutation.mutateAsync({
            orderNumber: data.orderNumber,
            supplierName: selectedOrder?.customerName || 'Drewnex Palety Sp. z o.o.',
            reason: `${t(categoryLabel as any)}: ${data.notes}`,
            claimAmountPln: data.claimAmountPln,
            settlementType: t('buyer.claims.settlementUnderReview'),
        });

        toast.success(t('buyer.claims.submitSuccess'));
        setShowClaimModal(false);
        form.reset();
    };

    const discrepancyOptionsLocalized = DISCREPANCY_OPTIONS.map((o) => ({
        value: o.value,
        label: t(o.labelKey as any),
    }));

    return (
        <div className="space-y-6 max-w-7xl mx-auto min-w-0">
            <PageHeader
                title={
                    <span className="flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-amber-500" />
                        {t('buyer.pageTitle.claims')}
                    </span>
                }
                subtitle={t('buyer.pageTitle.claimsSubtitle')}
                actions={
                    <Button
                        size="sm"
                        onClick={() => setShowClaimModal(true)}
                        className="gap-2 shadow-xs cursor-pointer w-full sm:w-auto font-medium"
                    >
                        <Plus className="h-4 w-4" />
                        {t('buyer.claims.reportCta')}
                    </Button>
                }
            />

            <Card className="border-border shadow-2xs overflow-hidden bg-card">
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[760px]">
                        <caption className="sr-only">{t('buyer.pageTitle.claims')}</caption>
                        <thead className="bg-muted/40 border-b border-border text-muted-foreground whitespace-nowrap">
                            <tr>
                                <th className="py-3 px-4 font-semibold">{t('buyer.claims.table.claimNumber')}</th>
                                <th className="py-3 px-4 font-semibold">{t('buyer.claims.table.orderNumber')}</th>
                                <th className="py-3 px-4 font-semibold">{t('buyer.claims.table.supplier')}</th>
                                <th className="py-3 px-4 font-semibold">{t('buyer.claims.table.reason')}</th>
                                <th className="py-3 px-4 font-semibold text-right">{t('buyer.claims.table.amount')}</th>
                                <th className="py-3 px-4 font-semibold">{t('buyer.claims.table.date')}</th>
                                <th className="py-3 px-4 font-semibold">{t('buyer.claims.table.status')}</th>
                                <th className="py-3 px-4 font-semibold text-right">{t('buyer.claims.table.settlement')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border whitespace-nowrap">
                            {claims.map((claim) => {
                                const meta =
                                    CLAIM_STATUS_META[claim.status as keyof typeof CLAIM_STATUS_META] ??
                                    CLAIM_STATUS_META.UNDER_REVIEW;
                                return (
                                    <tr key={claim.id} className="hover:bg-muted/40">
                                        <td className="py-3 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                                            {claim.claimNumber}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-muted-foreground">{claim.orderNumber}</td>
                                        <td className="py-3 px-4 font-medium text-foreground">
                                            {claim.supplierName}
                                        </td>
                                        <td className="py-3 px-4 text-muted-foreground max-w-xs truncate">
                                            {claim.reason}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <MoneyDisplay amount={claim.claimAmountPln} variant="inline" emphasize />
                                        </td>
                                        <td className="py-3 px-4 text-muted-foreground">{claim.reportedDate}</td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${
                                                    meta.tone === 'success'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30'
                                                        : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30'
                                                }`}
                                            >
                                                {claim.status === 'APPROVED_CREDIT_NOTE' ? (
                                                    <CheckCircle2 className="h-3 w-3" />
                                                ) : (
                                                    <Clock className="h-3 w-3" />
                                                )}
                                                {t(meta.labelKey as any)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right font-medium text-muted-foreground">
                                            {claim.settlementType}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            <Dialog open={showClaimModal} onOpenChange={setShowClaimModal}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base font-bold">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            {t('buyer.claims.modalTitle')}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            {t('buyer.claims.modalDesc')}
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitClaim)} className="space-y-4 pt-2">
                            <FormFieldSelect
                                control={form.control}
                                name="orderNumber"
                                label={t('buyer.claims.form.orderLabel')}
                                options={
                                    orderOptions.length > 0
                                        ? orderOptions
                                        : [{ value: 'ORD-2026-0891', label: 'ORD-2026-0891' }]
                                }
                                className="font-mono text-xs"
                            />

                            <FormFieldSelect
                                control={form.control}
                                name="reasonType"
                                label={t('buyer.claims.form.reasonLabel')}
                                options={discrepancyOptionsLocalized}
                            />

                            <FormFieldNumber
                                control={form.control}
                                name="claimAmountPln"
                                label={t('buyer.claims.form.amountLabel')}
                                min={1}
                                step={50}
                                className="font-mono font-bold"
                            />

                            <FormFieldTextarea
                                control={form.control}
                                name="notes"
                                label={t('buyer.claims.form.notesLabel')}
                                placeholder={t('buyer.claims.form.notesPlaceholder')}
                                rows={3}
                                className="text-xs"
                            />

                            <DialogFooter className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowClaimModal(false)}
                                >
                                    {t('common.cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    className="gap-1.5 cursor-pointer font-medium"
                                >
                                    <Check className="h-3.5 w-3.5" />
                                    {t('buyer.claims.submit')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default BuyerClaimsPage;