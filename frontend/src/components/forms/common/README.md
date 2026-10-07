# Common Form Components (`@/components/forms/common`)

Reusable form controls built with **React Hook Form**, **Zod**, and **Radix UI/shadcn** design tokens.

## Available Components

### 1. `FormFieldInput`
Standard text, email, password, or search input with optional Lucide icon.

```tsx
import { FormFieldInput } from '@/components/forms/common';
import { Mail } from 'lucide-react';

<FormFieldInput
  control={form.control}
  name="email"
  label="Email Address"
  placeholder="user@example.com"
  type="email"
  autoComplete="email"
  icon={Mail}
  description="We will send order confirmations here"
/>
```

### 2. `FormFieldNumber`
Numeric input that automatically casts values to numbers (`valueAsNumber: true`).

```tsx
import { FormFieldNumber } from '@/components/forms/common';
import { DollarSign } from 'lucide-react';

<FormFieldNumber
  control={form.control}
  name="unitPrice"
  label="Unit Price (PLN)"
  min={0.01}
  step={0.01}
  icon={DollarSign}
/>
```

### 3. `FormFieldSelect`
Dropdown select component built on Radix Select.

```tsx
import { FormFieldSelect } from '@/components/forms/common';

<FormFieldSelect
  control={form.control}
  name="tier"
  label="Pricing Tier"
  placeholder="Select tier..."
  options={[
    { value: 'STANDARD', label: 'Standard Wholesale' },
    { value: 'VIP', label: 'VIP Strategic Account' },
  ]}
/>
```

### 4. `FormFieldCheckbox`
Checkbox with accessible inline label and description.

```tsx
import { FormFieldCheckbox } from '@/components/forms/common';

<FormFieldCheckbox
  control={form.control}
  name="autoReplenish"
  label="Enable Automated Replenishment"
  description="Generate purchase orders when stock reaches safety thresholds"
/>
```

### 5. `FormFieldTextarea`
Multi-line textarea for notes, comments, and descriptions.

```tsx
import { FormFieldTextarea } from '@/components/forms/common';

<FormFieldTextarea
  control={form.control}
  name="notes"
  label="Commercial Proposal Notes"
  placeholder="Enter notes..."
  rows={4}
/>
```

## Standard Form Pattern

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { FormFieldInput } from '@/components/forms/common';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
});

type FormData = z.infer<typeof schema>;

export function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormFieldInput control={form.control} name="name" label="Name" />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```
