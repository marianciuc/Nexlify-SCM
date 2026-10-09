import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from 'lucide-react';
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

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const { t } = useLocale();
  const { login, getKeycloakLoginUrl, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const loginSchema = z.object({
    email: z
      .string()
      .min(1, t('auth.errors.emailRequired'))
      .email(t('auth.errors.emailInvalid')),
    password: z
      .string()
      .min(1, t('auth.errors.passwordRequired')),
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

  const handleFillDemo = (email: string, pass: string) => {
    form.setValue('email', email, { shouldValidate: true });
    form.setValue('password', pass, { shouldValidate: true });
  };

  const onSubmit = async (values: LoginFormData) => {
    try {
      await login({ email: values.email, password: values.password });
      toast.success(t('auth.success.loginSuccessful'));
      onSuccess?.();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t('auth.errors.invalidCredentials');
      toast.error(errorMessage);
    }
  };

  return (
    <Card className="w-full border-border bg-card shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-semibold tracking-tight">
          {t('auth.signInTitle')}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {t('auth.enterCredentials')}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Keycloak SSO Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleKeycloakLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 font-medium"
        >
          <ShieldCheck className="size-4 text-muted-foreground" />
          <span>Sign in with Keycloak SSO</span>
        </Button>

        <div className="relative my-2 flex items-center justify-center">
          <div className="border-t border-border w-full" />
          <span className="bg-card px-2 text-xs text-muted-foreground uppercase tracking-wider">
            Or
          </span>
        </div>

        {/* Credentials Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      autoComplete="current-password"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <div className="flex items-center space-x-2 pt-0.5">
                  <Checkbox
                    id="rememberMe"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <label
                    htmlFor="rememberMe"
                    className="text-xs text-muted-foreground font-medium leading-none cursor-pointer"
                  >
                    {t('auth.rememberMe')}
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
              {t('auth.login')}
            </Button>

            {/* Quick Demo Credentials for Fast Testing */}
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1.5 font-medium">
                Demo accounts:
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-7 text-xs font-normal"
                  onClick={() => handleFillDemo('admin@nexlify.com', 'admin123')}
                >
                  Admin
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-7 text-xs font-normal"
                  onClick={() => handleFillDemo('manager@nexlify.com', 'manager123')}
                >
                  Warehouse
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-7 text-xs font-normal"
                  onClick={() => handleFillDemo('supplier@nexlify.com', 'supplier123')}
                >
                  Supplier
                </Button>
              </div>
            </div>

            <div className="text-center pt-2">
              <Button
                type="button"
                variant="link"
                className="text-xs text-muted-foreground hover:text-foreground h-auto p-0"
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

export default LoginForm;
