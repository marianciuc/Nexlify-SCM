import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import {
  ChevronLeft,
  Truck,
  Wrench,
  Fuel,
  ShieldCheck,
  Calendar,
  Radio,
  MapPin,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/logistics/fleet/$vehicleId')({
  component: VehiclePassportPage,
  staticData: {
    crumb: {
      label: 'Vehicle Passport',
    },
  },
});

function VehiclePassportPage() {
  const { vehicleId } = Route.useParams();

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/logistics/fleet"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Fleet Registry
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Vehicle Passport: <span className="font-mono text-amber-600">WI 49102</span>
            </h1>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
              Telematics Active (CAN-Bus Online)
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Scania R450 Streamline (Euro 6) • Assigned Driver: Tomasz Lewandowski</p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.info('Scheduled technical inspection at Scania Warsaw DC')}
          className="gap-1.5 text-xs"
        >
          <Wrench className="h-3.5 w-3.5" />
          Schedule Maintenance (UDT)
        </Button>
      </div>

      {/* Telematics Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800 shadow-2xs">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-xs uppercase font-semibold text-slate-500">Total Odometer</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">248,190 km</div>
            <p className="text-2xs text-slate-500 mt-1">Next service in 11,810 km</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-2xs">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-xs uppercase font-semibold text-slate-500">Average Fuel</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold font-mono text-emerald-600">28.4 L / 100km</div>
            <p className="text-2xs text-slate-500 mt-1">High efficiency (Euro 6)</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-2xs">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-xs uppercase font-semibold text-slate-500">Payload Rating</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">24.0 tons</div>
            <p className="text-2xs text-slate-500 mt-1">33 Euro-pallets trailer</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-2xs">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-xs uppercase font-semibold text-slate-500">Tech Inspection</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold font-mono text-emerald-600">2027-04-15</div>
            <p className="text-2xs text-slate-500 mt-1">TDT / UDT Certified</p>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance History */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <CardHeader className="py-3 px-5 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Wrench className="h-4 w-4 text-amber-500" /> Maintenance & Periodic Inspection Log
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b text-slate-600 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Service Performed</th>
                <th className="py-3 px-4">Workshop Facility</th>
                <th className="py-3 px-4 text-right">Odometer</th>
                <th className="py-3 px-4 text-right">Certification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="py-3 px-4 font-mono">2026-08-10</td>
                <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                  Full PM Service (Engine oil, fuel filters, AdBlue injector inspection)
                </td>
                <td className="py-3 px-4 text-slate-500">Scania Authorized Service Nadarzyn</td>
                <td className="py-3 px-4 font-mono text-right">240,000 km</td>
                <td className="py-3 px-4 text-right">
                  <Badge className="bg-emerald-50 text-emerald-700 text-2xs">Passed</Badge>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono">2026-04-15</td>
                <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                  Annual Polish Technical Inspection (Badanie Techniczne TDT)
                </td>
                <td className="py-3 px-4 text-slate-500">Stacja Kontroli Pojazdów Warszawa</td>
                <td className="py-3 px-4 font-mono text-right">215,400 km</td>
                <td className="py-3 px-4 text-right">
                  <Badge className="bg-emerald-50 text-emerald-700 text-2xs">Stamp Active</Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
