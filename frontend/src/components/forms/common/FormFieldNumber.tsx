import * as React from 'react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface FormFieldNumberProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<React.ComponentProps<'input'>, 'name' | 'defaultValue' | 'type'> {
  control: Control<TFieldValues>;
  name: TName;
  label?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
}

export function FormFieldNumber<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  icon,
  containerClassName,
  labelClassName,
  className,
  step,
  min,
  max,
  ...props
}: FormFieldNumberProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('space-y-1.5', containerClassName)}>
          {label && (
            <FormLabel className={cn('text-xs font-medium', labelClassName)}>
              {label}
            </FormLabel>
          )}
          <div className="relative">
            {icon && (
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                {icon}
              </div>
            )}
            <FormControl>
              <Input
                {...props}
                name={field.name}
                ref={field.ref}
                onBlur={field.onBlur}
                type="number"
                step={step}
                min={min}
                max={max}
                value={field.value !== undefined && field.value !== null ? field.value : ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    field.onChange(undefined);
                  } else {
                    const parsed = Number(val);
                    field.onChange(isNaN(parsed) ? val : parsed);
                  }
                }}
                className={cn(icon ? 'pl-9' : '', 'text-xs font-mono', className)}
              />
            </FormControl>
          </div>
          {description && (
            <FormDescription className="text-xs text-muted-foreground">
              {description}
            </FormDescription>
          )}
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}
