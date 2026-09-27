import useAuthStore from '@/service/auth/auth-store';
import type {User} from '@/types/auth';

export function useAuth() {
    const {
        userData,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshToken,
        hasPermissions,
    } = useAuthStore();

    const user: User | null = userData
        ? {
              id: userData.id,
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              securityScopes: (userData as any).securityScopes || [],
              companyId: (userData as any).companyId,
              role: (userData as any).role,
          }
        : null;

    return {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshToken,
        hasPermissions,
    };
}

export default useAuth;
