import { createFileRoute } from '@tanstack/react-router';
import {
  Award,
  ShieldCheck,
  TrendingUp,
  CheckCircle2,
  Clock,
  ThumbsUp,
  AlertTriangle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/supplier/scorecard')({
  component: SupplierScorecardPage,
  staticData: {
    crumb: {
      label: 'Supplier Scorecard',
    },
  },
});

function SupplierScorecardPage() {
  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="h-6 w-6 text-amber-600" />
            Supplier Quality Scorecard & Reliability Rating
          </h1>
          <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">
            Enterprise SCM 2.0
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Algorithmic multi-factor reliability index based on OTIF on-time performance, RMA quality acceptance, and SLA lead time adherence.
        </p>
      </div>

      {/* Main Score Banner */}
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 via-amber-100/40 to-emerald-50 dark:from-amber-950/20 dark:to-emerald-950/20 shadow-md">
        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold text-xs">
              <ShieldCheck className="h-4 w-4 text-amber-700" /> Verified Gold Supplier Tier
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              Composite Quality Score: 98.4 / 100
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-lg">
              Calculated over 420 completed deliveries during the past 90 days. Top 5% performing supplier on the Nexlify B2B platform.
            </p>
          </div>

          <div className="text-center bg-white dark:bg-slate-900 p-6 rounded-2xl border border-amber-200 shadow-sm shrink-0">
            <div className="text-5xl font-mono font-black text-amber-600">98.4%</div>
            <div className="text-xs font-semibold text-slate-500 uppercase mt-1">OTIF Rate (Q3)</div>
          </div>
        </CardContent>
      </Card>

      {/* 4 Factor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800 shadow-2xs">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-xs uppercase font-semibold text-slate-500">
              1. OTIF Adherence (40%)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold font-mono text-emerald-600">98.4%</div>
            <p className="text-2xs text-slate-500 mt-1">Target threshold: 95.0%</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-2xs">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-xs uppercase font-semibold text-slate-500">
              2. Quality Acceptance (30%)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold font-mono text-emerald-600">99.2%</div>
            <p className="text-2xs text-slate-500 mt-1">Zero critical RMA recalls</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-2xs">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-xs uppercase font-semibold text-slate-500">
              3. Price Index (20%)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold font-mono text-emerald-600">96.8%</div>
            <p className="text-2xs text-slate-500 mt-1">Highly competitive</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-2xs">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-xs uppercase font-semibold text-slate-500">
              4. Lead Time SLA (10%)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold font-mono text-emerald-600">99.5%</div>
            <p className="text-2xs text-slate-500 mt-1">Average dispatch: 1.2 days</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
