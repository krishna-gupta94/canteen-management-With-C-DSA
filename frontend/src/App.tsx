import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StudentLayout } from './components/layout/StudentLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Menu } from './pages/Menu';

import { Dashboard } from './pages/Dashboard';
import { Cart } from './pages/Cart';
import { Orders } from './pages/Orders';
import { OrderDetail } from './pages/OrderDetail';
import { ReceiptView } from './pages/Receipt';

import { AdminLayout } from './components/layout/AdminLayout';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminInventory } from './pages/AdminInventory';
import { AdminQueue } from './pages/AdminQueue';
import { AdminSales } from './pages/AdminSales';
import { AdminAnalytics } from './pages/AdminAnalytics';
import { AdminOrders } from './pages/AdminOrders';
import { AdminFoods } from './pages/AdminFoods';

const Profile = () => {
  const { user, logout } = useAuth();
  return (
    <div className="p-4">
      <h1 className="text-2xl font-poppins mb-4">Profile</h1>
      <p>Name: {user?.name}</p>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
      <button onClick={logout} className="mt-4 bg-error text-white px-4 py-2 rounded-ui hover:bg-error/90">Logout</button>
    </div>
  );
};

const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole: string }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center text-text-secondary">Loading...</div>;
  if (!user || user.role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />
          
          <Route path="/student" element={
            <ProtectedRoute allowedRole="student">
              <StudentLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="menu" element={<Menu />} />
            <Route path="cart" element={<Cart />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="orders/:id/receipt" element={<ReceiptView />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route path="/admin" element={
            <ProtectedRoute allowedRole="ROLE_ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="foods" element={<AdminFoods />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/queue" element={<AdminQueue />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="sales" element={<AdminSales />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
