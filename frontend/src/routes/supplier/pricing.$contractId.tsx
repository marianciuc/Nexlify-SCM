import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronLeft, Tag, Building2, CheckCircle2, Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/supplier/pricing/$contractId')({
  component: PricingContractDetailPage,
  staticData: {
    crumb: {
      label: 'Условия контракта',
    },
  },
});

function PricingContractDetailPage() {
  const { contractId } = Route.useParams();

  const [contractPrice, setContractPrice] = useState(102.0);
  const [minOrderQty, setMinOrderQty] = useState(50);
  const [paymentTerms, setPaymentTerms] = useState('Отсрочка 30 дней (Net 30)');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Контракт ${contractId} обновлен и синхронизирован с сервисом заказов!`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/supplier/pricing"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Назад к ценовым контрактам
          </Link>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <h1 className="text-2xl font-bold text-foreground">
              Условия контракта: <span className="font-mono text-primary">{contractId}</span>
            </h1>
            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-xs">
              Действующее соглашение
            </Badge>
          </div>
        </div>

        <Button
          size="sm"
          className="w-full sm:w-auto gap-2 font-semibold"
          onClick={handleSave}
        >
          <Save className="h-4 w-4" /> Сохранить изменения контракта
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Buyer Identity */}
        <Card className="border-border">
          <CardHeader className="py-3 px-5 border-b">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> Контрагент по договору
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block">Юридическое лицо покупателя:</span>
              <span className="font-bold text-foreground text-sm">
                Baltic Retail Group Sp. z o.o.
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Налоговый номер:</span>
              <span className="font-mono font-bold text-foreground">NIP: 8522619472</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Статус верификации:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Подтвержден VIES / Лимит торгового кредита активен
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Contracted SKU */}
        <Card className="border-border">
          <CardHeader className="py-3 px-5 border-b">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" /> Контрактная номенклатура и цена
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block">Позиция по контракту (SKU):</span>
              <span className="font-mono font-bold text-primary">SKU-PAL-01 (Европаллеты EPAL)</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Базовая цена по общему каталогу:</span>
              <span className="font-mono line-through text-muted-foreground">120.00 PLN / шт.</span>
            </div>
            <div className="space-y-1 pt-1">
              <Label className="text-xs">Фиксированная цена контракта (PLN без НДС):</Label>
              <Input
                type="number"
                value={contractPrice}
                onChange={(e) => setContractPrice(Number(e.target.value))}
                className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <Label className="text-2xs text-muted-foreground">Минимальная партия (MOQ):</Label>
                <Input
                  type="number"
                  value={minOrderQty}
                  onChange={(e) => setMinOrderQty(Number(e.target.value))}
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-2xs text-muted-foreground">Условия оплаты:</Label>
                <Input
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default PricingContractDetailPage;
