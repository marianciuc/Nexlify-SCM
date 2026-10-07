import {createFileRoute, useNavigate} from '@tanstack/react-router';

import {RegisterForm} from '@/components/forms/registration-form/RegisterForm';
import {getDefaultWorkspacePath} from '@/lib/workspace-routing';
import useAuthStore from '@/service/auth/auth-store';

export const Route = createFileRoute('/auth/register')({
    component: RegisterPage,
});

function RegisterPage() {
    const navigate = useNavigate();

    const handleSuccess = () => {
        navigate({to: getDefaultWorkspacePath(useAuthStore.getState().userData)});
    };

    const handleSwitchToLogin = () => {
        navigate({to: '/auth/login'});
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4'>
            <div className='w-full max-w-md'>
                <RegisterForm onSuccess={handleSuccess} onSwitchToLogin={handleSwitchToLogin}/>
            </div>
        </div>
    );
}
