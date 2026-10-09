import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/forms/LoginForm';
import { RegisterForm } from '@/components/forms/registration-form/RegisterForm';
import { getDefaultWorkspacePath } from '@/lib/workspace-routing';
import useAuthStore from '@/service/auth/auth-store';

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [showRegister, setShowRegister] = useState(false);

  const handleLoginSuccess = () => {
    navigate({ to: getDefaultWorkspacePath(useAuthStore.getState().userData) });
  };

  const handleRegisterSuccess = () => {
    navigate({ to: getDefaultWorkspacePath(useAuthStore.getState().userData) });
  };

  return (
    <AuthLayout>
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
    </AuthLayout>
  );
}
