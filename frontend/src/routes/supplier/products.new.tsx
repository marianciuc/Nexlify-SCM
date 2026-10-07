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
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useLocale } from '@/hooks/useLocale';
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
      label: 'supplier.productNew.title',
    },
  },
});

function CreateSkuPage() {
  return <CreateSkuContent />;
}

function CreateSkuContent() {
  const { t } = useLocale();
  const navigate = useNavigate();

  const { data: categories = [] } = useCategoriesQuery();
  const { data: brands = [] } = useBrandsQuery();
  const { data: manufacturers = [] } = useManufacturersQuery();

  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [manufacturerModalOpen, setManufacturerModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  // Validation messages are user-visible — rebuild schema with the active locale.
  const skuSchema = useMemo(
    () =>
      z.object({
        sku: z.string().min(1, t('supplier.productNew.validation.skuRequired')),
        ean: z.string(),
        name: z.string().min(1, t('supplier.productNew.validation.nameRequired')),
        categoryId: z.string().min(1, t('supplier.productNew.validation.categoryRequired')),
        brandId: z.string(),
        manufacturerId: z.string(),
        dimensionLength: z.number().nonnegative(),
        dimensionWidth: z.number().nonnegative(),
        dimensionHeight: z.number().nonnegative(),
        dimensionUnit: z.string(),
        weightKg: z.number().positive(t('supplier.productNew.validation.weightPositive')),
        unit: z.string().min(1, t('supplier.productNew.validation.unitRequired')),
        basePrice: z.number().positive(t('supplier.productNew.validation.pricePositive')),
        moq: z.number().int().min(1, t('supplier.productNew.validation.moqPositive')),
        warehouse: z.string().min(1, t('supplier.productNew.validation.warehouseRequired')),
        initialStock: z
          .number()
          .int()
          .min(0, t('supplier.productNew.validation.stockNonNegative')),
      }),
    [t]
  );

  type SkuFormData = z.infer<typeof skuSchema>;

  const UNIT_OPTIONS = useMemo(
    () => [
      { value: 'pcs', label: t('supplier.productNew.unitOption.pcs') },
      { value: 'kg', label: t('supplier.productNew.unitOption.kg') },
      { value: 'g', label: t('supplier.productNew.unitOption.g') },
      { value: 'l', label: t('supplier.productNew.unitOption.l') },
      { value: 'ml', label: t('supplier.productNew.unitOption.ml') },
      { value: 'm', label: t('supplier.productNew.unitOption.m') },
      { value: 'cm', label: t('supplier.productNew.unitOption.cm') },
      { value: 'mm', label: t('supplier.productNew.unitOption.mm') },
      { value: 'm2', label: t('supplier.productNew.unitOption.m2') },
      { value: 'm3', label: t('supplier.productNew.unitOption.m3') },
      { value: 'box', label: t('supplier.productNew.unitOption.box') },
      { value: 'pallet', label: t('supplier.productNew.unitOption.pallet') },
      { value: 'pack', label: t('supplier.productNew.unitOption.pack') },
    ],
    [t]
  );

  const DIMENSION_UNITS = useMemo(
    () => [
      { value: 'mm', label: t('supplier.productNew.dimensionUnitOption.mm') },
      { value: 'cm', label: t('supplier.productNew.dimensionUnitOption.cm') },
      { value: 'm', label: t('supplier.productNew.dimensionUnitOption.m') },
      { value: 'in', label: t('supplier.productNew.dimensionUnitOption.in') },
    ],
    [t]
  );

  const warehouseOptions = [
    { value: 'Central DC Warszawa (WH-WAW-01)', label: 'Central DC Warszawa (WH-WAW-01)' },
    {
      value: 'Silesia Logistics Hub Katowice (WH-KTW-03)',
      label: 'Silesia Logistics Hub Katowice (WH-KTW-03)',
    },
    {
      value: 'Port Logistics Hub Szczecin (WH-SZC-02)',
      label: 'Port Logistics Hub Szczecin (WH-SZC-02)',
    },
  ];

  const categoryOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    categories.forEach((cat) => {
      options.push({ value: cat.id, label: cat.name });
      if (cat.children && cat.children.length > 0) {
        cat.children.forEach((sub) => {
          options.push({ value: sub.id, label: `  ↳ ${sub.name} (${cat.name})` });
        });
      }
    });
    return options;
  }, [categories]);

  const brandOptions = useMemo(
    () => [
      { value: 'none', label: '— Generic / OEM —' },
      ...brands.map((b) => ({ value: b.id, label: b.name })),
    ],
    [brands]
  );

  const manufacturerOptions = useMemo(
    () => [
      { value: 'none', label: '— No specific manufacturer —' },
      ...manufacturers.map((m) => ({
        value: m.id,
        label: `${m.name}${m.country ? ` (${m.country})` : ''}`,
      })),
    ],
    [manufacturers]
  );

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

    const selectedBrand = brands.find((b) => b.id === data.brandId);
    const brandName = selectedBrand ? selectedBrand.name : undefined;
    const brandId = selectedBrand ? selectedBrand.id : undefined;

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
    <div className="space-y-6 max-w-4xl mx-auto min-w-0">
      <div>
        <Link
          to="/supplier/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          {t('supplier.productNew.backToCatalog')}
        </Link>
      </div>

      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" aria-hidden="true" />
            {t('supplier.productNew.title')}
          </span>
        }
        subtitle={t('supplier.productNew.subtitle')}
      />

      <Card className="border-border bg-card shadow-xs">
        <CardContent className="p-4 sm:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  {t('supplier.productNew.sections.identification')}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormFieldInput
                    control={form.control}
                    name="sku"
                    label={t('supplier.productNew.fields.sku')}
                    placeholder={t('supplier.productNew.fields.skuPlaceholder')}
                    className="font-mono text-xs font-bold bg-background"
                  />

                  <FormFieldInput
                    control={form.control}
                    name="ean"
                    label={t('supplier.productNew.fields.ean')}
                    placeholder={t('supplier.productNew.fields.eanPlaceholder')}
                    className="font-mono text-xs bg-background"
                  />
                </div>

                <FormFieldInput
                  control={form.control}
                  name="name"
                  label={t('supplier.productNew.fields.name')}
                  placeholder={t('supplier.productNew.fields.namePlaceholder')}
                  className="text-xs font-medium bg-background"
                />

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">
                      {t('supplier.productNew.fields.category')}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCategoryModalOpen(true)}
                      className="h-6 px-2 text-[11px] text-primary hover:bg-muted gap-1 font-semibold"
                    >
                      <Plus className="h-3 w-3" aria-hidden="true" />
                      {t('supplier.productNew.actions.createCategory')}
                    </Button>
                  </div>
                  <FormFieldSelect
                    control={form.control}
                    name="categoryId"
                    options={categoryOptions}
                    placeholder={t('supplier.productNew.fields.categoryPlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                        {t('supplier.productNew.fields.brand')}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setBrandModalOpen(true)}
                        className="h-6 px-2 text-[11px] text-primary hover:bg-muted gap-1 font-semibold"
                      >
                        <Plus className="h-3 w-3" aria-hidden="true" />
                        {t('supplier.productNew.actions.createBrand')}
                      </Button>
                    </div>
                    <FormFieldSelect
                      control={form.control}
                      name="brandId"
                      options={brandOptions}
                      placeholder={t('supplier.productNew.fields.brandPlaceholder')}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                        <Factory
                          className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400"
                          aria-hidden="true"
                        />
                        {t('supplier.productNew.fields.manufacturer')}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setManufacturerModalOpen(true)}
                        className="h-6 px-2 text-[11px] text-emerald-600 dark:text-emerald-400 hover:bg-muted gap-1 font-semibold"
                      >
                        <Plus className="h-3 w-3" aria-hidden="true" />
                        {t('supplier.productNew.actions.createManufacturer')}
                      </Button>
                    </div>
                    <FormFieldSelect
                      control={form.control}
                      name="manufacturerId"
                      options={manufacturerOptions}
                      placeholder={t('supplier.productNew.fields.manufacturerPlaceholder')}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t border-border pt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Ruler className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  {t('supplier.productNew.sections.logistics')}
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <FormFieldNumber
                    control={form.control}
                    name="dimensionLength"
                    label={t('supplier.productNew.fields.dimensionLength')}
                    min={0}
                    step={1}
                    className="font-mono text-xs bg-background"
                  />
                  <FormFieldNumber
                    control={form.control}
                    name="dimensionWidth"
                    label={t('supplier.productNew.fields.dimensionWidth')}
                    min={0}
                    step={1}
                    className="font-mono text-xs bg-background"
                  />
                  <FormFieldNumber
                    control={form.control}
                    name="dimensionHeight"
                    label={t('supplier.productNew.fields.dimensionHeight')}
                    min={0}
                    step={1}
                    className="font-mono text-xs bg-background"
                  />
                  <FormFieldSelect
                    control={form.control}
                    name="dimensionUnit"
                    label={t('supplier.productNew.fields.dimensionUnit')}
                    options={DIMENSION_UNITS}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormFieldNumber
                    control={form.control}
                    name="weightKg"
                    label={t('supplier.productNew.fields.weight')}
                    step="0.01"
                    min={0.01}
                  />

                  <FormFieldSelect
                    control={form.control}
                    name="unit"
                    label={t('supplier.productNew.fields.unit')}
                    options={UNIT_OPTIONS}
                  />
                </div>
              </div>

              <div className="space-y-4 border-t border-border pt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t('supplier.productNew.sections.pricing')}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormFieldNumber
                    control={form.control}
                    name="basePrice"
                    label={t('supplier.productNew.fields.basePrice')}
                    step="0.01"
                    min={0.01}
                    className="font-bold"
                  />

                  <FormFieldNumber
                    control={form.control}
                    name="moq"
                    label={t('supplier.productNew.fields.moq')}
                    min={1}
                    step={1}
                    className="font-bold"
                  />
                </div>
              </div>

              <div className="space-y-4 border-t border-border pt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t('supplier.productNew.sections.stock')}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormFieldSelect
                    control={form.control}
                    name="warehouse"
                    label={t('supplier.productNew.fields.warehouse')}
                    options={warehouseOptions}
                  />

                  <FormFieldNumber
                    control={form.control}
                    name="initialStock"
                    label={t('supplier.productNew.fields.initialStock')}
                    min={0}
                    step={1}
                    className="font-bold"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate({ to: '/supplier/products' })}
                >
                  {t('supplier.productNew.actions.cancel')}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="gap-2 font-semibold shadow-xs"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  {t('supplier.productNew.actions.submit')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

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

export default CreateSkuPage;