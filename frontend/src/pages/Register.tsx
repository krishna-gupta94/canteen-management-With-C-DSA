import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AuthResponse } from '../types';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post<AuthResponse>('/student/register', { name, email, password });
      if (res.success) {
        navigate('/login', { state: { message: 'Registration successful! Please login.' } });
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
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
          <h1 className="text-3xl font-poppins font-bold text-primary mb-sm">Create Account</h1>
          <p className="text-text-secondary text-sm">Join the campus canteen network.</p>
        </div>
        
        {error && (
          <div className="mb-md p-3 bg-error/10 border border-error/20 rounded-ui text-error text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-md">
          <Input 
            label="Full Name" 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required 
          />
          <Input 
            label="Email Address" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@college.edu"
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
            Create Account
          </Button>
        </form>

        <div className="mt-lg text-center text-sm text-text-secondary">
          Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link>
        </div>
      </div>
    </div>
  );
}
