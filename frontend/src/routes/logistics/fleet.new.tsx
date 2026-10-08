import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import {
  ChevronLeft,
  Truck,
  Plus,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import 'sonner';
import { z } from 'zod';

import {
  FormFieldInput,
  FormFieldSelect,
  FormFieldNumber,
} from '@/components/forms/common';
import '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useCreateVehicleMutation } from '@/hooks/useScmQueries';

export const Route = createFileRoute('/logistics/fleet/new')({
  component: RegisterVehiclePage,
  staticData: {
    crumb: {
      label: 'Register Vehicle',
    },
  },
});

const vehicleCategoryEnum = z.enum(['HEAVY_TRUCK', 'MEDIUM_VAN']);

const vehicleSchema = z.object({
  plate: z.string().min(1, 'Registration plate is required'),
  vin: z.string().min(17, 'VIN must be 17 characters').max(17, 'VIN must be 17 characters'),
  makeModel: z.string().min(1, 'Make and model is required'),
  category: vehicleCategoryEnum,
  maxPayloadKg: z.number().positive('Payload must be positive'),
  volumeM3: z.number().positive('Cargo volume must be positive'),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

const categoryOptions = [
  { value: 'HEAVY_TRUCK', label: 'Heavy Tractor (40t GVM)' },
  { value: 'MEDIUM_VAN', label: 'Courier Delivery Van (<3.5t)' },
];

function RegisterVehiclePage() {
  const navigate = useNavigate();

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      plate: '',
      vin: '',
      makeModel: '',
      category: 'HEAVY_TRUCK',
      maxPayloadKg: 24000,
      volumeM3: 90.0,
    },
  });

  const createVehicleMutation = useCreateVehicleMutation();

  const onSubmit = async (data: VehicleFormData) => {
    await createVehicleMutation.mutateAsync({
      id: 'veh-' + Math.random().toString(36).substring(2, 7),
      plateNumber: data.plate.toUpperCase(),
      makeModel: data.makeModel,
      type: data.category,
      maxPayloadKg: data.maxPayloadKg,
      cargoVolumeM3: data.volumeM3,
      assignedDriver: 'Marek Szymański',
      fuelType: 'Diesel (Euro 6)',
      inspectionExpiry: '2027-06-30',
      status: 'AVAILABLE_DEPOT',
    });
    navigate({ to: '/logistics/fleet' });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/logistics/fleet"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> Back to Fleet Registry
        </Link>
      </div>

      <Card className="border-border shadow-md">
        <CardHeader className="bg-muted border-b pb-4">
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Register Commercial Vehicle into TMS Registry
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Specify technical passport details, gross vehicle mass (GVM), maximum axial load, and telematics GPS pairing.
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  1. Registration & Identification
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormFieldInput
                    control={form.control}
                    name="plate"
                    label="Registration Plate (PL):"
                    placeholder="E.g. WI 88291"
                    className="font-mono text-xs font-bold uppercase"
                  />

                  <FormFieldInput
                    control={form.control}
                    name="vin"
                    label="Vehicle Identification Number (VIN 17-char):"
                    placeholder="YS2R4X20002918471"
                    className="font-mono text-xs uppercase"
                  />
                </div>

                <FormFieldInput
                  control={form.control}
                  name="makeModel"
                  label="Make, Model & Powertrain:"
                  placeholder="E.g. Scania R500 V8 Super (Euro 6e)"
                  className="text-xs font-medium"
                />
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  2. Cargo Capacity & Weight Ratings
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormFieldSelect
                    control={form.control}
                    name="category"
                    label="Vehicle Category:"
                    options={categoryOptions}
                  />

                  <FormFieldNumber
                    control={form.control}
                    name="maxPayloadKg"
                    label="Max Net Payload (kg):"
                    className="font-bold"
                  />

                  <FormFieldNumber
                    control={form.control}
                    name="volumeM3"
                    label="Cargo Volume (m³):"
                    step="0.1"
                    className="font-bold"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => navigate({ to: '/logistics/fleet' })}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-semibold">
                  <Plus className="h-4 w-4" /> Save Vehicle to Active Fleet
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
