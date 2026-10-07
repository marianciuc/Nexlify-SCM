import { Factory, Globe, Mail, MapPin, Plus } from 'lucide-react';
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
import { useCreateManufacturerMutation } from '@/hooks/useScmQueries';

interface CreateManufacturerModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onManufacturerCreated?: (id: string, name: string) => void;
  trigger?: React.ReactNode;
}

export function CreateManufacturerModal({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onManufacturerCreated,
  trigger,
}: CreateManufacturerModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [country, setCountry] = useState('Poland');
  const [website, setWebsite] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const createManufacturerMutation = useCreateManufacturerMutation();

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

    const mfr = await createManufacturerMutation.mutateAsync({
      name: name.trim(),
      code: code.trim() || autoCode(name),
      country: country.trim() || undefined,
      website: website.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
    });

    onManufacturerCreated?.(mfr.id, mfr.name);
    setName('');
    setCode('');
    setCountry('Poland');
    setWebsite('');
    setContactEmail('');
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
            className="h-8 gap-1.5 text-xs text-indigo-700 bg-indigo-50/70 border-indigo-200 hover:bg-indigo-100 hover:text-indigo-800 dark:bg-indigo-950/30 dark:border-indigo-800 dark:text-indigo-300"
          >
            <Plus className="h-3.5 w-3.5" />
            Добавить изготовителя
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                <Factory className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>Новый изготовитель / Производство</DialogTitle>
                <DialogDescription>
                  Зарегистрируйте завод-изготовитель или производственную площадку
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="mfr-name">
                Юридическое наименование завода / изготовителя <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Factory className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="mfr-name"
                  placeholder="Например: Drewnex Palety Sp. z o.o., ThermaSafe S.A."
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="mfr-code">Код производителя</Label>
                <Input
                  id="mfr-code"
                  placeholder="DREWNEX-PL"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="font-mono text-xs uppercase"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="mfr-country">Страна производства</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="mfr-country"
                    placeholder="Poland, Germany, France..."
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="pl-9 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mfr-website">Сайт компании</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="mfr-website"
                  type="url"
                  placeholder="https://manufacturer.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mfr-email">Контактный email отдела отгрузок / B2B</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="mfr-email"
                  type="email"
                  placeholder="orders@manufacturer.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>
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
              disabled={createManufacturerMutation.isPending || !name.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {createManufacturerMutation.isPending ? 'Сохранение...' : 'Создать изготовителя'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
