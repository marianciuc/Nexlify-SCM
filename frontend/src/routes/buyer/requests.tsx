import { createFileRoute, Link, Outlet, useChildMatches } from '@tanstack/react-router';
import { useState } from 'react';
import {
  FileQuestion,
  Plus,
  ArrowRight,
  Building2,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRfqsQuery, INITIAL_RFQS } from '@/hooks/useScmQueries';

export const Route = createFileRoute('/buyer/requests')({
  component: BuyerRequestsPage,
  staticData: {
    crumb: {
      label: 'Procurement RFQs',
    },
  },
});

function BuyerRequestsPage() {
  const childMatches = useChildMatches();
  if (childMatches.length > 0) {
    return <Outlet />;
  }
  return <BuyerRequestsContent />;
}

function BuyerRequestsContent() {
  const { data: rfqs = INITIAL_RFQS } = useRfqsQuery();
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const filteredRfqs = rfqs.filter((r) => {
    if (selectedStatus === 'ALL') return true;
    return r.status === selectedStatus;
  });

  const activeCount = rfqs.filter((r) => r.status === 'OPEN').length;
  const underReviewCount = rfqs.filter((r) => r.bids && r.bids.length > 0 && r.status === 'OPEN').length;
  const awardedCount = rfqs.filter((r) => r.status === 'AWARDED').length;

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileQuestion className="h-6 w-6 text-emerald-600" />
              Procurement Requests & RFQ Tenders
            </h1>
            <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">
              Module 7
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Publish open tender requests, evaluate supplier proposals, and compare substitute items with 1-click order conversion.
          </p>
        </div>

        <Link to="/buyer/requests/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-xs">
            <Plus className="h-4 w-4" /> Create New RFQ Tender
          </Button>
        </Link>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 dark:border-slate-800 shadow-2xs">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-xs uppercase font-semibold text-slate-500">Open Tenders</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{activeCount}</div>
            <p className="text-xs text-slate-500 mt-1">Awaiting bids from suppliers</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-2xs">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-xs uppercase font-semibold text-slate-500">Under Review / Bids Received</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold text-emerald-600">{underReviewCount}</div>
            <p className="text-xs text-slate-500 mt-1">Ready for proposal comparison</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-2xs">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-xs uppercase font-semibold text-slate-500">Successfully Awarded</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{awardedCount}</div>
            <p className="text-xs text-slate-500 mt-1">Converted into active PO orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
        {['ALL', 'OPEN', 'AWARDED'].map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              selectedStatus === st
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {st === 'ALL' ? 'All RFQ Requests' : st}
          </button>
        ))}
      </div>

      {/* RFQ Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRfqs.map((rfq) => {
          const bidsCount = rfq.bids?.length || 0;
          return (
            <Card
              key={rfq.id}
              className="border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {rfq.rfqNumber}
                    </span>
                    <Badge
                      variant={rfq.status === 'OPEN' ? 'default' : 'secondary'}
                      className={
                        rfq.status === 'OPEN'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-xs'
                          : 'bg-slate-100 text-slate-700 text-xs'
                      }
                    >
                      {rfq.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-semibold mt-2 line-clamp-1">
                    {rfq.title}
                  </CardTitle>
                  <div className="text-2xs text-muted-foreground">{rfq.category}</div>
                </CardHeader>

                <CardContent className="p-4 space-y-3 text-xs">
                  <p className="text-slate-600 dark:text-slate-300 line-clamp-2">
                    {rfq.description}
                  </p>

                  <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Target Budget:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                        {rfq.targetBudget.toLocaleString()} {rfq.currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Required Quantity:</span>
                      <span className="font-semibold">
                        {rfq.requiredQuantity} {rfq.unitOfMeasure}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Delivery Deadline:</span>
                      <span className="font-medium text-amber-600 dark:text-amber-400">{rfq.deadline}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5 text-emerald-600" />
                      <strong>{bidsCount}</strong> bids submitted
                    </span>
                    <Badge variant="outline" className="text-2xs text-emerald-700 bg-emerald-50">
                      Substitutes Allowed
                    </Badge>
                  </div>
                </CardContent>
              </div>

              <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 mt-2">
                <Link to="/buyer/requests/$requestId" params={{ requestId: rfq.id }}>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shadow-xs">
                    <span>Evaluate Proposals ({bidsCount})</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
