import {createFileRoute} from '@tanstack/react-router';
import {
    BarChart3,
    TrendingUp,
    Clock,
    ShieldCheck,
    Truck,
    Layers,
    Warehouse,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
} from 'lucide-react';
import {toast} from 'sonner';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {INITIAL_KPIS, useAnalyticsKpiQuery} from '@/hooks/useScmQueries';
import useEnvironmentStore from '@/service/env/environment-store';

export const Route = createFileRoute('/admin/analytics')({
    component: AnalyticsDashboardPage,
    staticData: {
        crumb: {
            label: 'Analytics',
        },
    },
});

const OTIF_TRENDS = [
    {period: 'May 2026', otif: 96.2, onTime: 97.5, inFull: 98.1, delayed: 2.5},
    {period: 'Jun 2026', otif: 97.1, onTime: 98.0, inFull: 98.8, delayed: 2.0},
    {period: 'Jul 2026', otif: 96.8, onTime: 97.8, inFull: 98.4, delayed: 2.2},
    {period: 'Aug 2026', otif: 98.0, onTime: 98.9, inFull: 99.1, delayed: 1.1},
    {period: 'Sep 2026', otif: 98.4, onTime: 99.2, inFull: 99.2, delayed: 0.8},
];

const CORRIDORS = [
    {corridor: 'Warszawa Hub -> Katowice DC', avgDays: 1.2, benchmarkDays: 2.0, status: 'OPTIMAL', distanceKm: 295, loadFactor: 92},
    {corridor: 'Szczecin Port -> Warszawa Hub', avgDays: 2.4, benchmarkDays: 3.0, status: 'OPTIMAL', distanceKm: 565, loadFactor: 88},
    {corridor: 'Gdańsk Terminal -> Katowice DC', avgDays: 2.8, benchmarkDays: 3.5, status: 'OPTIMAL', distanceKm: 520, loadFactor: 85},
    {corridor: 'Wrocław Depot -> Poznań Hub', avgDays: 1.1, benchmarkDays: 1.5, status: 'OPTIMAL', distanceKm: 180, loadFactor: 94},
    {corridor: 'Szczecin -> Hamburg (Cross-border)', avgDays: 3.1, benchmarkDays: 4.0, status: 'ATTENTION', distanceKm: 370, loadFactor: 79},
];

const WAREHOUSES = [
    {warehouse: 'Warszawa Central Hub (DC-01)', turnoverRatio: 14.2, target: 12.0, daysOnHand: 25.7, utilizationPct: 88},
    {warehouse: 'Katowice Logistics Park (DC-02)', turnoverRatio: 18.5, target: 15.0, daysOnHand: 19.7, utilizationPct: 82},
    {warehouse: 'Szczecin Cross-dock Terminal (DC-03)', turnoverRatio: 22.1, target: 20.0, daysOnHand: 16.5, utilizationPct: 76},
    {warehouse: 'Gdańsk Reefer Cold Storage (DC-04)', turnoverRatio: 16.8, target: 14.0, daysOnHand: 21.7, utilizationPct: 91},
];

function AnalyticsDashboardPage() {
    const {currentTenant} = useEnvironmentStore();
    const {data: kpis = INITIAL_KPIS, isFetching: loading, refetch} = useAnalyticsKpiQuery();

    const handleRefresh = async () => {
        await refetch();
        toast.success('Analytics KPIs refreshed from Analytics Service (:8087)');
    };

    return (
        <div className='flex flex-col gap-6 max-w-7xl mx-auto'>
            {/* Header */}
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                <div>
                    <h1 className='text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5'>
                        <div className='w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/10'>
                            <BarChart3 className='h-5 w-5' />
                        </div>
                        Supply Chain Analytics & Intelligence
                    </h1>
                    <p className='text-sm text-slate-500 mt-1'>
                        Real-time OTIF performance, Lead Time analytics, ABC matrix and warehouse turn rates for <strong>{currentTenant.name}</strong>
                    </p>
                </div>
                <div className='flex items-center gap-3'>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={handleRefresh}
                        disabled={loading}
                        className='gap-2 text-xs border-slate-300 dark:border-slate-700'
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh Metrics</span>
                    </Button>
                </div>
            </div>

            {/* Top 4 Primary KPIs */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                <Card className='border-slate-200/80 dark:border-slate-800 shadow-xs'>
                    <CardHeader className='flex flex-row items-center justify-between pb-2'>
                        <CardTitle className='text-xs font-semibold text-slate-500 uppercase tracking-wider'>OTIF Reliability</CardTitle>
                        <ShieldCheck className='h-4 w-4 text-emerald-600' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-3xl font-extrabold text-slate-900 dark:text-slate-100'>
                            {kpis.otifRate}%
                        </div>
                        <div className='flex items-center gap-1.5 text-xs text-emerald-600 mt-1 font-semibold'>
                            <ArrowUpRight className='h-3.5 w-3.5' />
                            <span>+3.4% vs SLA Target ({kpis.otifTarget}%)</span>
                        </div>
                        <div className='w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden'>
                            <div className='bg-emerald-500 h-full rounded-full' style={{width: `${kpis.otifRate}%`}} />
                        </div>
                    </CardContent>
                </Card>

                <Card className='border-slate-200/80 dark:border-slate-800 shadow-xs'>
                    <CardHeader className='flex flex-row items-center justify-between pb-2'>
                        <CardTitle className='text-xs font-semibold text-slate-500 uppercase tracking-wider'>Average Lead Time</CardTitle>
                        <Clock className='h-4 w-4 text-blue-600' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-3xl font-extrabold text-slate-900 dark:text-slate-100'>
                            {kpis.averageLeadTimeDays} <span className='text-base font-normal text-slate-500'>days</span>
                        </div>
                        <div className='flex items-center gap-1.5 text-xs text-blue-600 mt-1 font-semibold'>
                            <ArrowDownRight className='h-3.5 w-3.5' />
                            <span>-0.7d faster than benchmark ({kpis.leadTimeTargetDays}d)</span>
                        </div>
                        <div className='w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden'>
                            <div className='bg-blue-500 h-full rounded-full' style={{width: `${(kpis.averageLeadTimeDays / kpis.leadTimeTargetDays) * 100}%`}} />
                        </div>
                    </CardContent>
                </Card>

                <Card className='border-slate-200/80 dark:border-slate-800 shadow-xs'>
                    <CardHeader className='flex flex-row items-center justify-between pb-2'>
                        <CardTitle className='text-xs font-semibold text-slate-500 uppercase tracking-wider'>Throughput Volume</CardTitle>
                        <Truck className='h-4 w-4 text-indigo-600' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-3xl font-extrabold text-slate-900 dark:text-slate-100'>
                            {kpis.totalThroughputTons.toLocaleString('pl-PL')} <span className='text-base font-normal text-slate-500'>tons</span>
                        </div>
                        <div className='flex items-center gap-1.5 text-xs text-indigo-600 mt-1 font-semibold'>
                            <span>{kpis.activeRoutesCount} active transit corridors</span>
                        </div>
                        <div className='w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden'>
                            <div className='bg-indigo-500 h-full rounded-full' style={{width: `${kpis.fleetEfficiencyScore}%`}} />
                        </div>
                    </CardContent>
                </Card>

                <Card className='border-slate-200/80 dark:border-slate-800 shadow-xs'>
                    <CardHeader className='flex flex-row items-center justify-between pb-2'>
                        <CardTitle className='text-xs font-semibold text-slate-500 uppercase tracking-wider'>SCM Cost Optimization</CardTitle>
                        <TrendingUp className='h-4 w-4 text-purple-600' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-3xl font-extrabold text-slate-900 dark:text-slate-100'>
                            {kpis.costSavingsTotal.toLocaleString('pl-PL')} <span className='text-base font-normal text-slate-500'>{kpis.currency}</span>
                        </div>
                        <div className='flex items-center gap-1.5 text-xs text-purple-600 mt-1 font-semibold'>
                            <span>VRP optimization & reverse tenders</span>
                        </div>
                        <div className='w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden'>
                            <div className='bg-purple-500 h-full rounded-full' style={{width: '78%'}} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Middle Section: OTIF Trend & Logistics Corridors */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* OTIF Monthly Breakdown */}
                <Card className='border-slate-200/80 dark:border-slate-800 shadow-xs'>
                    <CardHeader>
                        <CardTitle className='text-base font-bold flex items-center gap-2'>
                            <ShieldCheck className='h-4 w-4 text-emerald-600' />
                            OTIF Monthly Trend & Fulfillment Quality
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        {OTIF_TRENDS.map(t => (
                            <div key={t.period} className='space-y-1.5'>
                                <div className='flex items-center justify-between text-xs'>
                                    <span className='font-semibold text-slate-700 dark:text-slate-300'>{t.period}</span>
                                    <div className='flex items-center gap-3'>
                                        <span className='text-slate-500'>On-Time: <strong>{t.onTime}%</strong></span>
                                        <span className='text-slate-500'>In-Full: <strong>{t.inFull}%</strong></span>
                                        <Badge className='bg-emerald-600 text-white font-mono text-[10px]'>{t.otif}% OTIF</Badge>
                                    </div>
                                </div>
                                <div className='w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex'>
                                    <div className='bg-emerald-500 h-full' style={{width: `${t.otif}%`}} title={`OTIF: ${t.otif}%`} />
                                    <div className='bg-rose-400 h-full' style={{width: `${t.delayed}%`}} title={`Delayed: ${t.delayed}%`} />
                                </div>
                            </div>
                        ))}
                        <div className='flex items-center justify-between pt-2 border-t text-[11px] text-slate-500 border-slate-100 dark:border-slate-800'>
                            <span className='flex items-center gap-1.5'>
                                <span className='w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block'></span>
                                On-Time In-Full Deliveries
                            </span>
                            <span className='flex items-center gap-1.5'>
                                <span className='w-2.5 h-2.5 rounded-full bg-rose-400 inline-block'></span>
                                Delayed / Discrepancy
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Logistics Corridors Lead Time */}
                <Card className='border-slate-200/80 dark:border-slate-800 shadow-xs'>
                    <CardHeader>
                        <CardTitle className='text-base font-bold flex items-center gap-2'>
                            <Truck className='h-4 w-4 text-blue-600' />
                            Corridor Lead Time & Transit SLA
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='p-0 overflow-x-auto'>
                        <table className='w-full text-xs text-left'>
                            <thead className='bg-slate-50 dark:bg-slate-900/60 uppercase text-slate-500 border-b border-slate-200/80 dark:border-slate-800'>
                                <tr>
                                    <th className='px-4 py-2.5 font-semibold'>Corridor</th>
                                    <th className='px-4 py-2.5 font-semibold'>Distance</th>
                                    <th className='px-4 py-2.5 font-semibold'>Actual</th>
                                    <th className='px-4 py-2.5 font-semibold'>SLA Target</th>
                                    <th className='px-4 py-2.5 font-semibold'>Load %</th>
                                    <th className='px-4 py-2.5 font-semibold text-right'>Status</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
                                {CORRIDORS.map((c, i) => (
                                    <tr key={i} className='hover:bg-slate-50/50 dark:hover:bg-slate-900/30'>
                                        <td className='px-4 py-2.5 font-medium text-slate-900 dark:text-slate-100'>
                                            {c.corridor}
                                        </td>
                                        <td className='px-4 py-2.5 text-slate-500'>
                                            {c.distanceKm} km
                                        </td>
                                        <td className='px-4 py-2.5 font-bold text-slate-900 dark:text-slate-100'>
                                            {c.avgDays} d
                                        </td>
                                        <td className='px-4 py-2.5 text-slate-500'>
                                            {c.benchmarkDays} d
                                        </td>
                                        <td className='px-4 py-2.5 font-semibold text-primary'>
                                            {c.loadFactor}%
                                        </td>
                                        <td className='px-4 py-2.5 text-right'>
                                            <Badge
                                                variant='outline'
                                                className={`text-[10px] ${
                                                    c.status === 'OPTIMAL'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                                                        : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                                                }`}
                                            >
                                                {c.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Section: ABC Inventory Matrix & Warehouse Turnover */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                {/* ABC Matrix */}
                <Card className='border-slate-200/80 dark:border-slate-800 shadow-xs lg:col-span-2'>
                    <CardHeader>
                        <CardTitle className='text-base font-bold flex items-center gap-2'>
                            <Layers className='h-4 w-4 text-purple-600' />
                            ABC Inventory Classification Matrix (Pareto Principle)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                        <div className='p-4 rounded-xl border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900 space-y-2'>
                            <div className='flex items-center justify-between'>
                                <Badge className='bg-blue-600 text-white font-bold'>Class A</Badge>
                                <span className='text-xs font-bold text-blue-700 dark:text-blue-300'>72.4% Revenue</span>
                            </div>
                            <h4 className='text-xs font-bold text-slate-900 dark:text-slate-100'>High Value / Fast Moving</h4>
                            <p className='text-[11px] text-slate-500'>
                                18.2% of active SKUs. Strict replenishment, zero stockout tolerance.
                            </p>
                            <div className='pt-2 border-t border-blue-200/60 dark:border-blue-900 text-[10px] font-mono text-slate-600 dark:text-slate-400 space-y-1'>
                                <div>• Euro-Pallet Standard (SKU-PAL-01)</div>
                                <div>• Insulated Thermobox (SKU-COL-09)</div>
                                <div>• Stretch Film 23mic (SKU-STR-05)</div>
                            </div>
                        </div>

                        <div className='p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 dark:bg-indigo-950/20 dark:border-indigo-900 space-y-2'>
                            <div className='flex items-center justify-between'>
                                <Badge className='bg-indigo-600 text-white font-bold'>Class B</Badge>
                                <span className='text-xs font-bold text-indigo-700 dark:text-indigo-300'>20.1% Revenue</span>
                            </div>
                            <h4 className='text-xs font-bold text-slate-900 dark:text-slate-100'>Medium Value / Intermediate</h4>
                            <p className='text-[11px] text-slate-500'>
                                32.5% of active SKUs. Regular consumption with moderate buffer.
                            </p>
                            <div className='pt-2 border-t border-indigo-200/60 dark:border-indigo-900 text-[10px] font-mono text-slate-600 dark:text-slate-400 space-y-1'>
                                <div>• Hydraulic Hand Truck (SKU-HYD-02)</div>
                                <div>• Barcode Thermal Labels (SKU-LBL-12)</div>
                            </div>
                        </div>

                        <div className='p-4 rounded-xl border border-slate-200 bg-slate-50/50 dark:bg-slate-900/40 dark:border-slate-800 space-y-2'>
                            <div className='flex items-center justify-between'>
                                <Badge variant='outline' className='font-bold'>Class C</Badge>
                                <span className='text-xs font-bold text-slate-600 dark:text-slate-400'>7.5% Revenue</span>
                            </div>
                            <h4 className='text-xs font-bold text-slate-900 dark:text-slate-100'>Low Value / Slow Moving</h4>
                            <p className='text-[11px] text-slate-500'>
                                49.3% of active SKUs. Occasional supplies & safety consumables.
                            </p>
                            <div className='pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-400 space-y-1'>
                                <div>• Cardboard Corner Protectors</div>
                                <div>• Heavy Packaging Tape 50mm</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Warehouse Turnover Ratios */}
                <Card className='border-slate-200/80 dark:border-slate-800 shadow-xs'>
                    <CardHeader>
                        <CardTitle className='text-base font-bold flex items-center gap-2'>
                            <Warehouse className='h-4 w-4 text-cyan-600' />
                            Warehouse Turnover Velocity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-3.5'>
                        {WAREHOUSES.map((w, idx) => (
                            <div key={idx} className='space-y-1'>
                                <div className='flex items-center justify-between text-xs'>
                                    <span className='font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]'>
                                        {w.warehouse}
                                    </span>
                                    <span className='font-extrabold text-primary font-mono'>
                                        {w.turnoverRatio}x <span className='text-[10px] font-normal text-slate-400'>({w.daysOnHand}d)</span>
                                    </span>
                                </div>
                                <div className='w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden'>
                                    <div
                                        className='bg-cyan-500 h-full rounded-full'
                                        style={{width: `${Math.min(100, (w.turnoverRatio / 25) * 100)}%`}}
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default AnalyticsDashboardPage;
