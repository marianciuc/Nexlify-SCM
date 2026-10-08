import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import {
  ChevronLeft,
  FileQuestion,
  Plus,
  Trash2,
  ShieldCheck,
  Layers,
  Tag,
  Factory,
  ChevronDown,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  FormFieldInput,
  FormFieldNumber,
  FormFieldTextarea,
} from '@/components/forms/common';
import { MoneyDisplay } from '@/components/money-display';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useLocale } from '@/hooks/useLocale';
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
      label: 'buyer.requests.create.crumb',
    },
  },
});

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
  const { t } = useLocale();
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
              className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20"
            >
              <Tag className="h-2.5 w-2.5" aria-hidden="true" />
              {b.code || b.name}
              <button
                type="button"
                onClick={() => toggle(b.id)}
                aria-label={t('buyer.requests.create.brands.removeAria', { name: b.name })}
                className="ml-0.5 text-primary hover:text-foreground"
              >
                <X className="h-2.5 w-2.5" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between text-xs border border-input rounded-md px-3 py-2 bg-background hover:border-primary/50 transition-colors text-left"
      >
        <span className={selected.length === 0 ? 'text-muted-foreground' : 'text-foreground'}>
          {selected.length === 0
            ? t('buyer.requests.create.brands.any')
            : t('buyer.requests.create.brands.selectedCount', { count: selected.length })}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 w-full bg-popover border border-border rounded-lg shadow-md overflow-hidden">
          <div className="p-2 border-b border-border">
            <Input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('buyer.requests.create.brands.searchPlaceholder')}
              aria-label={t('buyer.requests.create.brands.searchPlaceholder')}
              className="h-7 text-xs bg-background"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-4">
                {t('buyer.requests.create.brands.notFound')}
              </div>
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
                    <span className="text-[11px] font-mono font-bold text-primary bg-primary/10 px-1.5 rounded">
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
              className="text-[11px] text-muted-foreground hover:text-foreground"
            >
              {t('buyer.requests.create.brands.resetAll')}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[11px] text-primary font-semibold hover:underline"
            >
              {t('buyer.requests.create.brands.done')}
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
  const { t } = useLocale();
  const activeCategory = categories.find((c) => c.id === categoryId);
  const subcategories = activeCategory?.children || [];

  return (
    <div className="space-y-2">
      <span className="text-xs font-semibold text-foreground block">
        {t('buyer.requests.create.category.label')}
      </span>

      <div className="flex flex-wrap gap-2" role="group" aria-label={t('buyer.requests.create.category.label')}>
        {categories
          .filter((c) => c.isActive)
          .map((cat) => (
            <button
              key={cat.id}
              type="button"
              aria-pressed={categoryId === cat.id}
              onClick={() => {
                onCategoryChange(cat.id);
                onSubcategoryChange('');
              }}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
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
          <span className="text-[11px] font-semibold text-muted-foreground self-center">
            {t('buyer.requests.create.category.subcategoryLabel')}
          </span>
          <button
            type="button"
            onClick={() => onSubcategoryChange('')}
            aria-pressed={subcategoryId === ''}
            className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition-colors ${
              subcategoryId === ''
                ? 'bg-muted text-foreground border-border'
                : 'bg-background text-muted-foreground border-border hover:border-foreground/30'
            }`}
          >
            {t('buyer.requests.create.category.all')}
          </button>
          {subcategories.map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => onSubcategoryChange(sub.id)}
              aria-pressed={subcategoryId === sub.id}
              className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition-colors ${
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
  return <CreateRfqContent />;
}

function CreateRfqContent() {
  const { t } = useLocale();
  const navigate = useNavigate();

  const { data: categories = INITIAL_CATEGORIES } = useCategoriesQuery();
  const { data: brands = INITIAL_BRANDS } = useBrandsQuery();
  const { data: manufacturers = INITIAL_MANUFACTURERS } = useManufacturersQuery();

  // Validation messages are user-visible — rebuild the schema per active locale.
  const rfqSchema = useMemo(
    () =>
      z.object({
        title: z.string().min(1, t('buyer.requests.create.validation.titleRequired')),
        categoryId: z.string().min(1, t('buyer.requests.create.validation.categoryRequired')),
        subcategoryId: z.string().optional(),
        deliveryLocation: z.string().min(1, t('buyer.requests.create.validation.deliveryRequired')),
        deadline: z.string().min(1, t('buyer.requests.create.validation.deadlineRequired')),
        description: z.string().optional(),
        brandPreferences: z.array(z.string()),
        manufacturerPreference: z.string().optional(),
        globalAllowSubstitutes: z.boolean(),
        items: z
          .array(
            z.object({
              id: z.string(),
              sku: z.string().min(1, t('buyer.requests.create.validation.skuRequired')),
              name: z.string().min(1, t('buyer.requests.create.validation.nameRequired')),
              quantity: z.number().int().min(1, t('buyer.requests.create.validation.qtyMin')),
              unit: z.string().min(1, t('buyer.requests.create.validation.unitRequired')),
              targetUnitPrice: z.number().positive(t('buyer.requests.create.validation.pricePositive')),
              allowSubstitute: z.boolean(),
              specNotes: z.string().optional(),
            })
          )
          .min(1, t('buyer.requests.create.validation.minItems')),
      }),
    [t]
  );

  type RfqFormData = z.infer<typeof rfqSchema>;

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

  const UNIT_OPTIONS = useMemo(
    () => [
      { value: 'pcs', label: t('buyer.requests.create.unit.pcs') },
      { value: 'kg', label: t('buyer.requests.create.unit.kg') },
      { value: 'rolls', label: t('buyer.requests.create.unit.rolls') },
      { value: 'pallets', label: t('buyer.requests.create.unit.pallets') },
      { value: 'm3', label: t('buyer.requests.create.unit.m3') },
      { value: 'boxes', label: t('buyer.requests.create.unit.boxes') },
      { value: 'units', label: t('buyer.requests.create.unit.units') },
    ],
    [t]
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
      toast.error(t('buyer.requests.create.validation.minItemsToast'));
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
      toast.error(
        error instanceof Error
          ? error.message
          : t('buyer.requests.create.validation.submitFailed')
      );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto min-w-0">
      <div>
        <Link
          to="/buyer/requests"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          {t('buyer.requests.create.backToRequests')}
        </Link>
      </div>

      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <FileQuestion className="h-5 w-5 text-primary" aria-hidden="true" />
            {t('buyer.requests.create.title')}
          </span>
        }
        subtitle={t('buyer.requests.create.subtitle')}
        actions={
          <Badge variant="outline" className="font-mono text-xs">
            {t('buyer.requests.create.itemCountBadge', { count: fields.length })}
          </Badge>
        }
      />

      <Card className="border-border bg-card shadow-xs">
        <CardContent className="p-4 sm:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

              {/* Tender Scope & Logistics */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t('buyer.requests.create.sections.scope')}
                </h3>

                <FormFieldInput
                  control={form.control}
                  name="title"
                  label={t('buyer.requests.create.fields.title')}
                  placeholder={t('buyer.requests.create.fields.titlePlaceholder')}
                  className="text-sm font-semibold"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border border-border bg-muted/20 p-4">
                  <FormFieldInput
                    control={form.control}
                    name="deliveryLocation"
                    label={t('buyer.requests.create.fields.deliveryLocation')}
                  />
                  <FormFieldInput
                    control={form.control}
                    name="deadline"
                    type="date"
                    label={t('buyer.requests.create.fields.deadline')}
                    className="font-mono"
                  />
                </div>

                <FormFieldTextarea
                  control={form.control}
                  name="description"
                  label={t('buyer.requests.create.fields.description')}
                  placeholder={t('buyer.requests.create.fields.descriptionPlaceholder')}
                  rows={2}
                />
              </div>

              {/* Category Hierarchy */}
              <div className="space-y-4 border-t border-border pt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t('buyer.requests.create.sections.category')}
                </h3>
                <CategoryHierarchySelect
                  categories={categories}
                  categoryId={watchedCategoryId}
                  subcategoryId={watchedSubcategoryId}
                  onCategoryChange={(id) => form.setValue('categoryId', id)}
                  onSubcategoryChange={(id) => form.setValue('subcategoryId', id)}
                />
              </div>

              {/* Brand & Manufacturer Preferences */}
              <div className="space-y-4 border-t border-border pt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  {t('buyer.requests.create.sections.brands')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground block">
                      {t('buyer.requests.create.fields.brands')}{' '}
                      <span className="text-muted-foreground font-normal">
                        {t('buyer.requests.create.fields.brandsOptional')}
                      </span>
                    </label>
                    <BrandMultiSelect
                      brands={brands as Brand[]}
                      selected={watchedBrandPreferences}
                      onChange={(ids) => form.setValue('brandPreferences', ids)}
                    />
                    {watchedBrandPreferences.length > 0 && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                        {t('buyer.requests.create.brands.substitutesHint')}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground block">
                      {t('buyer.requests.create.fields.manufacturer')}{' '}
                      <span className="text-muted-foreground font-normal">
                        {t('buyer.requests.create.fields.manufacturerOptional')}
                      </span>
                    </label>
                    <div className="relative">
                      <Factory className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" aria-hidden="true" />
                      <select
                        value={watchedManufacturer}
                        onChange={(e) => form.setValue('manufacturerPreference', e.target.value)}
                        aria-label={t('buyer.requests.create.fields.manufacturer')}
                        className="w-full text-xs pl-8 pr-8 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors appearance-none cursor-pointer"
                      >
                        <option value="">{t('buyer.requests.create.manufacturer.any')}</option>
                        {(manufacturers as Manufacturer[])
                          .filter((m) => m.isActive)
                          .map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}{m.country ? ` (${m.country})` : ''}
                            </option>
                          ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Procurement Bill of Materials */}
              <div className="space-y-4 border-t border-border pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary" aria-hidden="true" />
                      {t('buyer.requests.create.sections.items')}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t('buyer.requests.create.items.hint')}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddItem}
                    className="text-xs gap-1.5 h-8 self-start sm:self-auto"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t('buyer.requests.create.items.add')}</span>
                  </Button>
                </div>

                <div className="border border-border rounded-lg overflow-x-auto shadow-xs">
                  <table className="w-full text-xs text-left min-w-[700px]">
                    <caption className="sr-only">{t('buyer.requests.create.sections.items')}</caption>
                    <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th scope="col" className="py-2.5 px-3">#</th>
                        <th scope="col" className="py-2.5 px-3">{t('buyer.requests.create.items.col.item')}</th>
                        <th scope="col" className="py-2.5 px-3 w-32">{t('buyer.requests.create.items.col.qty')}</th>
                        <th scope="col" className="py-2.5 px-3 w-32">{t('buyer.requests.create.items.col.price')}</th>
                        <th scope="col" className="py-2.5 px-3 text-right w-32">{t('buyer.requests.create.items.col.total')}</th>
                        <th scope="col" className="py-2.5 px-3 text-center w-28">{t('buyer.requests.create.items.col.substitute')}</th>
                        <th scope="col" className="py-2.5 px-2 w-10">
                          <span className="sr-only">{t('common.actions')}</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {fields.map((field, idx) => {
                        const itemValues = form.watch(`items.${idx}`);
                        const lineTotal =
                          (Number(itemValues?.quantity) || 0) * (Number(itemValues?.targetUnitPrice) || 0);

                        return (
                          <tr key={field.id} className="hover:bg-muted/30 align-top">
                            <td className="py-3 px-3 font-mono tabular-nums text-muted-foreground font-bold">{idx + 1}</td>
                            <td className="py-3 px-3 space-y-1 min-w-[220px]">
                              <Input
                                {...form.register(`items.${idx}.name`)}
                                aria-label={t('buyer.requests.create.items.aria.name', { index: idx + 1 })}
                                className="h-7 text-xs font-semibold text-foreground bg-background"
                                placeholder={t('buyer.requests.create.items.namePlaceholder')}
                              />
                              <div className="flex items-center gap-2">
                                <Input
                                  {...form.register(`items.${idx}.sku`)}
                                  aria-label={t('buyer.requests.create.items.aria.sku', { index: idx + 1 })}
                                  className="h-6 w-32 text-[11px] font-mono text-muted-foreground uppercase bg-background"
                                  placeholder={t('buyer.requests.create.items.skuPlaceholder')}
                                />
                                <Input
                                  {...form.register(`items.${idx}.specNotes`)}
                                  aria-label={t('buyer.requests.create.items.aria.spec', { index: idx + 1 })}
                                  className="h-6 text-[11px] text-muted-foreground flex-1 bg-background"
                                  placeholder={t('buyer.requests.create.items.specPlaceholder')}
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
                                  aria-label={t('buyer.requests.create.items.aria.qty', { index: idx + 1 })}
                                  className="h-7 text-xs font-mono tabular-nums font-bold text-center bg-background"
                                />
                                <select
                                  {...form.register(`items.${idx}.unit`)}
                                  aria-label={t('buyer.requests.create.items.aria.unit', { index: idx + 1 })}
                                  className="h-7 px-1 text-[11px] font-mono border border-input rounded bg-background"
                                >
                                  {UNIT_OPTIONS.map((u) => (
                                    <option key={u.value} value={u.value}>{u.label}</option>
                                  ))}
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
                                  aria-label={t('buyer.requests.create.items.aria.price', { index: idx + 1 })}
                                  className="h-7 text-xs font-mono tabular-nums text-right bg-background"
                                />
                                <span className="text-[11px] text-muted-foreground font-mono">PLN</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <MoneyDisplay amount={lineTotal} variant="inline" className="text-xs font-bold text-foreground" />
                            </td>
                            <td className="py-3 px-3 text-center">
                              <label className="inline-flex items-center gap-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={!!itemValues?.allowSubstitute}
                                  aria-label={t('buyer.requests.create.items.aria.substitute', { index: idx + 1 })}
                                  onChange={(e) =>
                                    form.setValue(`items.${idx}.allowSubstitute`, e.target.checked)
                                  }
                                  className="rounded text-primary focus:ring-ring h-4 w-4"
                                />
                                <span className="text-[11px] text-muted-foreground">
                                  {itemValues?.allowSubstitute
                                    ? t('buyer.requests.create.items.yes')
                                    : t('buyer.requests.create.items.no')}
                                </span>
                              </label>
                            </td>
                            <td className="py-3 px-2 text-center">
                              {fields.length > 1 && (
                                <button
                                  type="button"
                                  aria-label={t('buyer.requests.create.items.aria.remove', { index: idx + 1 })}
                                  onClick={() => handleRemoveItem(idx)}
                                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                >
                                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-muted/30 border-t border-border">
                      <tr>
                        <td colSpan={4} className="py-3 px-3 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                          {t('buyer.requests.create.items.countLabel')}
                          <span className="ml-1.5 text-sm font-bold text-foreground tabular-nums">{fields.length}</span>
                        </td>
                        <td colSpan={3} className="py-3 px-3 text-right">
                          <span className="block text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                            {t('buyer.requests.create.items.budgetLabel')}
                          </span>
                          <MoneyDisplay
                            amount={totalCalculatedBudget}
                            variant="inline"
                            emphasize
                            className="text-base"
                          />
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Substitution Policy Banner */}
              <div className="p-4 bg-primary/5 border border-primary/25 rounded-lg flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                    {t('buyer.requests.create.substitutes.title')}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('buyer.requests.create.substitutes.description')}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={globalAllowSubstitutes}
                  aria-label={t('buyer.requests.create.substitutes.ariaLabel')}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    form.setValue('globalAllowSubstitutes', checked);
                    const currentItems = form.getValues('items');
                    form.setValue(
                      'items',
                      currentItems.map((item) => ({ ...item, allowSubstitute: checked }))
                    );
                  }}
                  className="h-5 w-5 rounded text-primary focus:ring-ring mt-1"
                />
              </div>

              {/* Submit Actions */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => navigate({ to: '/buyer/requests' })}>
                  {t('buyer.requests.create.actions.cancel')}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createRfqMutation.isPending}
                  className="gap-2 font-semibold shadow-xs"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  {createRfqMutation.isPending
                    ? t('buyer.requests.create.actions.submitting')
                    : t('buyer.requests.create.actions.submit', { count: fields.length })}
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
