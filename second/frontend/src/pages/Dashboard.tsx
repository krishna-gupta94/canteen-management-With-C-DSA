import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowRight, Utensils } from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="p-4 max-w-[64rem] mx-auto space-y-8">
      <header className="bg-surface p-6 rounded-container shadow-sm border border-text-disabled/20 flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-poppins font-semibold text-primary mb-2">
            Hello, {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-text-secondary">Ready to grab a bite? Check out what's on the menu today.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to="/student/menu">
            <Button className="w-full md:w-auto gap-2">
              <Utensils size={18} />
              View Menu
            </Button>
          </Link>
        </div>
      </header>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-poppins font-medium">Quick Access</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/student/cart" className="bg-surface p-4 rounded-container border border-text-disabled/20 shadow-sm hover:border-primary transition-colors group">
            <h3 className="font-medium group-hover:text-primary transition-colors">My Cart</h3>
            <p className="text-sm text-text-secondary mt-1">View items</p>
          </Link>
          <Link to="/student/orders" className="bg-surface p-4 rounded-container border border-text-disabled/20 shadow-sm hover:border-primary transition-colors group">
            <h3 className="font-medium group-hover:text-primary transition-colors">Order History</h3>
            <p className="text-sm text-text-secondary mt-1">Track & Reorder</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
