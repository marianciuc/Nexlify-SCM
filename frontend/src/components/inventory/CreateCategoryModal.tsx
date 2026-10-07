import { FolderTree, Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCategoriesQuery, useCreateCategoryMutation } from '@/hooks/useScmQueries';

interface CreateCategoryModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultParentId?: string;
  onCategoryCreated?: (catId: string, name: string) => void;
  trigger?: React.ReactNode;
}

export function CreateCategoryModal({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  defaultParentId,
  onCategoryCreated,
  trigger,
}: CreateCategoryModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

  const { data: categories = [] } = useCategoriesQuery();
  const createCategoryMutation = useCreateCategoryMutation();

  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string>(defaultParentId || 'NONE');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const selectedParent = parentId && parentId !== 'NONE' ? parentId : undefined;
    const cat = await createCategoryMutation.mutateAsync({
      name: name.trim(),
      parentId: selectedParent,
      description: description.trim() || undefined,
    });

    onCategoryCreated?.(cat.id, cat.name);
    setName('');
    setDescription('');
    setParentId('NONE');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1 text-slate-700 dark:text-slate-200"
          >
            <Plus className="h-3 w-3" />
            Добавить категорию
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[460px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                <FolderTree className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>Новая категория / подкатегория</DialogTitle>
                <DialogDescription>
                  Добавьте корневую категорию или вложите подкатегорию в существующую
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cat-name">
                Наименование категории <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="cat-name"
                placeholder="Например: Термочехлы, Упаковочная лента PP"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="parent-cat">Родительская категория (для подкатегории)</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger id="parent-cat">
                  <SelectValue placeholder="Без родительской (Корневая категория)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">-- Корневая категория (без родителя) --</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Выберите родителя, если хотите создать вложенную подкатегорию.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cat-desc">Описание назначения</Label>
              <Textarea
                id="cat-desc"
                placeholder="Краткое описание группы товаров..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={createCategoryMutation.isPending || !name.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {createCategoryMutation.isPending ? 'Сохранение...' : 'Создать'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
