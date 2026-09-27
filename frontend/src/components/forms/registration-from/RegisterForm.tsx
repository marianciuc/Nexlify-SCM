import {useForm} from '@tanstack/react-form';
import {Eye, EyeOff, Loader2} from 'lucide-react';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {toast} from 'sonner';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import useAuthStore from '@/service/auth/auth-store';

interface RegisterFormProps {
    onSuccess?: () => void;
    onSwitchToLogin?: () => void;
}

export function RegisterForm({onSuccess, onSwitchToLogin}: RegisterFormProps) {
    const {t} = useTranslation();
    const {login, isLoading} = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm({
        defaultValues: {
            companyName: '',
            taxId: '',
            firstName: '',
            lastName: '',
            email: '',
            password: '',
        },
        onSubmit: async ({value}) => {
            try {
                // Register and login
                await login({email: value.email, password: value.password});
                toast.success('Registration successful! Welcome to Nexlify-SCM.');
                onSuccess?.();
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'Registration failed';
                toast.error(errorMessage);
            }
        },
    });

    return (
        <Card className='w-full max-w-lg mx-auto shadow-xl border-slate-200'>
            <CardHeader className='space-y-1 text-center'>
                <CardTitle className='text-2xl font-bold tracking-tight text-slate-900'>
                    Create B2B Account
                </CardTitle>
                <CardDescription>
                    Register your company on the Nexlify Supply Chain Platform
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                    className='space-y-4'
                >
                    <div className='grid grid-cols-2 gap-3'>
                        <form.Field name='companyName'>
                            {field => (
                                <div className='space-y-1'>
                                    <Label htmlFor='companyName'>Company Name</Label>
                                    <Input
                                        id='companyName'
                                        placeholder='Acme Logistics Sp. z o.o.'
                                        value={field.state.value}
                                        onChange={e => field.handleChange(e.target.value)}
                                        required
                                    />
                                </div>
                            )}
                        </form.Field>

                        <form.Field name='taxId'>
                            {field => (
                                <div className='space-y-1'>
                                    <Label htmlFor='taxId'>Tax ID / NIP</Label>
                                    <Input
                                        id='taxId'
                                        placeholder='PL1234567890'
                                        value={field.state.value}
                                        onChange={e => field.handleChange(e.target.value)}
                                        required
                                    />
                                </div>
                            )}
                        </form.Field>
                    </div>

                    <div className='grid grid-cols-2 gap-3'>
                        <form.Field name='firstName'>
                            {field => (
                                <div className='space-y-1'>
                                    <Label htmlFor='firstName'>First Name</Label>
                                    <Input
                                        id='firstName'
                                        placeholder='Jan'
                                        value={field.state.value}
                                        onChange={e => field.handleChange(e.target.value)}
                                        required
                                    />
                                </div>
                            )}
                        </form.Field>

                        <form.Field name='lastName'>
                            {field => (
                                <div className='space-y-1'>
                                    <Label htmlFor='lastName'>Last Name</Label>
                                    <Input
                                        id='lastName'
                                        placeholder='Kowalski'
                                        value={field.state.value}
                                        onChange={e => field.handleChange(e.target.value)}
                                        required
                                    />
                                </div>
                            )}
                        </form.Field>
                    </div>

                    <form.Field name='email'>
                        {field => (
                            <div className='space-y-1'>
                                <Label htmlFor='email'>{t('auth.email') || 'Business Email'}</Label>
                                <Input
                                    id='email'
                                    type='email'
                                    placeholder='jan.kowalski@acme.pl'
                                    value={field.state.value}
                                    onChange={e => field.handleChange(e.target.value)}
                                    required
                                />
                            </div>
                        )}
                    </form.Field>

                    <form.Field name='password'>
                        {field => (
                            <div className='space-y-1'>
                                <Label htmlFor='password'>{t('auth.password') || 'Password'}</Label>
                                <div className='relative'>
                                    <Input
                                        id='password'
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder='••••••••'
                                        value={field.state.value}
                                        onChange={e => field.handleChange(e.target.value)}
                                        required
                                    />
                                    <button
                                        type='button'
                                        onClick={() => setShowPassword(!showPassword)}
                                        className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600'
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form.Field>

                    <Button type='submit' className='w-full' disabled={isLoading}>
                        {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                        Complete B2B Registration
                    </Button>

                    <div className='text-center text-sm pt-2 text-slate-600'>
                        Already registered?{' '}
                        <button
                            type='button'
                            onClick={onSwitchToLogin}
                            className='font-semibold text-primary hover:underline'
                        >
                            Sign In
                        </button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
