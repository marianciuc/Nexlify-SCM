import { ChevronDown, ChevronRight, Folder, FolderOpen, Layers, Search, Check, Boxes } from 'lucide-react';
import { useState, useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CategoryNode, StockItem } from '@/types/scm-domain';

import { CreateCategoryModal } from './CreateCategoryModal';

interface CategoryHierarchyFilterProps {
  categories: CategoryNode[];
  selectedCategoryId: string; // 'ALL' or category/subcategory id
  onSelectCategory: (id: string, name?: string) => void;
  items?: StockItem[];
  allowCreation?: boolean;
}

export function CategoryHierarchyFilter({
  categories,
  selectedCategoryId,
  onSelectCategory,
  items = [],
  allowCreation = false,
}: CategoryHierarchyFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  const toggleExpand = (catId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedMap((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  // Compute item counts per category and subcategory
  const countsMap = useMemo(() => {
    const map: Record<string, number> = {};
    let total = 0;

    items.forEach((item) => {
      total++;
      if (item.categoryId) {
        map[item.categoryId] = (map[item.categoryId] || 0) + 1;
      }
      if (item.subcategoryId) {
        map[item.subcategoryId] = (map[item.subcategoryId] || 0) + 1;
      }
      // Also match by category name strings for fallback compatibility
      if (item.category) {
        map[item.category] = (map[item.category] || 0) + 1;
      }
      if (item.subcategory) {
        map[item.subcategory] = (map[item.subcategory] || 0) + 1;
      }
    });

    map['ALL'] = total;
    return map;
  }, [items]);

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const term = searchTerm.toLowerCase();

    return categories
      .map((cat) => {
        const catMatch = cat.name.toLowerCase().includes(term);
        const matchedChildren = (cat.children || []).filter((sub) =>
          sub.name.toLowerCase().includes(term)
        );

        if (catMatch || matchedChildren.length > 0) {
          return {
            ...cat,
            children: catMatch ? cat.children : matchedChildren,
          };
        }
        return null;
      })
      .filter(Boolean) as CategoryNode[];
  }, [categories, searchTerm]);

  return (
    <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-border">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider">
          <Layers className="h-4 w-4 text-primary" />
          <span>Категории продукции</span>
        </div>
        {allowCreation && <CreateCategoryModal />}
      </div>

      {/* Quick Search in categories */}
      {categories.length > 3 && (
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Поиск категории..."
            aria-label="Поиск категории"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 pl-8 text-xs bg-muted/40 border-border"
          />
        </div>
      )}

      {/* Tree list */}
      <div className="space-y-1 max-h-[460px] overflow-y-auto pr-1">
        {/* ALL item */}
        <button
          type="button"
          aria-pressed={selectedCategoryId === 'ALL'}
          onClick={() => onSelectCategory('ALL')}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            selectedCategoryId === 'ALL'
              ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
              : 'text-foreground hover:bg-muted'
          }`}
        >
          <span className="flex items-center gap-2">
            <Boxes className="h-3.5 w-3.5" />
            Все категории
          </span>
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 py-0 h-4 ${
              selectedCategoryId === 'ALL'
                ? 'bg-primary-foreground/20 text-primary-foreground border-transparent'
                : 'text-muted-foreground border-border'
            }`}
          >
            {countsMap['ALL'] || items.length}
          </Badge>
        </button>

        {filteredCategories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id || selectedCategoryId === cat.name;
          const isExpanded = searchTerm ? true : (expandedMap[cat.id] ?? false);
          const hasChildren = cat.children && cat.children.length > 0;
          const catCount = countsMap[cat.id] || countsMap[cat.name] || 0;

          return (
            <div key={cat.id} className="space-y-0.5">
              {/* Parent category row */}
              <div className="flex items-center gap-1">
                {hasChildren && (
                  <button
                    type="button"
                    aria-label={`${isExpanded ? 'Свернуть' : 'Развернуть'} категорию ${cat.name}`}
                    aria-expanded={isExpanded}
                    onClick={(event) => toggleExpand(cat.id, event)}
                    className="h-8 w-8 shrink-0 inline-flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  </button>
                )}
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelectCategory(cat.id, cat.name)}
                  className={`group flex min-w-0 flex-1 items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isSelected ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground hover:bg-muted font-medium'
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    {isExpanded && hasChildren ? <FolderOpen className="h-3.5 w-3.5 text-primary shrink-0" /> : <Folder className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                    <span className="truncate">{cat.name}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1">
                    {catCount > 0 && <span className="text-[10px] tabular-nums text-muted-foreground">{catCount}</span>}
                    {isSelected && <Check className="h-3 w-3" aria-hidden="true" />}
                  </span>
                </button>
              </div>

              {/* Subcategories (children) */}
              {hasChildren && isExpanded && (
                <div className="pl-6 space-y-0.5 border-l border-border ml-3.5 my-0.5">
                  {cat.children?.map((sub) => {
                    const isSubSelected =
                      selectedCategoryId === sub.id || selectedCategoryId === sub.name;
                    const subCount = countsMap[sub.id] || countsMap[sub.name] || 0;

                    return (
                      <button
                        type="button"
                        aria-pressed={isSubSelected}
                        key={sub.id}
                        onClick={() => onSelectCategory(sub.id, sub.name)}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-[11px] text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          isSubSelected
                            ? 'bg-primary text-primary-foreground font-medium shadow-2xs'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        <span className="truncate flex items-center gap-1.5">
                          {sub.name}
                        </span>

                        <div className="flex items-center gap-1 shrink-0 ml-1">
                          {subCount > 0 && (
                            <span
                              className={`text-[10px] px-1 rounded ${
                                isSubSelected
                                  ? 'bg-primary-foreground/20 text-primary-foreground'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {subCount}
                            </span>
                          )}
                          {isSubSelected && <Check className="h-2.5 w-2.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
