import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState } from 'react';
import {
  ChevronLeft,
  Truck,
  Plus,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/logistics/fleet/new')({
  component: RegisterVehiclePage,
  staticData: {
    crumb: {
      label: 'Register Vehicle',
    },
  },
});

function RegisterVehiclePage() {
  const navigate = useNavigate();

  const [plate, setPlate] = useState('');
  const [vin, setVin] = useState('');
  const [makeModel, setMakeModel] = useState('');
  const [category, setCategory] = useState<'HEAVY_TRUCK' | 'MEDIUM_VAN'>('HEAVY_TRUCK');
  const [maxPayloadKg, setMaxPayloadKg] = useState(24000);
  const [volumeM3, setVolumeM3] = useState(90.0);
  const [driver, setDriver] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate || !makeModel) {
      toast.error('Please enter license plate and vehicle model');
      return;
    }
    toast.success(`Vehicle ${plate} (${makeModel}) registered into TMS Fleet Registry!`);
    navigate({ to: '/logistics/fleet' });
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/logistics/fleet"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Fleet Registry
        </Link>
        <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">
          Screen P15 Integration
        </Badge>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-md">
        <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b pb-4">
          <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Truck className="h-5 w-5 text-amber-500" />
            Register Commercial Vehicle into TMS Registry
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Specify technical passport details, gross vehicle mass (GVM), maximum axial load, and telematics GPS pairing.
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                1. Registration & Identification
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="plate" className="text-xs">
                    Registration Plate (PL):
                  </Label>
                  <Input
                    id="plate"
                    placeholder="E.g. WI 88291"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                    className="font-mono text-xs font-bold uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="vin" className="text-xs">
                    Vehicle Identification Number (VIN 17-char):
                  </Label>
                  <Input
                    id="vin"
                    placeholder="YS2R4X20002918471"
                    value={vin}
                    onChange={(e) => setVin(e.target.value)}
                    className="font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="model" className="text-xs">
                  Make, Model & Powertrain:
                </Label>
                <Input
                  id="model"
                  placeholder="E.g. Scania R500 V8 Super (Euro 6e)"
                  value={makeModel}
                  onChange={(e) => setMakeModel(e.target.value)}
                  className="text-xs font-medium"
                />
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                2. Cargo Capacity & Weight Ratings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="type" className="text-xs">
                    Vehicle Category:
                  </Label>
                  <select
                    id="type"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2 text-xs border rounded-md bg-white dark:bg-slate-900"
                  >
                    <option value="HEAVY_TRUCK">Heavy Tractor (40t GVM)</option>
                    <option value="MEDIUM_VAN">Courier Delivery Van (&lt;3.5t)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="payload" className="text-xs">
                    Max Net Payload (kg):
                  </Label>
                  <Input
                    id="payload"
                    type="number"
                    value={maxPayloadKg}
                    onChange={(e) => setMaxPayloadKg(Number(e.target.value))}
                    className="font-mono text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="vol" className="text-xs">
                    Cargo Volume (m³):
                  </Label>
                  <Input
                    id="vol"
                    type="number"
                    value={volumeM3}
                    onChange={(e) => setVolumeM3(Number(e.target.value))}
                    className="font-mono text-xs font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => navigate({ to: '/logistics/fleet' })}>
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white gap-2 font-semibold">
                <Plus className="h-4 w-4" /> Save Vehicle to Active Fleet
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
