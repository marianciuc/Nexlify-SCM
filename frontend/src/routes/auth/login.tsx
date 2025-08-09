import {createFileRoute, useNavigate} from '@tanstack/react-router';
import {useState} from 'react';

import {LoginForm} from '@/components/forms/LoginForm';
import {RegisterForm} from '@/components/forms/registration-from/RegisterForm';

export const Route = createFileRoute('/auth/login')({
    component: LoginPage,
});

function LoginPage() {
    const navigate = useNavigate();
    const [showRegister, setShowRegister] = useState(false);

    const handleLoginSuccess = () => {
        navigate({to: '/dashboard'});
    };

    const handleRegisterSuccess = () => {
        navigate({to: '/dashboard'});
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
