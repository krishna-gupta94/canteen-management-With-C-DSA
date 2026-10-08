import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, User } from 'lucide-react';
import { cn } from '../ui/Button';

export function StudentLayout() {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/student', icon: Home },
    { name: 'Search', path: '/student/menu', icon: Search },
    { name: 'Cart', path: '/student/cart', icon: ShoppingCart },
    { name: 'Profile', path: '/student/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col">
      {/* Top Header for Desktop */}
      <header className="hidden md:flex items-center justify-between px-lg py-md bg-surface border-b border-text-disabled/20 shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-poppins font-semibold text-primary">Canteen</h1>
        <nav className="flex space-x-md">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              to={item.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.pathname === item.path ? "text-primary" : "text-text-secondary"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[80rem] mx-auto p-md pb-24 md:pb-md">
        <Outlet />
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-0 w-full bg-surface border-t border-text-disabled/20 shadow-[0_-4px_6px_rgba(0,0,0,0.05)] z-10">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/student/menu' && location.pathname.startsWith('/student/menu'));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                  isActive ? "text-primary" : "text-text-disabled"
                )}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  );
}
