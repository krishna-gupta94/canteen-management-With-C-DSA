import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../ui/Button';
import { 
  LayoutDashboard, 
  Package, 
  Utensils, 
  ShoppingCart, 
  ListOrdered, 
  LineChart,
  IndianRupee,
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react';

export function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Inventory', path: '/admin/inventory', icon: Package },
    { name: 'Foods', path: '/admin/foods', icon: Utensils },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Order Queue', path: '/admin/orders/queue', icon: ListOrdered },
    { name: 'Analytics', path: '/admin/analytics', icon: LineChart },
    { name: 'Sales', path: '/admin/sales', icon: IndianRupee },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-surface border-r border-text-disabled/20 shadow-sm w-64">
      <div className="p-6 border-b border-text-disabled/20">
        <h1 className="text-2xl font-poppins font-bold text-primary">Canteen<span className="text-text-primary">Admin</span></h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-ui transition-colors font-medium text-sm",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-text-secondary hover:bg-surface-bg hover:text-text-primary"
                  )}
                >
                  <Icon size={20} />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-text-disabled/20 space-y-2">
        <Link 
          to="/admin/profile" 
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-3 px-3 py-2 rounded-ui text-sm font-medium text-text-secondary hover:bg-surface-bg hover:text-text-primary"
        >
          <User size={20} />
          Profile
        </Link>
        <button 
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-ui text-sm font-medium text-error hover:bg-error/10 transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-bg flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed inset-y-0 left-0 z-50">
        <SidebarContent />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-text-primary/50 z-40" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Drawer */}
      <div className={cn(
        "md:hidden fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </div>

      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Mobile Top Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-surface border-b border-text-disabled/20 sticky top-0 z-30">
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 text-text-primary hover:bg-surface-bg rounded-ui">
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-poppins font-bold text-primary">Canteen Admin</h1>
          <div className="w-8" /> {/* Spacer */}
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex h-16 bg-surface border-b border-text-disabled/20 items-center justify-end px-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-text-primary">{user?.name}</p>
              <p className="text-xs text-text-secondary">Administrator</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-[80rem] mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
