import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

import { FormFieldInput } from '@/components/forms/common';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import useAuthStore from '@/service/auth/auth-store';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const registerFormSchema = z.object({
  companyName: z.string().min(1, 'Company Name is required'),
  taxId: z.string().min(1, 'Tax ID / NIP is required'),
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormData = z.infer<typeof registerFormSchema>;

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const { t } = useTranslation();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      companyName: '',
      taxId: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: RegisterFormData) => {
    try {
      await login({ email: values.email, password: values.password });
      toast.success('Registration successful! Welcome to Nexlify-SCM.');
      onSuccess?.();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      toast.error(errorMessage);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl border-slate-200">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
          Create B2B Account
        </CardTitle>
        <CardDescription>
          Register your company on the Nexlify Supply Chain Platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormFieldInput
                control={form.control}
                name="companyName"
                label="Company Name"
                placeholder="Acme Logistics Sp. z o.o."
              />
              <FormFieldInput
                control={form.control}
                name="taxId"
                label="Tax ID / NIP"
                placeholder="PL1234567890"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormFieldInput
                control={form.control}
                name="firstName"
                label="First Name"
                placeholder="Jan"
              />
              <FormFieldInput
                control={form.control}
                name="lastName"
                label="Last Name"
                placeholder="Kowalski"
              />
            </div>

            <FormFieldInput
              control={form.control}
              name="email"
              type="email"
              label={t('auth.email') || 'Business Email'}
              placeholder="jan.kowalski@acme.pl"
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-medium">
                    {t('auth.password') || 'Password'}
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="text-xs"
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <FormMessage className="text-2xs" />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete B2B Registration
            </Button>

            <div className="text-center text-sm pt-2 text-slate-600">
              Already registered?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="font-semibold text-primary hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
