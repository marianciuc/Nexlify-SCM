import * as React from 'react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';

export interface FormFieldCheckboxProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  className?: string;
}

export function FormFieldCheckbox<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  disabled,
  containerClassName,
  labelClassName,
  className,
}: FormFieldCheckboxProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn(
            'flex flex-row items-start space-x-3 space-y-0 rounded-md p-2',
            containerClassName
          )}
        >
          <FormControl>
            <Checkbox
              checked={!!field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
              className={className}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            {label && (
              <FormLabel
                className={cn(
                  'text-xs font-medium cursor-pointer',
                  labelClassName
                )}
              >
                {label}
              </FormLabel>
            )}
            {description && (
              <FormDescription className="text-2xs text-muted-foreground">
                {description}
              </FormDescription>
            )}
            <FormMessage className="text-2xs" />
          </div>
        </FormItem>
      )}
    />
  );
}
