import {createFileRoute, useNavigate} from '@tanstack/react-router';
import {Loader2, ShieldCheck, AlertCircle, ArrowRight} from 'lucide-react';
import {useEffect, useState, useRef} from 'react';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import useAuthStore from '@/service/auth/auth-store';

export const Route = createFileRoute('/auth/callback')({
    component: AuthCallbackPage,
});

function AuthCallbackPage() {
    const navigate = useNavigate();
    const {loginWithCode} = useAuthStore();
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const exchangedRef = useRef(false);

    useEffect(() => {
        if (exchangedRef.current) return;
        exchangedRef.current = true;

        const processCallback = async () => {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get('code');
                const error = urlParams.get('error');
                const errorDescription = urlParams.get('error_description');

                if (error) {
                    setStatus('error');
                    setErrorMessage(errorDescription || error || 'Authentication was denied by Keycloak');
                    return;
                }

                if (!code) {
                    setStatus('error');
                    setErrorMessage('No authorization code was provided in the callback URL');
                    return;
                }

                const redirectUri = window.location.origin + '/auth/callback';
                await loginWithCode(code, redirectUri);

                setStatus('success');
                setTimeout(() => {
                    navigate({to: '/supplier/dashboard'});
                }, 800);
            } catch (err: any) {
                setStatus('error');
                setErrorMessage(err?.message || 'Failed to exchange authorization code with Keycloak');
            }
        };

        processCallback();
    }, [loginWithCode, navigate]);

    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 text-white'>
            <Card className='w-full max-w-md bg-slate-900/90 border-slate-700/60 backdrop-blur-xl shadow-2xl text-slate-100'>
                <CardHeader className='text-center space-y-2'>
                    <div className='mx-auto w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-2'>
                        {status === 'processing' && <Loader2 className='w-6 h-6 text-indigo-400 animate-spin' />}
                        {status === 'success' && <ShieldCheck className='w-6 h-6 text-emerald-400' />}
                        {status === 'error' && <AlertCircle className='w-6 h-6 text-rose-400' />}
                    </div>
                    <CardTitle className='text-xl font-bold tracking-tight'>
                        {status === 'processing' && 'Authenticating with Keycloak IAM'}
                        {status === 'success' && 'Authentication Successful'}
                        {status === 'error' && 'Authentication Error'}
                    </CardTitle>
                    <CardDescription className='text-slate-400 text-xs'>
                        {status === 'processing' && 'Exchanging authorization code for secure Opaque Reference Token...'}
                        {status === 'success' && 'Session created. Redirecting to platform dashboard...'}
                        {status === 'error' && 'Unable to finalize authentication session with IAM provider.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className='pt-2'>
                    {status === 'processing' && (
                        <div className='space-y-4'>
                            <div className='h-1.5 w-full bg-slate-800 rounded-full overflow-hidden'>
                                <div className='h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-pulse w-3/4 rounded-full'></div>
                            </div>
                            <div className='flex justify-between text-[11px] font-mono text-slate-500'>
                                <span>PROTOCOL: OIDC PKCE</span>
                                <span>TOKEN: OPAQUE REFERENCE</span>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className='space-y-4'>
                            <div className='p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono break-all'>
                                {errorMessage}
                            </div>
                            <Button
                                className='w-full bg-slate-800 hover:bg-slate-700 text-white cursor-pointer'
                                onClick={() => navigate({to: '/auth/login'})}
                            >
                                Return to Login
                                <ArrowRight className='w-4 h-4 ml-2' />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
