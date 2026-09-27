import { createFileRoute, Link, Outlet, useChildMatches } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Truck,
  Plus,
  ShieldCheck,
  Calendar,
  Wrench,
  Fuel,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/logistics/fleet')({
  component: LogisticsFleetPage,
  staticData: {
    crumb: {
      label: 'Vehicle Fleet',
    },
  },
});

interface Vehicle {
  id: string;
  plateNumber: string;
  makeModel: string;
  type: 'HEAVY_TRUCK' | 'MEDIUM_VAN' | 'ELECTRIC_VAN';
  maxPayloadKg: number;
  cargoVolumeM3: number;
  assignedDriver: string;
  fuelType: string;
  inspectionExpiry: string;
  status: 'ACTIVE_ON_ROAD' | 'AVAILABLE_DEPOT' | 'IN_MAINTENANCE';
}

const FLEET_DATA: Vehicle[] = [
  {
    id: 'veh-01',
    plateNumber: 'WI 49102',
    makeModel: 'Scania R450 Streamline (Euro 6)',
    type: 'HEAVY_TRUCK',
    maxPayloadKg: 24000,
    cargoVolumeM3: 92.0,
    assignedDriver: 'Tomasz Lewandowski',
    fuelType: 'Diesel (Euro 6)',
    inspectionExpiry: '2027-04-15',
    status: 'ACTIVE_ON_ROAD',
  },
  {
    id: 'veh-02',
    plateNumber: 'ZS 8831A',
    makeModel: 'Volvo FH 500 Globetrotter',
    type: 'HEAVY_TRUCK',
    maxPayloadKg: 24000,
    cargoVolumeM3: 92.0,
    assignedDriver: 'Paweł Kamiński',
    fuelType: 'Diesel (Euro 6)',
    inspectionExpiry: '2027-02-10',
    status: 'AVAILABLE_DEPOT',
  },
  {
    id: 'veh-03',
    plateNumber: 'WI 30219',
    makeModel: 'MAN TGX 18.440 EfficientLine',
    type: 'HEAVY_TRUCK',
    maxPayloadKg: 22000,
    cargoVolumeM3: 88.0,
    assignedDriver: 'Marek Szymański',
    fuelType: 'Diesel (Euro 6)',
    inspectionExpiry: '2026-11-20',
    status: 'AVAILABLE_DEPOT',
  },
  {
    id: 'veh-04',
    plateNumber: 'GD 5519X',
    makeModel: 'Mercedes-Benz Sprinter 319 CDI',
    type: 'MEDIUM_VAN',
    maxPayloadKg: 1400,
    cargoVolumeM3: 14.0,
    assignedDriver: 'Kamil Zieliński',
    fuelType: 'Diesel',
    inspectionExpiry: '2026-10-05',
    status: 'IN_MAINTENANCE',
  },
];

function LogisticsFleetPage() {
  const childMatches = useChildMatches();
  if (childMatches.length > 0) {
    return <Outlet />;
  }
  return <LogisticsFleetContent />;
}

function LogisticsFleetContent() {
  const [vehicles] = useState<Vehicle[]>(FLEET_DATA);
  const [filterType, setFilterType] = useState<string>('ALL');

  const filtered = vehicles.filter((v) => {
    if (filterType === 'ALL') return true;
    return v.type === filterType;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Truck className="h-6 w-6 text-amber-500" />
              Fleet & Heavy Vehicle Telematics Registry
            </h1>
            <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">
              Screen P15
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Maintain carrier vehicle passports, technical inspections (TDT/UDT), payload ratings, and driver assignments.
          </p>
        </div>

        <Link to="/logistics/fleet/new">
          <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2 text-xs shadow-xs">
            <Plus className="h-4 w-4" /> Register New Commercial Vehicle
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
        {[
          { id: 'ALL', label: 'All Fleet Vehicles' },
          { id: 'HEAVY_TRUCK', label: 'Heavy Tractors (>3.5t)' },
          { id: 'MEDIUM_VAN', label: 'Delivery Vans (<3.5t)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterType === tab.id
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Fleet Table */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b text-slate-600 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4">Registration Plate</th>
                <th className="py-3 px-4">Make & Model</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Max Payload (kg)</th>
                <th className="py-3 px-4 text-right">Cargo Volume (m³)</th>
                <th className="py-3 px-4">Assigned Driver</th>
                <th className="py-3 px-4">Tech Inspection Expiry</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Vehicle Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-mono font-bold text-amber-700 dark:text-amber-400">
                    <Link to="/logistics/fleet/$vehicleId" params={{ vehicleId: v.id }} className="hover:underline">
                      {v.plateNumber}
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                    {v.makeModel}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="text-2xs font-mono">
                      {v.type === 'HEAVY_TRUCK' ? 'Heavy 40t' : 'Light 3.5t'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-right text-slate-900 dark:text-slate-100">
                    {v.maxPayloadKg.toLocaleString()} kg
                  </td>
                  <td className="py-3 px-4 font-mono text-right text-slate-600">
                    {v.cargoVolumeM3} m³
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    {v.assignedDriver}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono">{v.inspectionExpiry}</td>
                  <td className="py-3 px-4">
                    <Badge
                      className={`text-2xs ${
                        v.status === 'ACTIVE_ON_ROAD'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : v.status === 'AVAILABLE_DEPOT'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {v.status === 'ACTIVE_ON_ROAD' ? 'On Road' : v.status === 'AVAILABLE_DEPOT' ? 'At Depot' : 'Maintenance'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link to="/logistics/fleet/$vehicleId" params={{ vehicleId: v.id }}>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        Passport <ArrowRight className="h-3 w-3 ml-1" />
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
