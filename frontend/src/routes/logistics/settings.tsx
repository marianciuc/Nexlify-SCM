import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Settings,
  Fuel,
  MapPin,
  Clock,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/logistics/settings')({
  component: LogisticsSettingsPage,
  staticData: {
    crumb: {
      label: 'TMS Settings',
    },
  },
});

function LogisticsSettingsPage() {
  const [fuelPricePln, setFuelPricePln] = useState(6.45);
  const [co2Factor, setCo2Factor] = useState(2.68); // kg CO2 / liter diesel
  const [graphHopperProfile, setGraphHopperProfile] = useState('truck_heavy_40t');
  const [maxDriveHours, setMaxDriveHours] = useState(9);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('TMS routing parameters and GraphHopper engine constraints updated!');
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings className="h-6 w-6 text-amber-500" />
          TMS Fleet & GraphHopper Engine Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure vehicle physical constraints, GLEC emissions coefficients, and dynamic diesel costing for VRP solver.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">GraphHopper 9.x Routing Engine Profiles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">OSM Vehicle Constraint Profile:</Label>
                <select
                  value={graphHopperProfile}
                  onChange={(e) => setGraphHopperProfile(e.target.value)}
                  className="w-full p-2 border rounded-md bg-white dark:bg-slate-900 font-mono"
                >
                  <option value="truck_heavy_40t">truck_heavy_40t (Bridge heights &gt; 4.0m, Weight &lt; 40t)</option>
                  <option value="delivery_van_3_5t">delivery_van_3_5t (Urban streets allowed, No toll roads)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Max Continuous Driving Shift (Hours):</Label>
                <Input
                  type="number"
                  value={maxDriveHours}
                  onChange={(e) => setMaxDriveHours(Number(e.target.value))}
                  className="text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Base Diesel Price (PLN / Liter):</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={fuelPricePln}
                  onChange={(e) => setFuelPricePln(Number(e.target.value))}
                  className="text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">GLEC CO2 Emission Factor (kg CO2 / L):</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={co2Factor}
                  onChange={(e) => setCo2Factor(Number(e.target.value))}
                  className="text-xs font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white gap-2 text-xs font-semibold">
            <Save className="h-4 w-4" /> Save TMS Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
