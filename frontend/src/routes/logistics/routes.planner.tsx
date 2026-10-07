import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronLeft, Route as RouteIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { FormFieldInput } from '@/components/forms/common';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useOptimizeRouteMutation } from '@/hooks/useScmQueries';
import type { RouteOptimizationResult } from '@/types/scm-domain';

const routeSchema = z.object({
  origin: z.string().trim().min(1, 'Укажите пункт отправления'),
  destination: z.string().trim().min(1, 'Укажите пункт назначения'),
});
type RouteFormValues = z.infer<typeof routeSchema>;

export const Route = createFileRoute('/logistics/routes/planner')({
  component: RoutePlannerPage,
  staticData: { crumb: { label: 'Планирование маршрута' } },
});

function RoutePlannerPage() {
  const mutation = useOptimizeRouteMutation();
  const [result, setResult] = useState<RouteOptimizationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const form = useForm<RouteFormValues>({
    resolver: zodResolver(routeSchema),
    defaultValues: { origin: '', destination: '' },
  });

  const calculate = form.handleSubmit(async (values) => {
    setErrorMessage(null);
    setResult(null);
    try {
      setResult(await mutation.mutateAsync(values));
    } catch {
      setErrorMessage('Не удалось рассчитать маршрут. Проверьте подключение и попробуйте ещё раз.');
    }
  });

  return (
    <main className="mx-auto max-w-3xl space-y-6">
      <Link to="/logistics/routes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> К списку маршрутов
      </Link>
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <RouteIcon className="size-5" aria-hidden="true" /> Рассчитать маршрут
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Укажите начало и пункт назначения, чтобы получить оценку расстояния, времени, стоимости и выбросов.</p>
      </header>

      <Card>
        <CardHeader><CardTitle className="text-base">Маршрут</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={calculate} className="space-y-4" noValidate>
              <FormFieldInput control={form.control} name="origin" label="Откуда" placeholder="Например, Warszawa DC" />
              <FormFieldInput control={form.control} name="destination" label="Куда" placeholder="Например, Gdańsk Port" />
              {errorMessage && <p role="alert" className="text-sm text-destructive">{errorMessage}</p>}
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Рассчитываем…' : 'Рассчитать маршрут'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <section aria-live="polite" aria-label="Результат расчёта">
          <h2 className="mb-3 text-base font-semibold">Результат</h2>
          <dl className="grid gap-x-8 gap-y-4 border-y py-5 sm:grid-cols-2">
            <div><dt className="text-sm text-muted-foreground">Расстояние</dt><dd className="mt-1 font-medium">{result.distanceKm.toLocaleString('ru-RU')} км</dd></div>
            <div><dt className="text-sm text-muted-foreground">Расчётное время</dt><dd className="mt-1 font-medium">{result.durationHours.toLocaleString('ru-RU')} ч</dd></div>
            <div><dt className="text-sm text-muted-foreground">Расчётная стоимость</dt><dd className="mt-1 font-medium">{result.costPln.toLocaleString('ru-RU')} PLN</dd></div>
            <div><dt className="text-sm text-muted-foreground">Расчётные выбросы CO₂</dt><dd className="mt-1 font-medium">{result.co2Kg.toLocaleString('ru-RU')} кг</dd></div>
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">Оценка основана на данных сервиса маршрутизации. Назначение машины, остановки и отправка рейса выполняются в соответствующих разделах.</p>
        </section>
      )}
    </main>
  );
}

export default RoutePlannerPage;
