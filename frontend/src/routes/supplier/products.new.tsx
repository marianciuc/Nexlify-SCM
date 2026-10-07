import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { ChevronLeft, Package, Plus, Building2, Factory, Ruler, Layers } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  FormFieldInput,
  FormFieldSelect,
  FormFieldNumber,
} from '@/components/forms/common';
import {
  CreateBrandModal,
  CreateManufacturerModal,
  CreateCategoryModal,
} from '@/components/inventory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import {
  useCreateProductMutation,
  useCategoriesQuery,
  useBrandsQuery,
  useManufacturersQuery,
} from '@/hooks/useScmQueries';

export const Route = createFileRoute('/supplier/products/new')({
  component: CreateSkuPage,
  staticData: {
    crumb: {
      label: 'Новый артикул SKU',
    },
  },
});

const skuSchema = z.object({
  sku: z.string().min(1, 'Артикул (SKU) обязателен'),
  ean: z.string(),
  name: z.string().min(1, 'Наименование товара обязательно'),
  categoryId: z.string().min(1, 'Категория обязательна'),
  brandId: z.string(),
  manufacturerId: z.string(),
  dimensionLength: z.number().nonnegative(),
  dimensionWidth: z.number().nonnegative(),
  dimensionHeight: z.number().nonnegative(),
  dimensionUnit: z.string(),
  weightKg: z.number().positive('Масса должна быть положительной'),
  unit: z.string().min(1, 'Единица измерения обязательна'),
  basePrice: z.number().positive('Цена должна быть положительной'),
  moq: z.number().int().min(1, 'Минимальный заказ должен быть >= 1'),
  warehouse: z.string().min(1, 'Склад оприходования обязателен'),
  initialStock: z.number().int().min(0, 'Начальный остаток не может быть отрицательным'),
});

type SkuFormData = z.infer<typeof skuSchema>;

const UNIT_OPTIONS = [
  { value: 'pcs', label: 'Pieces (pcs / шт)' },
  { value: 'kg', label: 'Kilograms (kg / кг)' },
  { value: 'g', label: 'Grams (g / г)' },
  { value: 'l', label: 'Liters (l / л)' },
  { value: 'ml', label: 'Milliliters (ml / мл)' },
  { value: 'm', label: 'Meters (m / м)' },
  { value: 'cm', label: 'Centimeters (cm / см)' },
  { value: 'mm', label: 'Millimeters (mm / мм)' },
  { value: 'm2', label: 'Square Meters (m² / кв.м)' },
  { value: 'm3', label: 'Cubic Meters (m³ / куб.м)' },
  { value: 'box', label: 'Box (box / кор)' },
  { value: 'pallet', label: 'Pallet (pallet / палл)' },
  { value: 'pack', label: 'Pack (pack / упак)' },
];

const DIMENSION_UNITS = [
  { value: 'mm', label: 'Millimeters (mm)' },
  { value: 'cm', label: 'Centimeters (cm)' },
  { value: 'm', label: 'Meters (m)' },
  { value: 'in', label: 'Inches (in)' },
];

const warehouseOptions = [
  { value: 'Central DC Warszawa (WH-WAW-01)', label: 'Central DC Warszawa (WH-WAW-01)' },
  { value: 'Silesia Logistics Hub Katowice (WH-KTW-03)', label: 'Silesia Logistics Hub Katowice (WH-KTW-03)' },
  { value: 'Port Logistics Hub Szczecin (WH-SZC-02)', label: 'Port Logistics Hub Szczecin (WH-SZC-02)' },
];

function CreateSkuPage() {
  const navigate = useNavigate();

  const { data: categories = [] } = useCategoriesQuery();
  const { data: brands = [] } = useBrandsQuery();
  const { data: manufacturers = [] } = useManufacturersQuery();

  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [manufacturerModalOpen, setManufacturerModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  // Flatten categories and subcategories for the select dropdown
  const categoryOptions = useMemo(() => {
    const options: { value: string; label: string; group?: string }[] = [];
    categories.forEach((cat) => {
      // Main category
      options.push({
        value: cat.id,
        label: cat.name,
      });
      // Subcategories
      if (cat.children && cat.children.length > 0) {
        cat.children.forEach((sub) => {
          options.push({
            value: sub.id,
            label: `  ↳ ${sub.name} (${cat.name})`,
          });
        });
      }
    });
    return options;
  }, [categories]);

  const brandOptions = useMemo(() => {
    return [
      { value: 'none', label: '— No specific brand (Generic/OEM) —' },
      ...brands.map((b) => ({
        value: b.id,
        label: b.name,
      })),
    ];
  }, [brands]);

  const manufacturerOptions = useMemo(() => {
    return [
      { value: 'none', label: '— No specific manufacturer —' },
      ...manufacturers.map((m) => ({
        value: m.id,
        label: `${m.name}${m.country ? ` (${m.country})` : ''}`,
      })),
    ];
  }, [manufacturers]);

  const form = useForm<SkuFormData>({
    resolver: zodResolver(skuSchema),
    defaultValues: {
      sku: '',
      ean: '',
      name: '',
      categoryId: categories[0]?.id || 'cat-pkg',
      brandId: 'none',
      manufacturerId: 'none',
      dimensionLength: 1200,
      dimensionWidth: 800,
      dimensionHeight: 144,
      dimensionUnit: 'mm',
      weightKg: 15.0,
      unit: 'pcs',
      basePrice: 150.0,
      moq: 10,
      warehouse: 'Central DC Warszawa (WH-WAW-01)',
      initialStock: 500,
    },
  });

  const createProductMutation = useCreateProductMutation();

  const onSubmit = async (data: SkuFormData) => {
    // Resolve Category & Subcategory names
    let selectedCatName = 'Packaging & Cargo Units';
    let selectedSubcatName: string | undefined = undefined;
    let selectedSubcatId: string | undefined = undefined;

    for (const cat of categories) {
      if (cat.id === data.categoryId) {
        selectedCatName = cat.name;
        break;
      }
      if (cat.children) {
        const foundSub = cat.children.find((s) => s.id === data.categoryId);
        if (foundSub) {
          selectedCatName = cat.name;
          selectedSubcatName = foundSub.name;
          selectedSubcatId = foundSub.id;
          break;
        }
      }
    }

    // Resolve Brand
    const selectedBrand = brands.find((b) => b.id === data.brandId);
    const brandName = selectedBrand ? selectedBrand.name : undefined;
    const brandId = selectedBrand ? selectedBrand.id : undefined;

    // Resolve Manufacturer
    const selectedMfr = manufacturers.find((m) => m.id === data.manufacturerId);
    const manufacturerName = selectedMfr ? selectedMfr.name : undefined;
    const manufacturerId = selectedMfr ? selectedMfr.id : undefined;

    const dimensionsString =
      data.dimensionLength && data.dimensionWidth && data.dimensionHeight
        ? `${data.dimensionLength} x ${data.dimensionWidth} x ${data.dimensionHeight} ${data.dimensionUnit}`
        : undefined;

    await createProductMutation.mutateAsync({
      id: 'prod-' + Math.random().toString(36).substring(2, 7),
      sku: data.sku,
      ean: data.ean || undefined,
      name: data.name,
      category: selectedCatName,
      categoryId: data.categoryId,
      subcategory: selectedSubcatName,
      subcategoryId: selectedSubcatId,
      brand: brandName,
      brandId: brandId,
      manufacturer: manufacturerName,
      manufacturerId: manufacturerId,
      dimensions: dimensionsString,
      warehouse: data.warehouse,
      quantityAvailable: data.initialStock,
      quantityReserved: 0,
      unit: data.unit,
      unitPrice: data.basePrice,
      status: data.initialStock > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
    });

    navigate({ to: '/supplier/products' });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/supplier/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Назад к каталогу товаров
        </Link>
      </div>

      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="bg-muted/30 border-b border-border pb-4">
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Регистрация нового оптового артикула в WMS
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Настройка параметров номенклатуры, иерархической категории, бренда, производителя, габаритов и начального остатка.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: Identification & Taxonomy */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5 text-primary" />
                    1. Идентификация и классификация товара
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormFieldInput
                    control={form.control}
                    name="sku"
                    label="Артикул товара (SKU):"
                    placeholder="Например: SKU-BOX-12"
                    className="font-mono text-xs font-bold bg-background"
                  />

                  <FormFieldInput
                    control={form.control}
                    name="ean"
                    label="Штрихкод EAN-13 / GTIN:"
                    placeholder="5901234567890"
                    className="font-mono text-xs bg-background"
                  />
                </div>

                <FormFieldInput
                  control={form.control}
                  name="name"
                  label="Полное торговое наименование:"
                  placeholder="Например: Гофрокороб усиленный 5-слойный 600x400x400"
                  className="text-xs font-medium bg-background"
                />

                {/* Category with quick-add */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">
                      Категория / Подкатегория:
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCategoryModalOpen(true)}
                      className="h-6 px-2 text-[11px] text-primary hover:bg-muted gap-1 font-semibold"
                    >
                      <Plus className="h-3 w-3" /> Создать категорию
                    </Button>
                  </div>
                  <FormFieldSelect
                    control={form.control}
                    name="categoryId"
                    options={categoryOptions}
                    placeholder="Выберите категорию или подкатегорию..."
                  />
                </div>

                {/* Brand & Manufacturer with quick-add modals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-primary" />
                        Бренд:
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setBrandModalOpen(true)}
                        className="h-6 px-2 text-[11px] text-primary hover:bg-muted gap-1 font-semibold"
                      >
                        <Plus className="h-3 w-3" /> Создать бренд
                      </Button>
                    </div>
                    <FormFieldSelect
                      control={form.control}
                      name="brandId"
                      options={brandOptions}
                      placeholder="Выберите бренд..."
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                        <Factory className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        Производитель:
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setManufacturerModalOpen(true)}
                        className="h-6 px-2 text-[11px] text-emerald-600 hover:bg-muted gap-1 font-semibold"
                      >
                        <Plus className="h-3 w-3" /> Создать производителя
                      </Button>
                    </div>
                    <FormFieldSelect
                      control={form.control}
                      name="manufacturerId"
                      options={manufacturerOptions}
                      placeholder="Выберите производителя..."
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Logistics & Dimensions */}
              <div className="space-y-4 border-t border-border pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Ruler className="h-3.5 w-3.5 text-primary" />
                  2. Логистические габариты и единицы измерения
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <FormFieldNumber
                    control={form.control}
                    name="dimensionLength"
                    label="Длина / Глубина:"
                    min={0}
                    step={1}
                    className="font-mono text-xs bg-background"
                  />
                  <FormFieldNumber
                    control={form.control}
                    name="dimensionWidth"
                    label="Ширина:"
                    min={0}
                    step={1}
                    className="font-mono text-xs bg-background"
                  />
                  <FormFieldNumber
                    control={form.control}
                    name="dimensionHeight"
                    label="Высота:"
                    min={0}
                    step={1}
                    className="font-mono text-xs bg-background"
                  />
                  <FormFieldSelect
                    control={form.control}
                    name="dimensionUnit"
                    label="Ед. изм. габаритов:"
                    options={DIMENSION_UNITS}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormFieldNumber
                    control={form.control}
                    name="weightKg"
                    label="Масса единицы (кг):"
                    step="0.01"
                    min={0.01}
                  />

                  <FormFieldSelect
                    control={form.control}
                    name="unit"
                    label="Базовая единица учета (ЕИ):"
                    options={UNIT_OPTIONS}
                  />
                </div>
              </div>

              {/* Step 3: Pricing & MOQ */}
              <div className="space-y-4 border-t border-border pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  3. Оптовые цены и правила заказа
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormFieldNumber
                    control={form.control}
                    name="basePrice"
                    label="Базовая оптовая цена нетто (PLN):"
                    step="0.01"
                    min={0.01}
                    className="font-bold"
                  />

                  <FormFieldNumber
                    control={form.control}
                    name="moq"
                    label="Минимальная партия (MOQ):"
                    min={1}
                    step={1}
                    className="font-bold"
                  />
                </div>
              </div>

              {/* Step 4: Initial Warehouse Allocation */}
              <div className="space-y-4 border-t border-border pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  4. Начальное оприходование на склад
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormFieldSelect
                    control={form.control}
                    name="warehouse"
                    label="Склад оприходования:"
                    options={warehouseOptions}
                  />

                  <FormFieldNumber
                    control={form.control}
                    name="initialStock"
                    label="Принятое физическое количество:"
                    min={0}
                    step={1}
                    className="font-bold"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => navigate({ to: '/supplier/products' })}>
                  Отмена
                </Button>
                <Button type="submit" size="sm" className="gap-2 font-semibold shadow-xs">
                  <Plus className="h-4 w-4" /> Сохранить SKU и оприходовать остаток
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>


      {/* Creation Modals */}
      <CreateBrandModal
        open={brandModalOpen}
        onOpenChange={setBrandModalOpen}
        onBrandCreated={(newId) => {
          form.setValue('brandId', newId);
        }}
      />

      <CreateManufacturerModal
        open={manufacturerModalOpen}
        onOpenChange={setManufacturerModalOpen}
        onManufacturerCreated={(newId) => {
          form.setValue('manufacturerId', newId);
        }}
      />

      <CreateCategoryModal
        open={categoryModalOpen}
        onOpenChange={setCategoryModalOpen}
        onCategoryCreated={(newId) => {
          form.setValue('categoryId', newId);
        }}
      />
    </div>
  );
}
