import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import {
  ChevronLeft,
  Route as RouteIcon,
  Truck,
  MapPin,
  Clock,
  Download,
  CheckCircle2,
  Calendar,
  Building2,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/logistics/routes/$routeId')({
  component: RouteDetailPage,
  staticData: {
    crumb: {
      label: 'Waybill Details',
    },
  },
});

function RouteDetailPage() {
  const { routeId } = Route.useParams();

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/logistics/routes"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Routes
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Waybill: <span className="font-mono text-amber-600">ROT-WAW-GDA-01</span>
            </h1>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
              ACTIVE IN TRANSIT
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Depot: Central DC Warszawa ➔ Destination: Gdańsk Port Terminal • Distance: 342.5 km
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.success('Downloaded official Waybill PDF')}
          className="gap-1.5 text-xs"
        >
          <Download className="h-3.5 w-3.5" />
          Download Waybill PDF
        </Button>
      </div>

      {/* Checkpoints & ESG Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="py-3 px-4 border-b">
            <CardTitle className="text-xs uppercase font-semibold text-slate-500">
              Assigned Telematics Unit
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-1 text-xs">
            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              WI 49102 (Scania R450 Euro 6)
            </div>
            <div className="text-slate-500">Driver: Tomasz Lewandowski</div>
            <div className="text-emerald-600 font-mono font-semibold pt-1">Live Speed: 82 km/h</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="py-3 px-4 border-b">
            <CardTitle className="text-xs uppercase font-semibold text-slate-500">
              Fuel & Environmental (GLEC)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-1 text-xs">
            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm font-mono">
              38.4 kg CO2e
            </div>
            <div className="text-slate-500">Estimated Fuel: 106.2 L Diesel</div>
            <div className="text-emerald-600 font-semibold pt-1">ISO 14083 Certified</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="py-3 px-4 border-b">
            <CardTitle className="text-xs uppercase font-semibold text-slate-500">
              Consignment Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-1 text-xs">
            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              2 Deliveries / 24 Pallets
            </div>
            <div className="text-slate-500">e-CMR: CMR-PL-2026-9912</div>
            <div className="text-amber-600 font-semibold pt-1">ETA Gdańsk: 45 minutes</div>
          </CardContent>
        </Card>
      </div>

      {/* Turn-by-Turn Waypoints Table */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <CardHeader className="py-3 px-5 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4 text-amber-500" /> Sequential Waypoints & Unloading Docks
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b text-slate-600 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4">Stop #</th>
                <th className="py-3 px-4">Facility / Address</th>
                <th className="py-3 px-4">Delivery Window</th>
                <th className="py-3 px-4">Unloading Cargo</th>
                <th className="py-3 px-4 text-right">Checkpoint Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr className="bg-emerald-50/20">
                <td className="py-3 px-4 font-mono font-bold text-emerald-600">Origin</td>
                <td className="py-3 px-4 font-semibold">Central DC Warszawa (WH-WAW-01)</td>
                <td className="py-3 px-4 text-slate-500">Departed 08:30</td>
                <td className="py-3 px-4 font-mono">Loaded 24 Pallets (12,600 kg)</td>
                <td className="py-3 px-4 text-right">
                  <Badge className="bg-emerald-50 text-emerald-700 text-2xs">Completed</Badge>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono font-bold text-amber-600">Stop 1</td>
                <td className="py-3 px-4 font-semibold">Łódź Distribution Hub (Gate 2)</td>
                <td className="py-3 px-4 text-slate-500">10:00 - 11:00</td>
                <td className="py-3 px-4 font-mono">Unload 10 Pallets (Pomerania Foods)</td>
                <td className="py-3 px-4 text-right">
                  <Badge className="bg-emerald-50 text-emerald-700 text-2xs">Completed</Badge>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono font-bold text-amber-600">Stop 2</td>
                <td className="py-3 px-4 font-semibold">Gdańsk Sea Port Terminal (Dock 7)</td>
                <td className="py-3 px-4 text-slate-500">13:30 - 14:30 (Current)</td>
                <td className="py-3 px-4 font-mono">Unload 14 Pallets (Baltic Retail)</td>
                <td className="py-3 px-4 text-right">
                  <Badge className="bg-amber-50 text-amber-700 text-2xs">En Route</Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
