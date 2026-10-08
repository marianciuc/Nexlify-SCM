import { Sparkles, Building, Globe, Plus } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { useCreateBrandMutation } from '@/hooks/useScmQueries';

interface CreateBrandModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onBrandCreated?: (brandId: string, brandName: string) => void;
  trigger?: React.ReactNode;
}

export function CreateBrandModal({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onBrandCreated,
  trigger,
}: CreateBrandModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');

  const createBrandMutation = useCreateBrandMutation();

  const handleNameChange = (val: string) => {
    setName(val);
    if (!code || code === autoCode(name)) {
      setCode(autoCode(val));
    }
  };

  const autoCode = (str: string) =>
    str
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '-')
      .replace(/-+/g, '-');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const brand = await createBrandMutation.mutateAsync({
      name: name.trim(),
      code: code.trim() || autoCode(name),
      website: website.trim() || undefined,
      description: description.trim() || undefined,
    });

    onBrandCreated?.(brand.id, brand.name);
    setName('');
    setCode('');
    setWebsite('');
    setDescription('');
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
            className="h-8 gap-1.5 text-xs text-primary bg-primary/10 border-primary/30 hover:bg-primary/20 hover:text-primary dark:bg-primary/20 dark:border-primary/40 dark:text-primary"
          >
            <Plus className="h-3.5 w-3.5" />
            Добавить бренд
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>Новый торговый бренд</DialogTitle>
                <DialogDescription>
                  Добавьте зарегистрированный бренд или торговую марку для товаров
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="brand-name">
                Название бренда <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="brand-name"
                  placeholder="Например: Jungheinrich, EPAL, PlastChem"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="brand-code">Код бренда (SKU префикс / идентификатор)</Label>
              <Input
                id="brand-code"
                placeholder="EPAL, JUNG-AG, PLASTCHEM"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="font-mono text-xs uppercase"
              />
              <p className="text-[11px] text-muted-foreground">
                Автоматически генерируется из названия бренда.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="brand-website">Веб-сайт или портал спецификаций</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="brand-website"
                  type="url"
                  placeholder="https://example.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="brand-desc">Описание и сертификаты</Label>
              <Textarea
                id="brand-desc"
                placeholder="Краткая информация о бренде, стандартах качества и линейках продукции..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
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
              disabled={createBrandMutation.isPending || !name.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {createBrandMutation.isPending ? 'Сохранение...' : 'Создать бренд'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
