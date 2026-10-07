import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import {
  ChevronLeft,
  FileQuestion,
  Plus,
  Trash2,
  ShieldCheck,
  Layers,
  Sparkles,
  Tag,
  Factory,
  ChevronDown,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  FormFieldInput,
  FormFieldNumber,
  FormFieldTextarea,
} from '@/components/forms/common';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  useCreateRfqMutation,
  useCategoriesQuery,
  useBrandsQuery,
  useManufacturersQuery,
  INITIAL_CATEGORIES,
  INITIAL_BRANDS,
  INITIAL_MANUFACTURERS,
} from '@/hooks/useScmQueries';
import type { CategoryNode, Brand, Manufacturer } from '@/types/scm-domain';

export const Route = createFileRoute('/buyer/requests/new')({
  component: CreateRfqPage,
  staticData: {
    crumb: {
      label: 'Новый тендер RFQ',
    },
  },
});

const rfqLineItemSchema = z.object({
  id: z.string(),
  sku: z.string().min(1, 'Артикул (SKU) обязателен'),
  name: z.string().min(1, 'Наименование позиции обязательно'),
  quantity: z.number().int().min(1, 'Количество должно быть >= 1'),
  unit: z.string().min(1, 'Единица измерения обязательна'),
  targetUnitPrice: z.number().positive('Целевая цена должна быть положительной'),
  allowSubstitute: z.boolean(),
  specNotes: z.string().optional(),
});

const rfqSchema = z.object({
  title: z.string().min(1, 'Название тендера обязательно'),
  categoryId: z.string().min(1, 'Категория обязательна'),
  subcategoryId: z.string().optional(),
  deliveryLocation: z.string().min(1, 'Пункт назначения обязателен'),
  deadline: z.string().min(1, 'Срок подачи заявок обязателен'),
  description: z.string().optional(),
  brandPreferences: z.array(z.string()),
  manufacturerPreference: z.string().optional(),
  globalAllowSubstitutes: z.boolean(),
  items: z.array(rfqLineItemSchema).min(1, 'Тендер должен содержать хотя бы одну позицию'),
});

type RfqFormData = z.infer<typeof rfqSchema>;

// Brand Multi-Select Combobox
function BrandMultiSelect({
  brands,
  selected,
  onChange,
}: {
  brands: Brand[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = brands.filter(
    (b) =>
      b.isActive &&
      (b.name.toLowerCase().includes(search.toLowerCase()) ||
        (b.code || '').toLowerCase().includes(search.toLowerCase()))
  );

  const selectedBrands = brands.filter((b) => selected.includes(b.id));

  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  };

  return (
    <div className="relative">
      {selectedBrands.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedBrands.map((b) => (
            <span
              key={b.id}
              className="inline-flex items-center gap-1 text-2xs font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20"
            >
              <Tag className="h-2.5 w-2.5" />
              {b.code || b.name}
              <button
                type="button"
                onClick={() => toggle(b.id)}
                className="ml-0.5 text-primary hover:text-foreground cursor-pointer"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-xs border border-input rounded-md px-3 py-2 bg-background hover:border-primary/50 transition-colors text-left"
      >
        <span className={selected.length === 0 ? 'text-muted-foreground' : 'text-foreground'}>
          {selected.length === 0 ? 'Любые бренды (открытый тендер)' : `Выбрано брендов: ${selected.length}`}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 w-full bg-popover border border-border rounded-lg shadow-md overflow-hidden">
          <div className="p-2 border-b border-border">
            <Input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск бренда..."
              className="h-7 text-xs bg-background"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-4">Бренды не найдены</div>
            ) : (
              filtered.map((brand) => (
                <label
                  key={brand.id}
                  className="flex items-center gap-2.5 px-3 py-2 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(brand.id)}
                    onChange={() => toggle(brand.id)}
                    className="rounded text-primary focus:ring-ring h-3.5 w-3.5"
                  />
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-2xs font-mono font-bold text-primary bg-primary/10 px-1.5 rounded">
                      {brand.code || brand.name.slice(0, 8)}
                    </span>
                    <span className="text-xs text-foreground truncate">{brand.name}</span>
                  </div>
                </label>
              ))
            )}
          </div>
          <div className="p-2 border-t border-border flex justify-between bg-muted/20">
            <button
              type="button"
              onClick={() => { onChange([]); setOpen(false); }}
              className="text-2xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Сбросить все
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-2xs text-primary font-semibold hover:underline cursor-pointer"
            >
              Готово
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Category Hierarchy Selector
function CategoryHierarchySelect({
  categories,
  categoryId,
  subcategoryId,
  onCategoryChange,
  onSubcategoryChange,
}: {
  categories: CategoryNode[];
  categoryId: string;
  subcategoryId: string;
  onCategoryChange: (id: string) => void;
  onSubcategoryChange: (id: string) => void;
}) {
  const activeCategory = categories.find((c) => c.id === categoryId);
  const subcategories = activeCategory?.children || [];

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-foreground block">
        Категория продукции:
      </label>

      <div className="flex flex-wrap gap-2">
        {categories
          .filter((c) => c.isActive)
          .map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                onCategoryChange(cat.id);
                onSubcategoryChange('');
              }}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all cursor-pointer ${
                categoryId === cat.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
              }`}
            >
              {cat.name}
            </button>
          ))}
      </div>

      {subcategories.length > 0 && (
        <div className="flex flex-wrap gap-2 pl-3 border-l-2 border-primary/30">
          <span className="text-2xs font-semibold text-muted-foreground self-center">Подкатегория:</span>
          <button
            type="button"
            onClick={() => onSubcategoryChange('')}
            className={`text-2xs px-2.5 py-1 rounded-full border font-medium transition-all cursor-pointer ${
              subcategoryId === ''
                ? 'bg-muted text-foreground border-border'
                : 'bg-background text-muted-foreground border-border hover:border-foreground/30'
            }`}
          >
            Все
          </button>
          {subcategories.map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => onSubcategoryChange(sub.id)}
              className={`text-2xs px-2.5 py-1 rounded-full border font-medium transition-all cursor-pointer ${
                subcategoryId === sub.id
                  ? 'bg-primary/10 text-primary border-primary/30 font-semibold'
                  : 'bg-background text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function CreateRfqPage() {
  const navigate = useNavigate();

  const { data: categories = INITIAL_CATEGORIES } = useCategoriesQuery();
  const { data: brands = INITIAL_BRANDS } = useBrandsQuery();
  const { data: manufacturers = INITIAL_MANUFACTURERS } = useManufacturersQuery();

  const form = useForm<RfqFormData>({
    resolver: zodResolver(rfqSchema),
    defaultValues: {
      title: '',
      categoryId: 'cat-pkg',
      subcategoryId: '',
      deliveryLocation: '',
      deadline: '',
      description: '',
      brandPreferences: [],
      manufacturerPreference: '',
      globalAllowSubstitutes: true,
      items: [
        {
          id: 'item-1',
          sku: '',
          name: '',
          quantity: 1,
          unit: 'pcs',
          targetUnitPrice: 0,
          allowSubstitute: true,
          specNotes: '',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' });

  const watchedItems = form.watch('items');
  const globalAllowSubstitutes = form.watch('globalAllowSubstitutes');
  const watchedCategoryId = form.watch('categoryId');
  const watchedSubcategoryId = form.watch('subcategoryId') ?? '';
  const watchedBrandPreferences = form.watch('brandPreferences');
  const watchedManufacturer = form.watch('manufacturerPreference') ?? '';

  const totalCalculatedBudget = (watchedItems || []).reduce(
    (acc, item) => acc + (Number(item?.quantity) || 0) * (Number(item?.targetUnitPrice) || 0),
    0
  );

  const handleAddItem = () => {
    append({
      id: `line-${Date.now()}`,
      sku: '',
      name: '',
      quantity: 1,
      unit: 'pcs',
      targetUnitPrice: 0,
      allowSubstitute: globalAllowSubstitutes,
      specNotes: '',
    });
  };

  const handleRemoveItem = (index: number) => {
    if (fields.length <= 1) {
      toast.error('Tender must contain at least 1 line item');
      return;
    }
    remove(index);
  };

  const createRfqMutation = useCreateRfqMutation();

  const onSubmit = async (data: RfqFormData) => {
    const requestedBudget = data.items.reduce((sum, line) => sum + line.quantity * line.targetUnitPrice, 0);
    const activeCat = categories.find((c) => c.id === data.categoryId);
    const activeSub = activeCat?.children?.find((c) => c.id === data.subcategoryId);
    const brandNames = (brands as Brand[])
      .filter((b) => data.brandPreferences.includes(b.id))
      .map((b) => b.name)
      .join(', ');

    const preferredManufacturer = (manufacturers as Manufacturer[]).find((item) => item.id === data.manufacturerPreference)?.name;
    const addressParts = data.deliveryLocation.split(',').map((part) => part.trim()).filter(Boolean);
    const details = [
      data.description,
      brandNames ? `Предпочтительные бренды: ${brandNames}.` : '',
      preferredManufacturer ? `Предпочтительный изготовитель: ${preferredManufacturer}.` : '',
      ...data.items.map((line) => `SKU ${line.sku}: целевая цена ${line.targetUnitPrice.toFixed(2)} PLN/${line.unit}. ${line.specNotes || ''}`),
    ].filter(Boolean).join('\n');

    try {
      await createRfqMutation.mutateAsync({
        title: data.title,
        category: activeSub?.name || activeCat?.name || data.categoryId,
        description: details,
        deadline: new Date(`${data.deadline}T23:59:59`).toISOString(),
        deliveryAddress: addressParts[0],
        deliveryCity: addressParts.length > 1 ? addressParts.slice(1).join(', ') : undefined,
        budgetAmount: requestedBudget,
        budgetHidden: false,
        currency: 'PLN',
        items: data.items.map((line) => ({
          sku: line.sku,
          productName: line.name,
          quantity: line.quantity,
          unitOfMeasure: line.unit,
          description: line.specNotes,
          allowAlternatives: line.allowSubstitute && data.globalAllowSubstitutes,
        })),
      });
      navigate({ to: '/buyer/requests' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось опубликовать тендер. Проверьте данные и повторите попытку.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          to="/buyer/requests"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Назад к реестру тендеров RFQ
        </Link>
      </div>

      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="bg-muted/30 border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileQuestion className="h-5 w-5 text-primary" />
              Публикация тендера RFQ с детализацией позиций
            </CardTitle>
            <Badge variant="outline" className="font-mono text-xs">
              Позиций в спецификации: {fields.length}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Укажите требуемые товары, плановые объемы, ценовые лимиты и возможность предложения аналогов.
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* 1. Tender Scope & Logistics */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  1. Параметры тендера и условия логистики
                </h3>

                <FormFieldInput
                  control={form.control}
                  name="title"
                  label="Наименование тендера:"
                  placeholder="Например: Оптовая закупка европоддонов EPAL и стретч-пленки Q4/2026"
                  className="text-sm font-semibold"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormFieldInput
                    control={form.control}
                    name="deliveryLocation"
                    label="Логистический хаб назначения:"
                  />
                  <FormFieldInput
                    control={form.control}
                    name="deadline"
                    type="date"
                    label="Срок подачи предложений:"
                    className="font-mono"
                  />
                </div>

                <FormFieldTextarea
                  control={form.control}
                  name="description"
                  label="Технические требования и условия поставки:"
                  placeholder="Укажите условия контракта, требуемые сертификаты (ISPM-15, ISO, CE), требования к разгрузочной рампе..."
                  rows={2}
                />
              </div>

              {/* 2. Category Hierarchy */}
              <div className="space-y-4 border-t border-border pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  2. Категория и подкатегория
                </h3>
                <CategoryHierarchySelect
                  categories={categories}
                  categoryId={watchedCategoryId}
                  subcategoryId={watchedSubcategoryId}
                  onCategoryChange={(id) => form.setValue('categoryId', id)}
                  onSubcategoryChange={(id) => form.setValue('subcategoryId', id)}
                />
              </div>

              {/* 3. Brand & Manufacturer Preferences */}
              <div className="space-y-4 border-t border-border pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5 text-primary" />
                  3. Требования к брендам и производителям
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground block">
                      Предпочтительные бренды{' '}
                      <span className="text-muted-foreground font-normal">(опционально — оставьте пустым для открытого тендера)</span>:
                    </label>
                    <BrandMultiSelect
                      brands={brands as Brand[]}
                      selected={watchedBrandPreferences}
                      onChange={(ids) => form.setValue('brandPreferences', ids)}
                    />
                    {watchedBrandPreferences.length > 0 && (
                      <p className="text-2xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        Поставщики других брендов могут подавать заявки как аналоги.
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground block">
                      Предпочтительный производитель{' '}
                      <span className="text-muted-foreground font-normal">(опционально)</span>:
                    </label>
                    <div className="relative">
                      <Factory className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                      <select
                        value={watchedManufacturer}
                        onChange={(e) => form.setValue('manufacturerPreference', e.target.value)}
                        className="w-full text-xs pl-8 pr-8 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors appearance-none cursor-pointer"
                      >
                        <option value="">Любой производитель (открытый тендер)</option>
                        {(manufacturers as Manufacturer[])
                          .filter((m) => m.isActive)
                          .map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}{m.country ? ` (${m.country})` : ''}
                            </option>
                          ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Procurement Bill of Materials */}
              <div className="space-y-4 border-t border-border pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                      <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      4. Спецификация закупки (запрашиваемые позиции)
                    </h3>
                    <p className="text-2xs text-muted-foreground">
                      Укажите конкретные позиции, необходимый объем, целевую цену и флаг разрешения аналогов.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddItem}
                    className="text-xs gap-1.5 h-8 self-start sm:self-auto cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Добавить позицию</span>
                  </Button>
                </div>

                <div className="border border-border rounded-lg overflow-x-auto shadow-xs">
                  <table className="w-full text-xs text-left min-w-[700px]">
                    <thead className="bg-muted/30 border-b border-border text-muted-foreground font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Артикул и наименование</th>
                        <th className="py-2.5 px-3 w-28">Количество</th>
                        <th className="py-2.5 px-3 w-32">Целевая цена</th>
                        <th className="py-2.5 px-3 text-right w-32">Сумма по позиции</th>
                        <th className="py-2.5 px-3 text-center w-28">Аналог?</th>
                        <th className="py-2.5 px-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {fields.map((field, idx) => {
                        const itemValues = form.watch(`items.${idx}`);
                        const lineTotal =
                          (Number(itemValues?.quantity) || 0) * (Number(itemValues?.targetUnitPrice) || 0);

                        return (
                          <tr key={field.id} className="hover:bg-muted/30">
                            <td className="py-3 px-3 font-mono tabular-nums text-muted-foreground font-bold">{idx + 1}</td>
                            <td className="py-3 px-3 space-y-1">
                              <div className="flex items-center gap-2">
                                <Input
                                  {...form.register(`items.${idx}.name`)}
                                  aria-label={`Item name ${idx + 1}`}
                                  className="h-7 text-xs font-semibold text-foreground bg-background"
                                  placeholder="Наименование товара"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <Input
                                  {...form.register(`items.${idx}.sku`)}
                                  aria-label={`SKU code item ${idx + 1}`}
                                  className="h-6 w-32 text-2xs font-mono text-muted-foreground uppercase bg-background"
                                  placeholder="Артикул SKU"
                                />
                                <Input
                                  {...form.register(`items.${idx}.specNotes`)}
                                  aria-label={`Specifications item ${idx + 1}`}
                                  className="h-6 text-2xs text-muted-foreground flex-1 bg-background"
                                  placeholder="Технические требования и допуски"
                                />
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1">
                                <FormFieldNumber
                                  control={form.control}
                                  name={`items.${idx}.quantity`}
                                  min={1}
                                  step={1}
                                  aria-label={`Quantity item ${idx + 1}`}
                                  className="h-7 text-xs font-mono tabular-nums font-bold text-center bg-background"
                                />
                                <select
                                  {...form.register(`items.${idx}.unit`)}
                                  aria-label={`Unit item ${idx + 1}`}
                                  className="h-7 px-1 text-2xs font-mono border border-input rounded bg-background"
                                >
                                  <option value="pcs">шт</option>
                                  <option value="kg">кг</option>
                                  <option value="rolls">рулон</option>
                                  <option value="pallets">паллета</option>
                                  <option value="m3">м³</option>
                                  <option value="boxes">короб</option>
                                  <option value="units">ед.</option>
                                </select>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1">
                                <FormFieldNumber
                                  control={form.control}
                                  name={`items.${idx}.targetUnitPrice`}
                                  min={0.01}
                                  step={0.01}
                                  aria-label={`Target price item ${idx + 1}`}
                                  className="h-7 text-xs font-mono tabular-nums text-right bg-background"
                                />
                                <span className="text-2xs text-muted-foreground font-mono">PLN</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-foreground">
                              {lineTotal.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}&nbsp;PLN
                            </td>
                            <td className="py-3 px-3 text-center">
                              <label className="inline-flex items-center gap-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={!!itemValues?.allowSubstitute}
                                  aria-label={`Allow substitute item ${idx + 1}`}
                                  onChange={(e) =>
                                    form.setValue(`items.${idx}.allowSubstitute`, e.target.checked)
                                  }
                                  className="rounded text-primary focus:ring-ring h-4 w-4"
                                />
                                <span className="text-2xs text-muted-foreground">
                                  {itemValues?.allowSubstitute ? 'Да' : 'Нет'}
                                </span>
                              </label>
                            </td>
                            <td className="py-3 px-2 text-center">
                              {fields.length > 1 && (
                                <button
                                  type="button"
                                  aria-label={`Remove item ${idx + 1}`}
                                  onClick={() => handleRemoveItem(idx)}
                                  className="text-muted-foreground hover:text-destructive transition-colors p-1 cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-2xs uppercase tracking-wider text-muted-foreground font-semibold block">
                        Позиций в запросе:
                      </span>
                      <span className="text-base font-bold text-foreground">
                        {fields.length}
                      </span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-2xs uppercase tracking-wider text-muted-foreground font-semibold block">
                      Расчетный лимит бюджета:
                    </span>
                    <span className="text-xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                      {totalCalculatedBudget.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} PLN
                    </span>
                  </div>
                </div>
              </div>

              {/* Substitution Policy Banner */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Политика предложения аналогов в B2B тендере
                  </div>
                  <p className="text-xs text-muted-foreground">
                    При включении поставщики могут предлагать альтернативные позиции для строк с отметкой «Аналог». Требуется подтверждение технических параметров и сертификатов.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={globalAllowSubstitutes}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    form.setValue('globalAllowSubstitutes', checked);
                    const currentItems = form.getValues('items');
                    form.setValue(
                      'items',
                      currentItems.map((item) => ({ ...item, allowSubstitute: checked }))
                    );
                  }}
                  className="h-5 w-5 rounded text-primary focus:ring-ring mt-1 cursor-pointer"
                />
              </div>

              {/* Submit Actions */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => navigate({ to: '/buyer/requests' })}>
                  Отмена
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createRfqMutation.isPending}
                  className="gap-2 font-semibold shadow-xs cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  {createRfqMutation.isPending ? 'Публикуем…' : `Опубликовать тендер (${fields.length} поз.)`}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateRfqPage;
