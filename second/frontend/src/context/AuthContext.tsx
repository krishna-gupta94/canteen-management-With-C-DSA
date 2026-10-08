import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';
import { AuthResponse, User, ApiResponse } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get<any>('/auth/me');
      if (res && res.id !== undefined) {
        setUser({
          id: res.id,
          name: res.role === 1 ? 'Admin User' : 'Student User', // fallback names as backend doesn't return name here
          email: '',
          role: res.role === 1 ? 'ROLE_ADMIN' : 'student'
        });
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (e) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    
    const handleExpired = () => {
      setUser(null);
      localStorage.removeItem('token');
    };
    window.addEventListener('auth-expired', handleExpired);
    return () => window.removeEventListener('auth-expired', handleExpired);
  }, []);

  const login = async (token: string) => {
    localStorage.setItem('token', token);
    await checkAuth();
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch(e) {}
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
