import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Users,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/logistics/drivers')({
  component: LogisticsDriversPage,
  staticData: {
    crumb: {
      label: 'Driver Registry',
    },
  },
});

interface Driver {
  id: string;
  name: string;
  licenseCategory: string;
  assignedTruck: string;
  drivingHoursToday: string;
  restHoursRemaining: string;
  adrCertified: boolean;
  status: 'ON_ROUTE' | 'RESTING' | 'OFF_SHIFT';
}

const DRIVERS_DATA: Driver[] = [
  {
    id: 'drv-01',
    name: 'Tomasz Lewandowski',
    licenseCategory: 'C + E (Code 95)',
    assignedTruck: 'WI 49102 (Scania R450)',
    drivingHoursToday: '3h 45m / 9h max',
    restHoursRemaining: '11h mandatory rest completed',
    adrCertified: true,
    status: 'ON_ROUTE',
  },
  {
    id: 'drv-02',
    name: 'Paweł Kamiński',
    licenseCategory: 'C + E (Code 95)',
    assignedTruck: 'ZS 8831A (Volvo FH)',
    drivingHoursToday: '0h (Shift starts 14:00)',
    restHoursRemaining: 'Fully rested',
    adrCertified: true,
    status: 'OFF_SHIFT',
  },
  {
    id: 'drv-03',
    name: 'Marek Szymański',
    licenseCategory: 'C + E (Code 95)',
    assignedTruck: 'WI 30219 (MAN TGX)',
    drivingHoursToday: '4h 30m',
    restHoursRemaining: 'Taking 45m tachograph pause',
    adrCertified: false,
    status: 'RESTING',
  },
];

function LogisticsDriversPage() {
  const [drivers] = useState<Driver[]>(DRIVERS_DATA);

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="h-6 w-6 text-amber-500" />
            Commercial Drivers & Tachograph Compliance Registry
          </h1>
          <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">
            EU Regulation 561/2006
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor driver licenses (Code 95), ADR hazardous material qualifications, and live digital tachograph work/rest intervals.
        </p>
      </div>

      {/* Drivers Table */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b text-slate-600 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4">Driver Name</th>
                <th className="py-3 px-4">License / Qualification</th>
                <th className="py-3 px-4">Assigned Vehicle</th>
                <th className="py-3 px-4">Daily Driving Time (Tachograph)</th>
                <th className="py-3 px-4">ADR Qualification</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {drivers.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                    {d.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{d.licenseCategory}</td>
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{d.assignedTruck}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-slate-100">
                    {d.drivingHoursToday}
                  </td>
                  <td className="py-3 px-4">
                    {d.adrCertified ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-2xs">
                        ADR Certified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-2xs text-slate-400">
                        General Cargo
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Badge
                      className={`text-2xs ${
                        d.status === 'ON_ROUTE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : d.status === 'RESTING'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {d.status}
                    </Badge>
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
