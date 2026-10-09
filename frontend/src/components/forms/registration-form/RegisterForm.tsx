import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useLocale } from '@/hooks/useLocale';
import useAuthStore from '@/service/auth/auth-store';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const { t } = useLocale();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const registerFormSchema = z.object({
    companyName: z
      .string()
      .min(1, t('auth.errors.registrationFailed')),
    taxId: z
      .string()
      .min(1, t('auth.errors.registrationFailed')),
    firstName: z
      .string()
      .min(1, t('auth.errors.registrationFailed')),
    lastName: z
      .string()
      .min(1, t('auth.errors.registrationFailed')),
    email: z
      .string()
      .min(1, t('auth.errors.emailRequired'))
      .email(t('auth.errors.emailInvalid')),
    password: z
      .string()
      .min(6, t('auth.errors.passwordTooShort')),
    termsConsent: z
      .boolean()
      .refine((val) => val === true, t('auth.errors.registrationFailed')),
  });

  type RegisterFormData = z.infer<typeof registerFormSchema>;

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      companyName: '',
      taxId: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      termsConsent: false,
    },
  });

  const onSubmit = async (values: RegisterFormData) => {
    try {
      await login({ email: values.email, password: values.password });
      toast.success(t('auth.success.registrationSuccessful'));
      onSuccess?.();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : t('auth.errors.registrationFailed');
      toast.error(errorMessage);
    }
  };

  return (
    <Card className="w-full border-border bg-card shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-semibold tracking-tight">
          {t('auth.signUpTitle')}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {t('auth.createAccount')}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm font-medium">
                      {t('auth.companyName')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('auth.companyNamePlaceholder')}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-destructive" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm font-medium">
                      {t('auth.companyTaxId')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('auth.companyTaxIdPlaceholder')}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-destructive" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm font-medium">
                      {t('auth.firstName')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('auth.firstNamePlaceholder')}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-destructive" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm font-medium">
                      {t('auth.lastName')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('auth.lastNamePlaceholder')}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-destructive" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-medium">
                    {t('auth.email')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder={t('auth.emailPlaceholder')}
                      disabled={isLoading}
                      autoComplete="username"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-medium">
                      {t('auth.password')}
                    </FormLabel>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer"
                    >
                      {showPassword ? (
                        <>
                          <EyeOff className="size-3.5" />
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye className="size-3.5" />
                          <span>Show</span>
                        </>
                      )}
                    </button>
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('auth.passwordPlaceholder')}
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="termsConsent"
              render={({ field }) => (
                <div className="flex items-start space-x-2 pt-1">
                  <Checkbox
                    id="termsConsent"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-0.5"
                  />
                  <label
                    htmlFor="termsConsent"
                    className="text-xs text-muted-foreground leading-normal cursor-pointer"
                  >
                    {t('auth.dataProcessingConsent')}
                  </label>
                </div>
              )}
            />

            <Button
              type="submit"
              className="w-full font-medium"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {t('auth.register')}
            </Button>

            <div className="text-center pt-2">
              <Button
                type="button"
                variant="link"
                className="text-xs text-muted-foreground hover:text-foreground h-auto p-0"
                onClick={onSwitchToLogin}
                disabled={isLoading}
              >
                {t('auth.alreadyHaveAccount')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default RegisterForm;
