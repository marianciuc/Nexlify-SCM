import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

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

import useAuthStore from '../../service/auth/auth-store';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const { t } = useTranslation();
  const { login, getKeycloakLoginUrl, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const loginSchema = z.object({
    email: z
      .string()
      .min(1, t('auth.validation.emailRequired'))
      .email(t('auth.validation.emailInvalid')),
    password: z
      .string()
      .min(1, t('auth.validation.passwordRequired')),
    resource: z.literal('CUSTOMER_PANEL'),
    rememberMe: z.boolean(),
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      resource: 'CUSTOMER_PANEL',
      rememberMe: false,
    },
  });

  const handleKeycloakLogin = () => {
    window.location.href = getKeycloakLoginUrl();
  };

  const onSubmit = async (values: LoginFormData) => {
    try {
      await login({ email: values.email, password: values.password });
      toast.success(t('auth.success.loginSuccessful'));
      onSuccess?.();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      toast.error(errorMessage || t('auth.errors.invalidCredentials'));
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">{t('auth.signInTitle')}</CardTitle>
        <CardDescription className="text-center">{t('auth.enterCredentials')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enterprise Hosted SSO Button */}
        <Button
          type="button"
          onClick={handleKeycloakLogin}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 hover:from-blue-800 hover:to-violet-800 text-white font-semibold py-5 shadow-md shadow-indigo-600/20 cursor-pointer flex items-center justify-center gap-2.5 transition-all"
        >
          <ShieldCheck className="w-5 h-5 text-indigo-200" />
          Sign In with Enterprise SSO
          <ArrowRight className="w-4 h-4 ml-auto opacity-70" />
        </Button>

        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          <span className="bg-background px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider relative">
            Or Direct Login
          </span>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>{t('auth.email')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder={t('auth.emailPlaceholder')}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>{t('auth.password')}</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('auth.passwordPlaceholder')}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <FormMessage className="text-sm text-red-500" />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('auth.login')}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-sm"
                onClick={onSwitchToRegister}
                disabled={isLoading}
              >
                {t('auth.dontHaveAccount')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
