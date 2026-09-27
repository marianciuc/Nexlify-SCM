import {createFileRoute, Link, Outlet, useChildMatches} from '@tanstack/react-router';
import {Receipt, CreditCard} from 'lucide-react';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {useInvoicesQuery, usePayInvoiceMutation, INITIAL_INVOICES} from '@/hooks/useScmQueries';

export const Route = createFileRoute('/buyer/invoices')({
    component: BillingPage,
    staticData: {
        crumb: {
            label: 'Billing & Invoices',
        },
    },
});

function BillingPage() {
    const childMatches = useChildMatches();
    if (childMatches.length > 0) {
        return <Outlet />;
    }
    return <BillingPageContent />;
}

function BillingPageContent() {
    const {data: invoices = INITIAL_INVOICES} = useInvoicesQuery();
    const payMutation = usePayInvoiceMutation();

    const handlePayInvoice = (id: string, invoiceNumber: string) => {
        payMutation.mutate({id, invoiceNumber});
    };

    const totalNet = invoices.reduce((acc, inv) => acc + inv.netAmount, 0);
    const totalGross = invoices.reduce((acc, inv) => acc + inv.grossAmount, 0);
    const totalVat = invoices.reduce((acc, inv) => acc + inv.vatAmount, 0);

    return (
        <div className='space-y-6 max-w-7xl mx-auto'>
            {/* Header */}
            <div>
                <h1 className='text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2'>
                    <Receipt className='h-6 w-6 text-emerald-600' />
                    Billing, Faktura VAT & Polish Split Payment
                </h1>
                <p className='text-sm text-slate-500'>
                    B2B invoicing (23% VAT), deferred net-30 terms, and Stripe checkout integration
                </p>
            </div>

            {/* Financial Summary KPI Cards */}
            <div className='grid gap-4 md:grid-cols-3'>
                <Card className='border-slate-200/80 dark:border-slate-800 shadow-sm'>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-xs font-semibold text-slate-500 uppercase'>Total Net Billed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100'>
                            {totalNet.toLocaleString('pl-PL', {minimumFractionDigits: 2})}&nbsp;PLN
                        </div>
                        <p className='text-xs text-slate-500 mt-1'>Excluding VAT</p>
                    </CardContent>
                </Card>

                <Card className='border-slate-200/80 dark:border-slate-800 shadow-sm'>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-xs font-semibold text-slate-500 uppercase'>VAT 23% Segregated (MPP)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold tabular-nums text-emerald-600'>
                            {totalVat.toLocaleString('pl-PL', {minimumFractionDigits: 2})}&nbsp;PLN
                        </div>
                        <p className='text-xs text-slate-500 mt-1'>Split Payment sub-account</p>
                    </CardContent>
                </Card>

                <Card className='border-slate-200/80 dark:border-slate-800 shadow-sm'>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-xs font-semibold text-slate-500 uppercase'>Gross Receivables</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold tabular-nums text-primary'>
                            {totalGross.toLocaleString('pl-PL', {minimumFractionDigits: 2})}&nbsp;PLN
                        </div>
                        <p className='text-xs text-slate-500 mt-1'>Total with statutory VAT</p>
                    </CardContent>
                </Card>
            </div>

            {/* Invoices Table */}
            <Card className='border-slate-200/80 dark:border-slate-800 shadow-sm'>
                <CardHeader className='pb-3'>
                    <CardTitle className='text-base font-bold'>Issued Invoices (Faktury VAT)</CardTitle>
                </CardHeader>
                <CardContent className='p-0 overflow-x-auto'>
                    <table className='w-full text-sm text-left min-w-[750px]'>
                        <thead className='text-xs uppercase bg-slate-50 dark:bg-slate-900/60 text-slate-500 border-b border-slate-200/80 dark:border-slate-800'>
                            <tr>
                                <th className='px-4 py-3 font-semibold'>Invoice #</th>
                                <th className='px-4 py-3 font-semibold'>Buyer & NIP</th>
                                <th className='px-4 py-3 font-semibold text-right'>Net</th>
                                <th className='px-4 py-3 font-semibold text-right'>VAT (23%)</th>
                                <th className='px-4 py-3 font-semibold text-right'>Gross (Total)</th>
                                <th className='px-4 py-3 font-semibold'>Due Date</th>
                                <th className='px-4 py-3 font-semibold'>Status</th>
                                <th className='px-4 py-3 font-semibold text-right'>Action</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-slate-100 dark:divide-slate-800/80'>
                            {invoices.map(inv => (
                                <tr key={inv.id} className='hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors'>
                                    <td className='px-4 py-3 font-mono font-bold text-xs text-primary'>
                                        <Link
                                            to='/buyer/invoices/$invoiceId'
                                            params={{ invoiceId: inv.id }}
                                            className='hover:underline text-emerald-600'
                                        >
                                            {inv.invoiceNumber}
                                        </Link>
                                        <div className='text-[10px] text-slate-400 font-normal'>{inv.orderNumber}</div>
                                    </td>
                                    <td className='px-4 py-3 font-medium text-slate-900 dark:text-slate-100'>
                                        {inv.buyerName}
                                        <div className='text-xs text-slate-500 font-mono'>NIP: {inv.buyerNip}</div>
                                    </td>
                                    <td className='px-4 py-3 text-right font-medium tabular-nums text-slate-700 dark:text-slate-300'>
                                        {inv.netAmount.toFixed(2)}&nbsp;PLN
                                    </td>
                                    <td className='px-4 py-3 text-right text-xs tabular-nums text-slate-500'>
                                        {inv.vatAmount.toFixed(2)}&nbsp;PLN
                                    </td>
                                    <td className='px-4 py-3 text-right font-bold tabular-nums text-slate-900 dark:text-slate-100'>
                                        {inv.grossAmount.toFixed(2)}&nbsp;PLN
                                    </td>
                                    <td className='px-4 py-3 text-xs tabular-nums text-slate-600 dark:text-slate-400'>
                                        {inv.dueDate}
                                    </td>
                                    <td className='px-4 py-3'>
                                        <Badge variant='outline' className={`text-[10px] font-bold ${
                                            inv.paymentStatus === 'PAID'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : 'bg-amber-50 text-amber-700 border-amber-200'
                                        }`}>
                                            {inv.paymentStatus}
                                        </Badge>
                                    </td>
                                    <td className='px-4 py-3 text-right'>
                                        <div className='flex items-center justify-end gap-2'>
                                            <Link
                                                to='/buyer/invoices/$invoiceId'
                                                params={{ invoiceId: inv.id }}
                                                aria-label={`View details of invoice ${inv.invoiceNumber}`}
                                            >
                                                <Button variant='ghost' size='sm' className='h-7 text-xs'>
                                                    View
                                                </Button>
                                            </Link>
                                            {inv.paymentStatus === 'UNPAID' && (
                                                <Button
                                                    size='sm'
                                                    aria-label={`Pay invoice ${inv.invoiceNumber}`}
                                                    onClick={() => handlePayInvoice(inv.id, inv.invoiceNumber)}
                                                    className='h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white'
                                                >
                                                    <CreditCard className='h-3 w-3' aria-hidden="true" />
                                                    <span>Pay</span>
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}

export default BillingPage;
