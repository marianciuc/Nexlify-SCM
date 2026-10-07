import '@hookform/resolvers/zod';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { ChevronLeft, Barcode, CheckCircle2, Package, Weight, Printer, Truck, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOrdersQuery, INITIAL_ORDERS, useUpdateOrderStatusMutation, useCreateEcmrMutation } from '@/hooks/useScmQueries';

export const Route = createFileRoute('/supplier/orders/$orderId/fulfillment')({
  component: WarehouseFulfillmentWorkstation,
  staticData: {
    crumb: {
      label: 'АРМ комплектации WMS',
    },
  },
});

interface PickItem {
  sku: string;
  name: string;
  zone: string;
  bin: string;
  quantityRequired: number;
  quantityPicked: number;
  scannedBarcode: string;
  isVerified: boolean;
}

function WarehouseFulfillmentWorkstation() {
  const { orderId } = Route.useParams();
  const navigate = useNavigate();
  const { data: orders = INITIAL_ORDERS } = useOrdersQuery();
  const updateStatusMutation = useUpdateOrderStatusMutation();

  const order = orders.find((o) => o.id === orderId) || INITIAL_ORDERS[0]!;

  const [cargoWeightKg, setCargoWeightKg] = useState(2540);
  const [pickItems, setPickItems] = useState<PickItem[]>([
    {
      sku: 'SKU-PAL-01',
      name: 'EPAL Euro-Pallet Standard (Pine Wood)',
      zone: 'Зона A (Паллетные стеллажи)',
      bin: 'A-04-BIN-108',
      quantityRequired: 100,
      quantityPicked: 0,
      scannedBarcode: '5901234567890',
      isVerified: false,
    },
    {
      sku: 'SKU-STR-05',
      name: 'Industrial Stretch Film 23mic (Roll 300m)',
      zone: 'Зона C (Упаковочные материалы)',
      bin: 'C-01-BIN-042',
      quantityRequired: 40,
      quantityPicked: 0,
      scannedBarcode: '5909876543210',
      isVerified: false,
    },
  ]);

  const allVerified = pickItems.every((i) => i.isVerified);

  const barcodeForm = useForm<{ barcodeInput: string }>({
    defaultValues: {
      barcodeInput: '',
    },
  });

  const onScanBarcode = (data: { barcodeInput: string }) => {
    const input = data.barcodeInput.trim();
    if (!input) return;

    const itemIndex = pickItems.findIndex(
      (i) => !i.isVerified && (i.sku === input || i.scannedBarcode === input)
    );

    const itemToUpdate = itemIndex > -1 ? pickItems[itemIndex] : undefined;
    if (itemIndex > -1 && itemToUpdate) {
      const updated = [...pickItems];
      updated[itemIndex] = {
        ...itemToUpdate,
        quantityPicked: itemToUpdate.quantityRequired,
        isVerified: true,
      };
      setPickItems(updated);
      barcodeForm.reset();
      toast.success(`Верифицировано: ${itemToUpdate.name} (${itemToUpdate.quantityRequired} ед.)`);
    } else {
      toast.error('Штрихкод не найден в листе отбора или уже верифицирован');
    }
  };

  const handleQuickVerifyAll = () => {
    setPickItems(
      pickItems.map((i) => ({
        ...i,
        quantityPicked: i.quantityRequired,
        isVerified: true,
      }))
    );
    toast.success('Все позиции подтверждены на посту упаковки');
  };

  const createEcmrMutation = useCreateEcmrMutation();

  const handleDispatchOrder = async () => {
    await updateStatusMutation.mutateAsync({
      orderId: order.id,
      nextStatus: 'SHIPPED',
    });
    await createEcmrMutation.mutateAsync({
      orderNumber: order.orderNumber,
      carrierName: 'Nexlify Fleet Express (WI 49102)',
      consigneeName: order.customerName,
      destinationCity: order.deliveryCity,
    });
    toast.success(`Заказ ${order.orderNumber} передан в доставку! Накладная e-CMR сформирована.`);
    navigate({ to: '/supplier/orders' });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/supplier/orders"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Назад к очереди комплектации
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-2xl font-bold text-foreground">
              АРМ комплектации и отгрузки WMS
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Комплектация заказа: <span className="font-mono font-bold text-foreground">{order.orderNumber}</span> • Покупатель: {order.customerName}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.success('Сформирована и напечатана паллетная этикетка GS1-128')}
          className="gap-1.5 w-full sm:w-auto"
        >
          <Printer className="h-3.5 w-3.5" />
          Печать этикеток GS1-128
        </Button>
      </div>

      {/* Order Fulfillment Lifecycle Bar */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="py-2.5 px-4 bg-muted/30 border-b border-border">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-muted-foreground">
              Статус заказа: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{order.status}</span>
            </span>
            <span className="text-2xs text-muted-foreground">Процесс исполнения WMS (Шаг 6 из 9: Комплектация)</span>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-2xs overflow-x-auto gap-2 py-1">
            {['DRAFT', 'SUBMITTED', 'RESERVED', 'AWAITING_PAYMENT', 'PAID', 'IN_PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'].map((st, idx) => {
              const isPast = idx <= 5;
              const isCurrent = st === 'IN_PROCESSING';
              return (
                <div key={st} className="flex items-center gap-1 shrink-0">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                    isCurrent ? 'bg-amber-600 text-white animate-pulse' : isPast ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className={`font-medium ${isCurrent ? 'text-amber-600 dark:text-amber-400 font-bold' : isPast ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {st}
                  </span>
                  {idx < 8 && <span className="text-muted-foreground/40 ml-1">➔</span>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Barcode Scanner Input */}
      <Card className="border-amber-500/30 bg-amber-500/5 shadow-xs">
        <CardContent className="p-4">
          <Form {...barcodeForm}>
            <form onSubmit={barcodeForm.handleSubmit(onScanBarcode)} className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="relative w-full">
                <Barcode className="absolute left-3 top-2.5 h-4 w-4 text-amber-600 dark:text-amber-400" />
                <Input
                  {...barcodeForm.register('barcodeInput')}
                  placeholder="Отсканируйте штрихкод EAN-13 или введите артикул (напр., 5901234567890 или SKU-PAL-01)..."
                  className="pl-9 font-mono text-xs bg-background"
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button type="submit" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs shrink-0 cursor-pointer">
                  Верифицировать
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleQuickVerifyAll}
                  className="text-xs shrink-0 cursor-pointer"
                >
                  Подтвердить все
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Pick List Table */}
      <Card className="border-border bg-card shadow-xs overflow-hidden">
        <CardHeader className="py-3 px-5 border-b border-border flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" /> Электронный лист отбора (Pick List)
          </CardTitle>

          <Link
            to="/supplier/inventory/map"
            search={{ sku: pickItems[0]?.sku, bin: pickItems[0]?.bin, orderId }}
          >
            <Button size="sm" variant="outline" className="text-xs h-7 gap-1.5 border-primary/30">
              <MapPin className="h-3.5 w-3.5" /> Маршрут отбора на 2D-карте склада
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[720px]">
            <thead className="bg-muted/30 border-b border-border text-muted-foreground whitespace-nowrap">
              <tr>
                <th className="py-3 px-4 font-semibold">Зона и ячейка склада</th>
                <th className="py-3 px-4 font-semibold">Артикул / Наименование</th>
                <th className="py-3 px-4 font-semibold">Штрихкод EAN</th>
                <th className="py-3 px-4 text-right font-semibold">Требуется</th>
                <th className="py-3 px-4 text-right font-semibold">Отобрано</th>
                <th className="py-3 px-4 text-right font-semibold">Статус проверки</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border whitespace-nowrap">
              {pickItems.map((item) => (
                <tr
                  key={item.sku}
                  className={
                    item.isVerified
                      ? 'bg-emerald-500/5'
                      : 'hover:bg-muted/30'
                  }
                >
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-foreground">{item.zone}</div>
                    <Link
                      to="/supplier/inventory/map"
                      search={{ sku: item.sku, bin: item.bin, orderId }}
                      className="font-mono text-2xs text-amber-600 dark:text-amber-400 font-bold inline-flex items-center gap-1 hover:underline"
                      title="Показать ячейку на карте склада"
                    >
                      <MapPin className="h-3 w-3" /> {item.bin}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-foreground">{item.name}</div>
                    <div className="font-mono text-2xs text-muted-foreground">{item.sku}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-muted-foreground">{item.scannedBarcode}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-foreground">
                    {item.quantityRequired} шт
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-emerald-600 dark:text-emerald-400">
                    {item.quantityPicked} шт
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {item.isVerified ? (
                      <Badge className="bg-emerald-600 text-white text-2xs gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Отсканировано
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-2xs text-amber-700 dark:text-amber-400 border-amber-500/30">
                        Ожидает сканирования
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Cargo Weighing & Dispatch Finalization */}
      <Card className="border-border bg-card">
        <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-muted text-muted-foreground shrink-0">
              <Weight className="h-6 w-6" />
            </div>
            <div>
              <Label className="text-xs font-semibold">Контрольная масса на весах (брутто, кг):</Label>
              <Input
                type="number"
                value={cargoWeightKg}
                onChange={(e) => setCargoWeightKg(Number(e.target.value))}
                className="w-36 font-mono font-bold text-sm mt-1 bg-background"
              />
            </div>
          </div>

          <div className="flex items-center">
            <Button
              size="sm"
              disabled={!allVerified}
              onClick={handleDispatchOrder}
              className="gap-2 font-bold shadow-xs w-full sm:w-auto"
            >
              <Truck className="h-4 w-4" />
              Подтвердить комплектацию и отгрузить
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

