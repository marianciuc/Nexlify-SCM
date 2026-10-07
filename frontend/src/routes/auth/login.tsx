import {createFileRoute, useNavigate} from '@tanstack/react-router';
import {useState} from 'react';

import {LoginForm} from '@/components/forms/LoginForm';
import {RegisterForm} from '@/components/forms/registration-form/RegisterForm';
import {getDefaultWorkspacePath} from '@/lib/workspace-routing';
import useAuthStore from '@/service/auth/auth-store';

export const Route = createFileRoute('/auth/login')({
    component: LoginPage,
});

function LoginPage() {
    const navigate = useNavigate();
    const [showRegister, setShowRegister] = useState(false);

    const handleLoginSuccess = () => {
        navigate({to: getDefaultWorkspacePath(useAuthStore.getState().userData)});
    };

    const handleRegisterSuccess = () => {
        navigate({to: getDefaultWorkspacePath(useAuthStore.getState().userData)});
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4'>
            <div className='w-full max-w-md'>
                {showRegister ? (
                    <RegisterForm
                        onSuccess={handleRegisterSuccess}
                        onSwitchToLogin={() => setShowRegister(false)}
                    />
                ) : (
                    <LoginForm
                        onSuccess={handleLoginSuccess}
                        onSwitchToRegister={() => setShowRegister(true)}
                    />
                )}
            </div>
        </div>
    );
}
