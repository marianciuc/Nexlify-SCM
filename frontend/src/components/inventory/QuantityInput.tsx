import { useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';

interface QuantityInputProps {
  value: number;
  minimum: number;
  onCommit: (value: number) => void;
  label: string;
  className?: string;
  id?: string;
}

export function QuantityInput({ value, minimum, onCommit, label, className, id }: QuantityInputProps) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => setDraft(String(value)), [value]);

  const commit = () => {
    const parsed = Number(draft);
    const nextValue = Number.isFinite(parsed) ? Math.max(minimum, Math.trunc(parsed)) : minimum;
    setDraft(String(nextValue));
    onCommit(nextValue);
  };

  return (
    <Input
      type="number"
      id={id}
      inputMode="numeric"
      min={minimum}
      step={1}
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          event.currentTarget.blur();
        } else if (event.key === 'Escape') {
          event.preventDefault();
          setDraft(String(value));
        }
      }}
      aria-label={label}
      className={className}
    />
  );
}
