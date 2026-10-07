import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Brand, Manufacturer } from '@/types/scm-domain';

import { CreateBrandModal } from './CreateBrandModal';
import { CreateManufacturerModal } from './CreateManufacturerModal';

interface BrandAndManufacturerFilterProps {
  brands: Brand[];
  manufacturers: Manufacturer[];
  selectedBrandId: string; // 'ALL' or id/name
  selectedManufacturerId: string; // 'ALL' or id/name
  onSelectBrand: (brandId: string) => void;
  onSelectManufacturer: (mfrId: string) => void;
  onClearAll?: () => void;
  allowCreation?: boolean;
}

export function BrandAndManufacturerFilter({
  brands,
  manufacturers,
  selectedBrandId,
  selectedManufacturerId,
  onSelectBrand,
  onSelectManufacturer,
  onClearAll,
  allowCreation = false,
}: BrandAndManufacturerFilterProps) {
  const hasActiveFilters = selectedBrandId !== 'ALL' || selectedManufacturerId !== 'ALL';

  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 text-sm">
      {/* Brand Select */}
      <div className="flex items-center gap-1.5 min-w-0">
        <div className="w-full sm:w-48">
          <Select value={selectedBrandId} onValueChange={onSelectBrand}>
            <SelectTrigger className="h-9 text-sm bg-background" aria-label="Фильтр по бренду">
              <SelectValue placeholder="Все бренды" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Все бренды</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {allowCreation && (
          <CreateBrandModal
            onBrandCreated={(id) => onSelectBrand(id)}
          />
        )}
      </div>

      {/* Manufacturer Select */}
      <div className="flex items-center gap-1.5 min-w-0">
        <div className="w-full sm:w-56">
          <Select value={selectedManufacturerId} onValueChange={onSelectManufacturer}>
            <SelectTrigger className="h-9 text-sm bg-background" aria-label="Фильтр по производителю">
              <SelectValue placeholder="Все производители" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Все производители</SelectItem>
              {manufacturers.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name} {m.country ? `(${m.country})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {allowCreation && (
          <CreateManufacturerModal
            onManufacturerCreated={(id) => onSelectManufacturer(id)}
          />
        )}
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-8 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1 ml-auto"
        >
          <X className="h-3.5 w-3.5" />
          Сбросить фильтры
        </Button>
      )}
    </div>
  );
}
