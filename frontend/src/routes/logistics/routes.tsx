import { createFileRoute, Link, Outlet, useChildMatches } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Route as RouteIcon,
  Plus,
  Truck,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  TrendingDown,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/logistics/routes')({
  component: LogisticsRoutesPage,
  staticData: {
    crumb: {
      label: 'Transport Routes',
    },
  },
});

interface LogisticsTrip {
  id: string;
  routeCode: string;
  origin: string;
  destination: string;
  vehicle: string;
  driver: string;
  distanceKm: number;
  durationHours: number;
  stopsCount: number;
  co2EmissionsKg: number;
  status: 'ACTIVE_IN_TRANSIT' | 'PLANNED' | 'COMPLETED';
}

const INITIAL_ROUTES: LogisticsTrip[] = [
  {
    id: 'rot-01',
    routeCode: 'ROT-WAW-GDA-01',
    origin: 'Central DC Warszawa (WH-WAW-01)',
    destination: 'Gdańsk Sea Port Terminal',
    vehicle: 'WI 49102 (Scania R450)',
    driver: 'Tomasz Lewandowski',
    distanceKm: 342.5,
    durationHours: 4.2,
    stopsCount: 3,
    co2EmissionsKg: 38.4,
    status: 'ACTIVE_IN_TRANSIT',
  },
  {
    id: 'rot-02',
    routeCode: 'ROT-SZC-KTW-02',
    origin: 'Port Logistics Hub Szczecin (WH-SZC-02)',
    destination: 'Silesia Logistics Hub Katowice',
    vehicle: 'ZS 8831A (Volvo FH 500)',
    driver: 'Paweł Kamiński',
    distanceKm: 528.0,
    durationHours: 6.5,
    stopsCount: 2,
    co2EmissionsKg: 59.2,
    status: 'PLANNED',
  },
  {
    id: 'rot-03',
    routeCode: 'ROT-WAW-POZ-03',
    origin: 'Central DC Warszawa (WH-WAW-01)',
    destination: 'Poznań Logistics Center',
    vehicle: 'WI 30219 (MAN TGX 18.440)',
    driver: 'Marek Szymański',
    distanceKm: 310.2,
    durationHours: 3.8,
    stopsCount: 1,
    co2EmissionsKg: 34.8,
    status: 'COMPLETED',
  },
];

function LogisticsRoutesPage() {
  const childMatches = useChildMatches();
  if (childMatches.length > 0) {
    return <Outlet />;
  }
  return <LogisticsRoutesContent />;
}

function LogisticsRoutesContent() {
  const [routes] = useState<LogisticsTrip[]>(INITIAL_ROUTES);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <RouteIcon className="h-6 w-6 text-amber-500" />
              TMS Freight Routes & Dispatch Waybills
            </h1>
            <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">
              Screen P14 TMS
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage multi-stop transport corridors, track fuel consumption, and optimize truck departures with GraphHopper VRP.
          </p>
        </div>

        <Link to="/logistics/routes/planner">
          <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2 text-xs shadow-xs">
            <Plus className="h-4 w-4" /> GraphHopper VRP Route Planner
          </Button>
        </Link>
      </div>

      {/* Routes Table */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[800px]">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b text-slate-600 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4">Route Code</th>
                <th className="py-3 px-4">Corridor (Origin ➔ Destination)</th>
                <th className="py-3 px-4">Assigned Vehicle & Driver</th>
                <th className="py-3 px-4 text-right">Distance & Time</th>
                <th className="py-3 px-4 text-right">Stops</th>
                <th className="py-3 px-4 text-right">CO2 (GLEC)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Waybill Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {routes.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-mono font-bold text-amber-700 dark:text-amber-400">
                    <Link to="/logistics/routes/$routeId" params={{ routeId: r.id }} className="hover:underline">
                      {r.routeCode}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{r.origin}</div>
                    <div className="text-2xs text-slate-500 flex items-center gap-1">
                      ➔ {r.destination}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{r.vehicle}</div>
                    <div className="text-2xs text-slate-500">{r.driver}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-right">
                    <div className="font-bold tabular-nums text-slate-800 dark:text-slate-200">{r.distanceKm}&nbsp;km</div>
                    <div className="text-2xs tabular-nums text-slate-500">{r.durationHours}&nbsp;hrs</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-right font-medium tabular-nums">{r.stopsCount}&nbsp;stops</td>
                  <td className="py-3 px-4 font-mono font-semibold tabular-nums text-emerald-600 text-right">
                    {r.co2EmissionsKg}&nbsp;kg
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      className={`text-2xs ${
                        r.status === 'ACTIVE_IN_TRANSIT'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : r.status === 'PLANNED'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {r.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link to="/logistics/routes/$routeId" params={{ routeId: r.id }} aria-label={`View waybill for route ${r.routeCode}`}>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        Waybill <ArrowRight className="h-3 w-3 ml-1" aria-hidden="true" />
                      </Button>
                    </Link>
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
