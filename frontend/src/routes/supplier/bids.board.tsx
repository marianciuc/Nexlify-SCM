import {createFileRoute, Link} from '@tanstack/react-router';
import {
    FileText,
    Gavel,
    Clock,
    DollarSign,
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import { useOpenRfqsQuery } from '@/hooks/useScmQueries';
import useEnvironmentStore from '@/service/env/environment-store';
import type {RfqItem} from '@/types/scm-domain';

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
    const {data: rfqs = [], isLoading, isError} = useOpenRfqsQuery();

    const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [activeRfqId, setActiveRfqId] = useState<string | null>(null);

    const activeRfqForBids = activeRfqId ? (rfqs.find((r) => r.id === activeRfqId) || null) : null;

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
            case 'DRAFT':
                return <Badge variant='outline' className='bg-muted text-muted-foreground border-border'>Черновик</Badge>;
            case 'OPEN':
                return <Badge variant='outline' className='bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400'>Открыт для предложений</Badge>;
            case 'EVALUATION':
                return <Badge variant='outline' className='bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400'>На оценке</Badge>;
            case 'AWARDED':
                return <Badge variant='outline' className='bg-purple-500/10 text-purple-700 border-purple-500/20 dark:text-purple-400'>Контракт заключен</Badge>;
            case 'CLOSED':
                return <Badge variant='outline' className='bg-muted text-muted-foreground border-border'>Закрыт</Badge>;
        }
    };

    return (
        <div className='flex flex-col gap-6 max-w-7xl mx-auto'>
            {/* Header */}
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                <div>
                    <h1 className='text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5'>
                        <div className='w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold'>
                            <Gavel className='h-5 w-5' />
                        </div>
                        Биржа тендеров B2B (Торги и RFQ)
                    </h1>
                    <p className='text-sm text-muted-foreground mt-1'>
                        Реверсивные аукционы, подача предложений поставщиками и контрактация для <strong>{currentTenant.name}</strong>
                    </p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                <Card className='border-border shadow-xs'>
                    <CardHeader className='flex flex-row items-center justify-between pb-2'>
                        <CardTitle className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>Активные тендеры</CardTitle>
                        <FileText className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-extrabold text-foreground'>
                            {rfqs.filter(r => r.status === 'OPEN' || r.status === 'EVALUATION').length}
                        </div>
                        <p className='text-xs text-muted-foreground mt-1 flex items-center gap-1'>
                            <span className='text-emerald-600 dark:text-emerald-400 font-semibold'>+2 новых</span> на этой неделе
                        </p>
                    </CardContent>
                </Card>

                <Card className='border-border shadow-xs'>
                    <CardHeader className='flex flex-row items-center justify-between pb-2'>
                        <CardTitle className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>Получено предложений</CardTitle>
                        <DollarSign className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-extrabold text-foreground'>
                            {rfqs.reduce((acc, r) => acc + r.bids.length, 0)}
                        </div>
                        <p className='text-xs text-muted-foreground mt-1 flex items-center gap-1'>
                            <span className='text-emerald-600 dark:text-emerald-400 font-semibold'>3.2 предложения</span> в среднем на тендер
                        </p>
                    </CardContent>
                </Card>

                <Card className='border-border shadow-xs'>
                    <CardHeader className='flex flex-row items-center justify-between pb-2'>
                        <CardTitle className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>Снижение стоимости</CardTitle>
                        <TrendingDown className='h-4 w-4 text-indigo-600 dark:text-indigo-400' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-extrabold text-foreground'>
                            7.4%
                        </div>
                        <p className='text-xs text-muted-foreground mt-1 flex items-center gap-1'>
                            Ниже начального лимита бюджета
                        </p>
                    </CardContent>
                </Card>

                <Card className='border-border shadow-xs'>
                    <CardHeader className='flex flex-row items-center justify-between pb-2'>
                        <CardTitle className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>Контрактованный объем</CardTitle>
                        <Award className='h-4 w-4 text-purple-600 dark:text-purple-400' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-extrabold text-foreground'>
                            {rfqs.filter(r => r.status === 'AWARDED').reduce((acc, r) => acc + (r.awardedAmount || r.targetBudget), 0).toLocaleString('ru-RU')} PLN
                        </div>
                        <p className='text-xs text-muted-foreground mt-1'>
                            Фактура VAT формируется автоматически
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter and Search Bar */}
            <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border shadow-xs'>
                <div className='flex flex-wrap items-center gap-1.5'>
                    {[
                        { id: 'ALL', label: 'Все' },
                        { id: 'OPEN', label: 'Открытые' },
                        { id: 'EVALUATION', label: 'Оценка' },
                        { id: 'AWARDED', label: 'Завершенные' },
                    ].map(st => (
                        <button
                            key={st.id}
                            onClick={() => setSelectedStatus(st.id)}
                            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                                selectedStatus === st.id
                                    ? 'bg-primary text-white shadow-xs'
                                    : 'text-muted-foreground hover:bg-muted'
                            }`}
                        >
                            {st.label}
                        </button>
                    ))}
                </div>
                <div className='w-full sm:w-72'>
                    <Input
                        placeholder='Поиск тендеров по SKU, категории, номеру...'
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className='h-8 text-xs bg-background border-input'
                    />
                </div>
            </div>

            {/* RFQ Tender List */}
            <div className='grid grid-cols-1 gap-4'>
                {isLoading ? (
                    <div role="status" className="py-12 text-center text-sm text-muted-foreground">Загружаем открытые запросы…</div>
                ) : isError ? (
                    <div role="alert" className="py-12 text-center text-sm text-destructive">Не удалось загрузить запросы. Обновите страницу или попробуйте позже.</div>
                ) : filtered.length === 0 ? (
                    <div className="py-12 text-center text-sm text-muted-foreground">Подходящих открытых запросов пока нет.</div>
                ) : filtered.map(rfq => (
                    <Card key={rfq.id} className='border-border shadow-xs hover:border-primary/40 transition-all'>
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

                                    <h3 className='text-base font-bold text-foreground'>
                                        {rfq.title}
                                    </h3>

                                    <p className='text-xs text-muted-foreground line-clamp-2'>
                                        {rfq.description}
                                    </p>

                                    <div className='flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1'>
                                        <span className='flex items-center gap-1'>
                                            <Building2 className='h-3.5 w-3.5 text-muted-foreground' />
                                            {rfq.issuerName}
                                        </span>
                                        <span className='flex items-center gap-1'>
                                            <MapPin className='h-3.5 w-3.5 text-muted-foreground' />
                                            {rfq.deliveryLocation}
                                        </span>
                                        <span className='flex items-center gap-1'>
                                            <Clock className='h-3.5 w-3.5 text-muted-foreground' />
                                            Срок: {rfq.deadline}
                                        </span>
                                    </div>
                                </div>

                                {/* Financial & Action Column */}
                                <div className='flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 lg:min-w-[200px] border-t lg:border-t-0 pt-3 lg:pt-0'>
                                    <div className='text-left lg:text-right'>
                                        <span className='text-[11px] text-muted-foreground uppercase tracking-wider block font-semibold'>
                                            {rfq.status === 'AWARDED' ? 'Сумма контракта' : 'Лимит бюджета'}
                                        </span>
                                        <div className='text-lg font-extrabold text-foreground'>
                                            {(rfq.awardedAmount || rfq.targetBudget).toLocaleString('ru-RU', {minimumFractionDigits: 2})} {rfq.currency}
                                        </div>
                                        <span className='text-[11px] text-muted-foreground'>
                                            Потребность: {rfq.requiredQuantity} {rfq.unitOfMeasure}
                                        </span>
                                    </div>

                                    <div className='flex items-center gap-2 w-full sm:w-auto'>
                                        {rfq.bids.length > 0 && (
                                            <Button
                                                variant='outline'
                                                size='sm'
                                                onClick={() => setActiveRfqId(rfq.id)}
                                                className='text-xs gap-1.5 border-border'
                                            >
                                                <span>Предложения ({rfq.bids.length})</span>
                                                <ArrowUpRight className='h-3.5 w-3.5' />
                                            </Button>
                                        )}

                                        {rfq.status !== 'AWARDED' && rfq.status !== 'CLOSED' && (
                                            <Link to="/supplier/bids/$rfqId/submit" params={{ rfqId: rfq.id }}>
                                                <Button
                                                    size='sm'
                                                    className='gap-1.5 bg-amber-600 hover:bg-amber-700 text-white shadow-xs font-semibold'
                                                >
                                                    <Send className='h-3.5 w-3.5' />
                                                    <span>Подать предложение</span>
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Award banner if awarded */}
                            {rfq.status === 'AWARDED' && (
                                <div className='mt-4 p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-between text-xs'>
                                    <div className='flex items-center gap-2 text-purple-800 dark:text-purple-300'>
                                        <ShieldCheck className='h-4 w-4 text-purple-600 dark:text-purple-400' />
                                        <span>Победитель: <strong>{rfq.awardedSupplierName}</strong> на сумму <strong>{rfq.awardedAmount?.toLocaleString('ru-RU')} {rfq.currency}</strong></span>
                                    </div>
                                    <Badge variant='outline' className='bg-card text-purple-700 dark:text-purple-300 border-purple-500/30 text-[10px]'>
                                        SLA проверен
                                    </Badge>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Modal: View Bids & Award Contract */}
            <Dialog open={Boolean(activeRfqForBids)} onOpenChange={(open) => !open && setActiveRfqId(null)}>
                <DialogContent className='max-w-2xl w-full p-6 flex flex-col gap-4 max-h-[85vh] overflow-y-auto'>
                    {activeRfqForBids && (
                        <>
                            <DialogHeader className='border-b pb-3 border-border'>
                                <DialogTitle className='text-lg font-bold flex items-center gap-2'>
                                    <Gavel className='h-5 w-5 text-indigo-600' />
                                    Конкурентные предложения по {activeRfqForBids.rfqNumber}
                                </DialogTitle>
                                <DialogDescription className='text-xs text-muted-foreground'>
                                    Целевой бюджет: {activeRfqForBids.targetBudget.toLocaleString('ru-RU')} {activeRfqForBids.currency} | Потребность: {activeRfqForBids.requiredQuantity} {activeRfqForBids.unitOfMeasure}
                                </DialogDescription>
                            </DialogHeader>

                            <div className='space-y-3'>
                                {activeRfqForBids.bids.map((bid) => {
                                    const savings = activeRfqForBids.targetBudget - bid.bidAmount;
                                    const savingsPct = ((savings / activeRfqForBids.targetBudget) * 100).toFixed(1);

                                    return (
                                        <div
                                            key={bid.id}
                                            className={`p-4 rounded-xl border transition-all ${
                                                bid.status === 'ACCEPTED'
                                                    ? 'bg-purple-500/10 border-purple-500/30'
                                                    : 'bg-muted/40 border-border hover:border-primary/40'
                                            }`}
                                        >
                                            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
                                                <div>
                                                    <div className='flex items-center gap-2'>
                                                        <span className='font-bold text-sm text-foreground'>
                                                            {bid.supplierName || 'Участник тендера'}
                                                        </span>
                                                        {bid.supplierNip && <Badge variant='outline' className='text-[10px]'>NIP: {bid.supplierNip}</Badge>}
                                                        {bid.status === 'ACCEPTED' && (
                                                            <Badge className='bg-purple-600 text-white text-[10px]'>ПОБЕДИТЕЛЬ</Badge>
                                                        )}
                                                    </div>
                                                    <p className='text-xs text-muted-foreground mt-1'>
                                                        Срок поставки: <strong>{bid.leadTimeDays} раб. дней</strong> | Гарантия: {bid.warrantyTerms}
                                                    </p>
                                                    {bid.notes && (
                                                        <p className='text-xs italic text-muted-foreground mt-1'>"{bid.notes}"</p>
                                                    )}
                                                </div>

                                                <div className='flex sm:flex-col items-end justify-between sm:justify-center gap-2'>
                                                    <div className='text-right'>
                                                        <div className='text-base font-extrabold text-foreground'>
                                                            {bid.bidAmount.toLocaleString('ru-RU', {minimumFractionDigits: 2})} {bid.currency}
                                                        </div>
                                                        {savings > 0 && (
                                                            <span className='text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold'>
                                                                -{savingsPct}% к бюджету
                                                            </span>
                                                        )}
                                                    </div>

                                                    {bid.supplierId === currentTenant.id && <span className='text-xs text-muted-foreground'>Это ваше предложение</span>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
}

export default RfqMarketplacePage;
