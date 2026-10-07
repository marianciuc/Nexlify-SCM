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

export interface FormFieldInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<React.ComponentProps<'input'>, 'name' | 'defaultValue'> {
  control: Control<TFieldValues>;
  name: TName;
  label?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
}

export function FormFieldInput<
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
  type = 'text',
  ...props
}: FormFieldInputProps<TFieldValues, TName>) {
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
                {...field}
                {...props}
                type={type}
                value={field.value ?? ''}
                className={cn(icon ? 'pl-9' : '', 'text-xs', className)}
              />
            </FormControl>
          </div>
          {description && (
            <FormDescription className="text-2xs text-muted-foreground">
              {description}
            </FormDescription>
          )}
          <FormMessage className="text-2xs" />
        </FormItem>
      )}
    />
  );
}
