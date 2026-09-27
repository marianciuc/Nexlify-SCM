import {useForm} from '@tanstack/react-form';
import {ArrowRight, Eye, EyeOff, Loader2, ShieldCheck} from 'lucide-react';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {toast} from 'sonner';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';

import useAuthStore from '../../service/auth/auth-store';

interface LoginFormProps {
    onSuccess?: () => void;
    onSwitchToRegister?: () => void;
}

export function LoginForm({onSuccess, onSwitchToRegister}: LoginFormProps) {
    const {t} = useTranslation();
    const {login, getKeycloakLoginUrl, isLoading} = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);

    const handleKeycloakLogin = () => {
        window.location.href = getKeycloakLoginUrl();
    };

    const form = useForm({
        defaultValues: {
            email: '',
            password: '',
            resource: 'CUSTOMER_PANEL' as const,
            rememberMe: false,
        },
        onSubmit: async ({value}) => {
            try {
                await login({email: value.email, password: value.password});
                toast.success(t('auth.success.loginSuccessful'));
                onSuccess?.();
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                toast.error(errorMessage || t('auth.errors.invalidCredentials'));
            }
        },
    });

    return (
        <Card className='w-full max-w-md mx-auto'>
            <CardHeader className='space-y-1'>
                <CardTitle className='text-2xl font-bold text-center'>{t('auth.signInTitle')}</CardTitle>
                <CardDescription className='text-center'>{t('auth.enterCredentials')}</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
                {/* Keycloak Hosted SSO Button */}
                <Button
                    type='button'
                    onClick={handleKeycloakLogin}
                    disabled={isLoading}
                    className='w-full bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 hover:from-blue-800 hover:to-violet-800 text-white font-semibold py-5 shadow-md shadow-indigo-600/20 cursor-pointer flex items-center justify-center gap-2.5 transition-all'
                >
                    <ShieldCheck className='w-5 h-5 text-indigo-200' />
                    Sign In with Keycloak Form
                    <ArrowRight className='w-4 h-4 ml-auto opacity-70' />
                </Button>

                <div className='relative flex items-center justify-center my-2'>
                    <div className='border-t border-slate-200 dark:border-slate-800 w-full' />
                    <span className='bg-background px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider relative'>
                        Or Direct Login
                    </span>
                </div>

                <form
                    onSubmit={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                    className='space-y-4'
                >
                    {/* Remove error alert since we're using toast */}{' '}
                    <form.Field
                        name='email'
                        validators={{
                            onChange: ({value}) =>
                                !value
                                    ? t('auth.validation.emailRequired')
                                    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                                        ? t('auth.validation.emailInvalid')
                                        : undefined,
                        }}
                    >
                        {field => (
                            <div className='space-y-2'>
                                <Label htmlFor={field.name}>{t('auth.email')}</Label>
                                <Input
                                    id={field.name}
                                    type='email'
                                    placeholder={t('auth.emailPlaceholder')}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={e => field.handleChange(e.target.value)}
                                    disabled={isLoading}
                                />
                                {field.state.meta.errors.length > 0 && (
                                    <p className='text-sm text-red-500'>{field.state.meta.errors[0]}</p>
                                )}
                            </div>
                        )}
                    </form.Field>
                    <form.Field
                        name='password'
                        validators={{
                            onChange: ({value}) => (!value ? t('auth.validation.passwordRequired') : undefined),
                        }}
                    >
                        {field => (
                            <div className='space-y-2'>
                                <Label htmlFor={field.name}>{t('auth.password')}</Label>
                                <div className='relative'>
                                    <Input
                                        id={field.name}
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder={t('auth.passwordPlaceholder')}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={e => field.handleChange(e.target.value)}
                                        disabled={isLoading}
                                    />
                                    <Button
                                        type='button'
                                        variant='ghost'
                                        size='sm'
                                        className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isLoading}
                                    >
                                        {showPassword ? <EyeOff className='h-4 w-4'/> : <Eye className='h-4 w-4'/>}
                                    </Button>
                                </div>
                                {field.state.meta.errors.length > 0 && (
                                    <p className='text-sm text-red-500'>{field.state.meta.errors[0]}</p>
                                )}
                            </div>
                        )}
                    </form.Field>
                    <Button type='submit' className='w-full' disabled={isLoading}>
                        {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin'/>}
                        {t('auth.login')}
                    </Button>
                    <div className='text-center'>
                        <Button
                            type='button'
                            variant='link'
                            className='text-sm'
                            onClick={onSwitchToRegister}
                            disabled={isLoading}
                        >
                            {t('auth.dontHaveAccount')}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
