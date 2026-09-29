import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, ApiError } from '../api/client';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AuthResponse } from '../types';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // First try student login
      const res = await api.post<AuthResponse>('/student/login', { email, password });
      if (res.success && res.token) {
        await login(res.token);
        navigate('/student');
        return;
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 401) {
        // Try admin login if student login fails with 401 Unauthorized
        try {
          const resAdmin = await api.post<AuthResponse>('/admin/login', { email, password });
          if (resAdmin.success && resAdmin.token) {
            await login(resAdmin.token);
            navigate('/admin');
            return;
          }
        } catch (adminErr: any) {
          setError('Invalid email or password');
          setLoading(false);
          return;
        }
      }
      
      // If it wasn't a 401, or both failed
      if (err instanceof ApiError) {
        setError('Invalid email or password');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-bg flex items-center justify-center p-md">
      <div className="bg-surface rounded-container shadow-sm p-xl w-full max-w-[28rem] border border-text-disabled/20">
        <div className="text-center mb-lg">
          <h1 className="text-3xl font-poppins font-bold text-primary mb-sm">Welcome Back</h1>
          <p className="text-text-secondary text-sm">Log in to the Canteen Portal.</p>
        </div>
        
        {error && (
          <div className="mb-md p-3 bg-error/10 border border-error/20 rounded-ui text-error text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-md">
          <Input 
            label="Email Address" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@college.edu"
            required 
          />
          <Input 
            label="Password" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required 
          />
          <Button type="submit" className="w-full mt-sm" isLoading={loading}>
            Sign In
          </Button>
        </form>

        <div className="mt-lg text-center text-sm text-text-secondary">
          Don't have an account? <Link to="/register" className="text-primary hover:underline font-medium">Register here</Link>
        </div>
      </div>
    </div>
  );
}
