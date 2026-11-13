import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/auth.api';
import { User, Role } from '../types/auth.types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, fallbackUser?: Partial<User>) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await authApi.getMe();
      if (res && res.id !== undefined) {
        // Backend roles: 0 = Student, 1 = Admin
        const role: Role = (res.role === 1 || res.role === 2) ? 'ROLE_ADMIN' : 'student';
        const savedName = localStorage.getItem('user_name') || (role === 'ROLE_ADMIN' ? 'Administrator' : 'Student');
        const savedEmail = localStorage.getItem('user_email') || '';

        setUser({
          id: res.id,
          name: savedName,
          email: savedEmail,
          role
        });
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    const handleExpired = () => {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_email');
    };

    window.addEventListener('auth-expired', handleExpired);
    return () => window.removeEventListener('auth-expired', handleExpired);
  }, [checkAuth]);

  const login = async (token: string, fallbackUser?: Partial<User>) => {
    localStorage.setItem('token', token);
    if (fallbackUser?.name) localStorage.setItem('user_name', fallbackUser.name);
    if (fallbackUser?.email) localStorage.setItem('user_email', fallbackUser.email);
    await checkAuth();
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser: checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
