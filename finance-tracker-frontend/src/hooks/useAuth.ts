import { useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/auth.service';
import { User, LoginCredentials, RegisterData } from '@/types';

// ============================================
// HOOK DE AUTENTICAÇÃO
// ============================================

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  error: string | null;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = () => {
      const currentUser = authService.getUser();
      setUser(currentUser);
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.login(credentials);
      setUser(response.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.register(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao registrar');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    error,
  };
}
