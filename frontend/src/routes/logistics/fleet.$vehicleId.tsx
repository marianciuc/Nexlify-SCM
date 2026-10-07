import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFleetQuery, INITIAL_FLEET } from '@/hooks/useScmQueries';

export const Route = createFileRoute('/logistics/fleet/$vehicleId')({
  component: VehiclePassportPage,
  staticData: { crumb: { label: 'Vehicle details' } },
});

function VehiclePassportPage() {
  const { vehicleId } = Route.useParams();
  const { data: vehicles = INITIAL_FLEET } = useFleetQuery();
  const vehicle = vehicles.find(({ id }) => id === vehicleId);

  if (!vehicle) {
    return <section className="max-w-3xl space-y-3" role="status">
      <h1 className="text-xl font-semibold">Транспорт не найден</h1>
      <p className="text-sm text-muted-foreground">Запись могла быть удалена или ссылка устарела.</p>
      <Button asChild variant="outline"><Link to="/logistics/fleet">К списку транспорта</Link></Button>
    </section>;
  }

  const statusLabels = {
    ACTIVE_ON_ROAD: 'В рейсе',
    AVAILABLE_DEPOT: 'На базе',
    IN_MAINTENANCE: 'На обслуживании',
  } as const;

  return (
    <main className="max-w-4xl space-y-6">
      <Link to="/logistics/fleet" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> К автопарку
      </Link>
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{vehicle.plateNumber}</h1>
          <Badge variant="outline">{statusLabels[vehicle.status]}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{vehicle.makeModel}</p>
      </header>
      <dl className="grid gap-x-8 gap-y-5 border-y py-5 sm:grid-cols-2">
        <div><dt className="text-sm text-muted-foreground">Назначенный водитель</dt><dd className="mt-1 font-medium">{vehicle.assignedDriver}</dd></div>
        <div><dt className="text-sm text-muted-foreground">Тип транспорта</dt><dd className="mt-1 font-medium">{vehicle.type.replaceAll('_', ' ')}</dd></div>
        <div><dt className="text-sm text-muted-foreground">Грузоподъёмность</dt><dd className="mt-1 font-medium">{(vehicle.maxPayloadKg / 1000).toLocaleString('ru-RU')} т</dd></div>
        <div><dt className="text-sm text-muted-foreground">Объём кузова</dt><dd className="mt-1 font-medium">{vehicle.cargoVolumeM3.toLocaleString('ru-RU')} м³</dd></div>
        <div><dt className="text-sm text-muted-foreground">Топливо</dt><dd className="mt-1 font-medium">{vehicle.fuelType}</dd></div>
        <div><dt className="text-sm text-muted-foreground">Техосмотр до</dt><dd className="mt-1 font-medium">{new Date(vehicle.inspectionExpiry).toLocaleDateString('ru-RU')}</dd></div>
      </dl>
    </main>
  );
}

export default VehiclePassportPage;
