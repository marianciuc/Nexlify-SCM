import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { RegisterForm } from '@/components/forms/registration-form/RegisterForm';
import { getDefaultWorkspacePath } from '@/lib/workspace-routing';
import useAuthStore from '@/service/auth/auth-store';

export const Route = createFileRoute('/auth/register')({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate({ to: getDefaultWorkspacePath(useAuthStore.getState().userData) });
  };

  const handleSwitchToLogin = () => {
    navigate({ to: '/auth/login' });
  };

  return (
    <AuthLayout>
      <RegisterForm
        onSuccess={handleSuccess}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </AuthLayout>
  );
}
