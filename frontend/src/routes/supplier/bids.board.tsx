import {createFileRoute, Link} from '@tanstack/react-router';
import {
    FileText,
    Plus,
    Gavel,
    Clock,
    DollarSign,
    CheckCircle2,
    Building2,
    MapPin,
    ArrowUpRight,
    TrendingDown,
    Award,
    ShieldCheck,
    Send,
} from 'lucide-react';
import {useState} from 'react';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
    useRfqsQuery,
    useCreateRfqMutation,
    useSubmitBidMutation,
    useAwardBidMutation,
} from '@/hooks/useScmQueries';
import useEnvironmentStore from '@/service/env/environment-store';
import type {Bid, RfqItem} from '@/types/scm-domain';

export const Route = createFileRoute('/supplier/bids/board')({
    component: RfqMarketplacePage,
    staticData: {
        crumb: {
            label: 'RFQ Tenders',
        },
    },
});

function RfqMarketplacePage() {
    const {currentTenant} = useEnvironmentStore();
    const {data: rfqs = []} = useRfqsQuery();
    const createRfqMutation = useCreateRfqMutation();
    const submitBidMutation = useSubmitBidMutation();
    const awardBidMutation = useAwardBidMutation();

    const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [activeRfqId, setActiveRfqId] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
    const [showBidModal, setShowBidModal] = useState<boolean>(false);
    const [bidRfq, setBidRfq] = useState<RfqItem | null>(null);

    // Form state for creating RFQ
    const [newTitle, setNewTitle] = useState('');
    const [newCategory, setNewCategory] = useState('Packaging Materials');
    const [newBudget, setNewBudget] = useState('45000');
    const [newLocation, setNewLocation] = useState('Warszawa Central DC');
    const [newQty, setNewQty] = useState('500');
    const [newUom, setNewUom] = useState('pcs');

    // Form state for placing Bid
    const [supplierName, setSupplierName] = useState('Apex Supply Solutions Sp. z o.o.');
    const [bidPrice, setBidPrice] = useState('');
    const [leadDays, setLeadDays] = useState('4');
    const [bidNotes, setBidNotes] = useState('');

    const activeRfqForBids = activeRfqId ? (rfqs.find((r) => r.id === activeRfqId) || null) : null;

    const handleCreateRfq = (e: React.FormEvent) => {
        e.preventDefault();
        const created: RfqItem = {
            id: 'rfq-' + Math.random().toString(36).substring(2, 9),
            rfqNumber: `RFQ-2026-${1000 + rfqs.length + 1}`,
            title: newTitle,
            category: newCategory,
            description: `Procurement request for ${newQty} ${newUom} delivered to ${newLocation}.`,
            issuerName: currentTenant.name,
            deliveryLocation: newLocation,
            deadline: '2026-10-15',
            targetBudget: Number(newBudget),
            currency: 'PLN',
            status: 'OPEN',
            requiredQuantity: Number(newQty),
            unitOfMeasure: newUom,
            createdAt: 'Just now',
            bids: [],
        };

        createRfqMutation.mutate(created);
        setShowCreateModal(false);
        setNewTitle('');
    };

    const handleOpenBidModal = (rfq: RfqItem) => {
        setBidRfq(rfq);
        setBidPrice(String(Math.round(rfq.targetBudget * 0.94)));
        setShowBidModal(true);
    };

    const handleSubmitBid = (e: React.FormEvent) => {
        e.preventDefault();
        if (!bidRfq) return;

        const newBid: Bid = {
            id: 'bid-' + Math.random().toString(36).substring(2, 9),
            rfqId: bidRfq.id,
            supplierName: supplierName || 'Apex Supply Solutions Sp. z o.o.',
            supplierNip: '5271928374',
            bidAmount: Number(bidPrice),
            currency: bidRfq.currency,
            leadTimeDays: Number(leadDays),
            warrantyTerms: '12 months verified standard B2B SLA',
            status: 'PENDING',
            notes: bidNotes || 'Competitive quotation with immediate allocation.',
            submittedAt: 'Just now',
        };

        submitBidMutation.mutate({rfqId: bidRfq.id, bid: newBid});
        setShowBidModal(false);
        setBidNotes('');
    };

    const handleAwardBid = (rfqId: string, bidId: string) => {
        awardBidMutation.mutate({rfqId, bidId});
        setActiveRfqId(null);
    };

    const filtered = rfqs.filter(r => {
        const matchesStatus = selectedStatus === 'ALL' || r.status === selectedStatus;
        const matchesSearch = searchQuery === '' ||
            r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.rfqNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusBadge = (status: RfqItem['status']) => {
        switch (status) {
            case 'OPEN':
                return <Badge variant='outline' className='bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'>Open for Bids</Badge>;
            case 'EVALUATION':
                return <Badge variant='outline' className='bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300'>In Evaluation</Badge>;
            case 'AWARDED':
                return <Badge variant='outline' className='bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300'>Contract Awarded</Badge>;
            case 'CLOSED':
                return <Badge variant='outline' className='bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400'>Closed</Badge>;
        }
    };

    return (
        <div className='flex flex-col gap-6 max-w-7xl mx-auto'>
            {/* Header */}
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                <div>
                    <h1 className='text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5'>
                        <div className='w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/10'>
                            <Gavel className='h-5 w-5' />
                        </div>
                        B2B Tender Exchange (RFQ Engine)
                    </h1>
                    <p className='text-sm text-slate-500 mt-1'>
                        Decentralized reverse auctions, supplier bidding and automated contract awards for <strong>{currentTenant.name}</strong>
                    </p>
                </div>
                <div className='flex items-center gap-3'>
                    <Button onClick={() => setShowCreateModal(true)} className='gap-2 shadow-sm bg-primary hover:bg-primary/90 text-white'>
                        <Plus className='h-4 w-4' />
                        Create B2B Tender
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                <Card className='border-slate-200/80 dark:border-slate-800 shadow-xs'>
                    <CardHeader className='flex flex-row items-center justify-between pb-2'>
                        <CardTitle className='text-xs font-semibold text-slate-500 uppercase tracking-wider'>Active Tenders</CardTitle>
                        <FileText className='h-4 w-4 text-blue-600' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-extrabold text-slate-900 dark:text-slate-100'>
                            {rfqs.filter(r => r.status === 'OPEN' || r.status === 'EVALUATION').length}
                        </div>
                        <p className='text-xs text-slate-500 mt-1 flex items-center gap-1'>
                            <span className='text-emerald-600 font-semibold'>+2 new</span> this week
                        </p>
                    </CardContent>
                </Card>

                <Card className='border-slate-200/80 dark:border-slate-800 shadow-xs'>
                    <CardHeader className='flex flex-row items-center justify-between pb-2'>
                        <CardTitle className='text-xs font-semibold text-slate-500 uppercase tracking-wider'>Total Bids Received</CardTitle>
                        <DollarSign className='h-4 w-4 text-emerald-600' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-extrabold text-slate-900 dark:text-slate-100'>
                            {rfqs.reduce((acc, r) => acc + r.bids.length, 0)}
                        </div>
                        <p className='text-xs text-slate-500 mt-1 flex items-center gap-1'>
                            <span className='text-emerald-600 font-semibold'>3.2 bids</span> avg per tender
                        </p>
                    </CardContent>
                </Card>

                <Card className='border-slate-200/80 dark:border-slate-800 shadow-xs'>
                    <CardHeader className='flex flex-row items-center justify-between pb-2'>
                        <CardTitle className='text-xs font-semibold text-slate-500 uppercase tracking-wider'>Average Cost Reduction</CardTitle>
                        <TrendingDown className='h-4 w-4 text-indigo-600' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-extrabold text-slate-900 dark:text-slate-100'>
                            7.4%
                        </div>
                        <p className='text-xs text-slate-500 mt-1 flex items-center gap-1'>
                            Below initial target budget
                        </p>
                    </CardContent>
                </Card>

                <Card className='border-slate-200/80 dark:border-slate-800 shadow-xs'>
                    <CardHeader className='flex flex-row items-center justify-between pb-2'>
                        <CardTitle className='text-xs font-semibold text-slate-500 uppercase tracking-wider'>Awarded Volume</CardTitle>
                        <Award className='h-4 w-4 text-purple-600' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-extrabold text-slate-900 dark:text-slate-100'>
                            {rfqs.filter(r => r.status === 'AWARDED').reduce((acc, r) => acc + (r.awardedAmount || r.targetBudget), 0).toLocaleString('pl-PL')} PLN
                        </div>
                        <p className='text-xs text-slate-500 mt-1'>
                            Faktura VAT generated automatically
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter and Search Bar */}
            <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800'>
                <div className='flex flex-wrap items-center gap-1.5'>
                    {['ALL', 'OPEN', 'EVALUATION', 'AWARDED'].map(st => (
                        <button
                            key={st}
                            onClick={() => setSelectedStatus(st)}
                            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                                selectedStatus === st
                                    ? 'bg-primary text-white shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            {st}
                        </button>
                    ))}
                </div>
                <div className='w-full sm:w-72'>
                    <Input
                        placeholder='Search tenders by SKU, category or number...'
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className='h-8 text-xs'
                    />
                </div>
            </div>

            {/* RFQ Tender List */}
            <div className='grid grid-cols-1 gap-4'>
                {filtered.map(rfq => (
                    <Card key={rfq.id} className='border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all'>
                        <CardContent className='p-5'>
                            <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
                                <div className='space-y-2 flex-1'>
                                    <div className='flex flex-wrap items-center gap-2'>
                                        <span className='font-mono font-bold text-xs text-primary px-2 py-0.5 rounded bg-primary/10'>
                                            {rfq.rfqNumber}
                                        </span>
                                        <Badge variant='outline' className='text-[11px] font-medium'>
                                            {rfq.category}
                                        </Badge>
                                        {getStatusBadge(rfq.status)}
                                    </div>

                                    <h3 className='text-base font-bold text-slate-900 dark:text-slate-100'>
                                        {rfq.title}
                                    </h3>

                                    <p className='text-xs text-slate-500 line-clamp-2'>
                                        {rfq.description}
                                    </p>

                                    <div className='flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1'>
                                        <span className='flex items-center gap-1'>
                                            <Building2 className='h-3.5 w-3.5 text-slate-400' />
                                            {rfq.issuerName}
                                        </span>
                                        <span className='flex items-center gap-1'>
                                            <MapPin className='h-3.5 w-3.5 text-slate-400' />
                                            {rfq.deliveryLocation}
                                        </span>
                                        <span className='flex items-center gap-1'>
                                            <Clock className='h-3.5 w-3.5 text-slate-400' />
                                            Deadline: {rfq.deadline}
                                        </span>
                                    </div>
                                </div>

                                {/* Financial & Action Column */}
                                <div className='flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 lg:min-w-[200px] border-t lg:border-t-0 pt-3 lg:pt-0'>
                                    <div className='text-left lg:text-right'>
                                        <span className='text-[11px] text-slate-400 uppercase tracking-wider block font-semibold'>
                                            {rfq.status === 'AWARDED' ? 'Contract Value' : 'Target Budget'}
                                        </span>
                                        <div className='text-lg font-extrabold text-slate-900 dark:text-slate-100'>
                                            {(rfq.awardedAmount || rfq.targetBudget).toLocaleString('pl-PL', {minimumFractionDigits: 2})} {rfq.currency}
                                        </div>
                                        <span className='text-[11px] text-slate-500'>
                                            {rfq.requiredQuantity} {rfq.unitOfMeasure} required
                                        </span>
                                    </div>

                                    <div className='flex items-center gap-2 w-full sm:w-auto'>
                                        {rfq.bids.length > 0 && (
                                            <Button
                                                variant='outline'
                                                size='sm'
                                                onClick={() => setActiveRfqId(rfq.id)}
                                                className='text-xs gap-1.5 border-slate-300 dark:border-slate-700'
                                            >
                                                <span>Bids ({rfq.bids.length})</span>
                                                <ArrowUpRight className='h-3.5 w-3.5' />
                                            </Button>
                                        )}

                                        {rfq.status !== 'AWARDED' && rfq.status !== 'CLOSED' && (
                                            <Link to="/supplier/bids/$rfqId/submit" params={{ rfqId: rfq.id }}>
                                                <Button
                                                    size='sm'
                                                    className='text-xs gap-1.5 bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                                                >
                                                    <Send className='h-3.5 w-3.5' />
                                                    <span>Submit Proposal (P19)</span>
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Award banner if awarded */}
                            {rfq.status === 'AWARDED' && (
                                <div className='mt-4 p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 flex items-center justify-between text-xs'>
                                    <div className='flex items-center gap-2 text-purple-800 dark:text-purple-300'>
                                        <ShieldCheck className='h-4 w-4 text-purple-600' />
                                        <span>Winner: <strong>{rfq.awardedSupplierName}</strong> at <strong>{rfq.awardedAmount?.toLocaleString('pl-PL')} {rfq.currency}</strong></span>
                                    </div>
                                    <Badge variant='outline' className='bg-white text-purple-700 border-purple-300 text-[10px]'>
                                        SLA Verified
                                    </Badge>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Modal: View Bids & Award Contract */}
            {activeRfqForBids && (
                <div className='fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4'>
                    <div className='bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4 max-h-[85vh] overflow-y-auto'>
                        <div className='flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800'>
                            <div>
                                <h2 className='text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2'>
                                    <Gavel className='h-5 w-5 text-indigo-600' />
                                    Competing Bids for {activeRfqForBids.rfqNumber}
                                </h2>
                                <p className='text-xs text-slate-500'>
                                    Target Budget: {activeRfqForBids.targetBudget.toLocaleString('pl-PL')} {activeRfqForBids.currency} | Required: {activeRfqForBids.requiredQuantity} {activeRfqForBids.unitOfMeasure}
                                </p>
                            </div>
                            <Button variant='ghost' size='sm' onClick={() => setActiveRfqId(null)}>✕</Button>
                        </div>

                        <div className='space-y-3'>
                            {activeRfqForBids.bids.map((bid) => {
                                const savings = activeRfqForBids.targetBudget - bid.bidAmount;
                                const savingsPct = ((savings / activeRfqForBids.targetBudget) * 100).toFixed(1);

                                return (
                                    <div
                                        key={bid.id}
                                        className={`p-4 rounded-xl border transition-all ${
                                            bid.status === 'ACCEPTED'
                                                ? 'bg-purple-50/60 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800'
                                                : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                                        }`}
                                    >
                                        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
                                            <div>
                                                <div className='flex items-center gap-2'>
                                                    <span className='font-bold text-sm text-slate-900 dark:text-slate-100'>
                                                        {bid.supplierName}
                                                    </span>
                                                    <Badge variant='outline' className='text-[10px]'>NIP: {bid.supplierNip}</Badge>
                                                    {bid.status === 'ACCEPTED' && (
                                                        <Badge className='bg-purple-600 text-white text-[10px]'>AWARDED</Badge>
                                                    )}
                                                </div>
                                                <p className='text-xs text-slate-500 mt-1'>
                                                    Lead Time: <strong>{bid.leadTimeDays} business days</strong> | Warranty: {bid.warrantyTerms}
                                                </p>
                                                {bid.notes && (
                                                    <p className='text-xs italic text-slate-400 mt-1'>"{bid.notes}"</p>
                                                )}
                                            </div>

                                            <div className='flex sm:flex-col items-end justify-between sm:justify-center gap-2'>
                                                <div className='text-right'>
                                                    <div className='text-base font-extrabold text-slate-900 dark:text-slate-100'>
                                                        {bid.bidAmount.toLocaleString('pl-PL', {minimumFractionDigits: 2})} {bid.currency}
                                                    </div>
                                                    {savings > 0 && (
                                                        <span className='text-[11px] text-emerald-600 font-semibold'>
                                                            -{savingsPct}% vs budget
                                                        </span>
                                                    )}
                                                </div>

                                                {activeRfqForBids.status !== 'AWARDED' && (
                                                    <Button
                                                        size='sm'
                                                        onClick={() => handleAwardBid(activeRfqForBids.id, bid.id)}
                                                        className='bg-purple-600 hover:bg-purple-700 text-white text-xs h-7 gap-1'
                                                    >
                                                        <CheckCircle2 className='h-3.5 w-3.5' />
                                                        Award Contract
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Create Tender */}
            {showCreateModal && (
                <div className='fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4'>
                    <div className='bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4'>
                        <div className='flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800'>
                            <h2 className='text-lg font-bold text-slate-900 dark:text-slate-100'>Publish B2B Tender (RFQ)</h2>
                            <Button variant='ghost' size='sm' onClick={() => setShowCreateModal(false)}>✕</Button>
                        </div>
                        <form onSubmit={handleCreateRfq} className='space-y-3.5 text-xs'>
                            <div>
                                <Label htmlFor='title'>Tender Title / Spec</Label>
                                <Input
                                    id='title'
                                    placeholder='e.g. Procurement of 1,000 Hydraulic Pallet Jacks'
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    required
                                    className='mt-1 text-xs'
                                />
                            </div>

                            <div className='grid grid-cols-2 gap-3'>
                                <div>
                                    <Label htmlFor='category'>Category</Label>
                                    <Input
                                        id='category'
                                        value={newCategory}
                                        onChange={e => setNewCategory(e.target.value)}
                                        className='mt-1 text-xs'
                                    />
                                </div>
                                <div>
                                    <Label htmlFor='budget'>Budget Limit (PLN)</Label>
                                    <Input
                                        id='budget'
                                        type='number'
                                        value={newBudget}
                                        onChange={e => setNewBudget(e.target.value)}
                                        className='mt-1 text-xs'
                                    />
                                </div>
                            </div>

                            <div className='grid grid-cols-2 gap-3'>
                                <div>
                                    <Label htmlFor='qty'>Required Quantity</Label>
                                    <Input
                                        id='qty'
                                        type='number'
                                        value={newQty}
                                        onChange={e => setNewQty(e.target.value)}
                                        className='mt-1 text-xs'
                                    />
                                </div>
                                <div>
                                    <Label htmlFor='uom'>Unit of Measure</Label>
                                    <Input
                                        id='uom'
                                        value={newUom}
                                        onChange={e => setNewUom(e.target.value)}
                                        className='mt-1 text-xs'
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor='location'>Delivery Hub</Label>
                                <Input
                                    id='location'
                                    value={newLocation}
                                    onChange={e => setNewLocation(e.target.value)}
                                    className='mt-1 text-xs'
                                />
                            </div>

                            <div className='flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800'>
                                <Button type='button' variant='outline' size='sm' onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </Button>
                                <Button type='submit' size='sm' className='bg-primary text-white'>
                                    Publish Tender
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Submit Bid */}
            {showBidModal && bidRfq && (
                <div className='fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4'>
                    <div className='bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4'>
                        <div className='flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800'>
                            <h2 className='text-base font-bold text-slate-900 dark:text-slate-100'>Submit Quotation (Bid)</h2>
                            <Button variant='ghost' size='sm' onClick={() => setShowBidModal(false)}>✕</Button>
                        </div>
                        <p className='text-xs text-slate-500'>
                            Bidding for: <strong>{bidRfq.title}</strong> (Target budget: {bidRfq.targetBudget.toLocaleString('pl-PL')} {bidRfq.currency})
                        </p>
                        <form onSubmit={handleSubmitBid} className='space-y-3 text-xs'>
                            <div>
                                <Label htmlFor='supName'>Supplier Entity</Label>
                                <Input
                                    id='supName'
                                    value={supplierName}
                                    onChange={e => setSupplierName(e.target.value)}
                                    required
                                    className='mt-1 text-xs'
                                />
                            </div>

                            <div className='grid grid-cols-2 gap-3'>
                                <div>
                                    <Label htmlFor='price'>Offered Total (PLN)</Label>
                                    <Input
                                        id='price'
                                        type='number'
                                        value={bidPrice}
                                        onChange={e => setBidPrice(e.target.value)}
                                        required
                                        className='mt-1 text-xs font-bold'
                                    />
                                </div>
                                <div>
                                    <Label htmlFor='lead'>Lead Time (Days)</Label>
                                    <Input
                                        id='lead'
                                        type='number'
                                        value={leadDays}
                                        onChange={e => setLeadDays(e.target.value)}
                                        required
                                        className='mt-1 text-xs'
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor='notes'>Commercial Proposal Notes</Label>
                                <Input
                                    id='notes'
                                    placeholder='Payment terms, delivery guarantees, quality ISO...'
                                    value={bidNotes}
                                    onChange={e => setBidNotes(e.target.value)}
                                    className='mt-1 text-xs'
                                />
                            </div>

                            <div className='flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800'>
                                <Button type='button' variant='outline' size='sm' onClick={() => setShowBidModal(false)}>
                                    Cancel
                                </Button>
                                <Button type='submit' size='sm' className='bg-indigo-600 hover:bg-indigo-700 text-white'>
                                    Submit Offer
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RfqMarketplacePage;
