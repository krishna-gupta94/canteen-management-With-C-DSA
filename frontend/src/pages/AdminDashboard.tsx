import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { DashboardSummary, ApiResponse } from '../types';
import { MetricCard } from '../components/ui/MetricCard';
import { IndianRupee, ListOrdered, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

export function AdminDashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get<ApiResponse<DashboardSummary>>('/admin/dashboard');
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-poppins font-semibold text-primary mb-2">Dashboard Overview</h1>
        <p className="text-text-secondary">Track today's operational metrics and sales.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Today's Revenue" 
          value={data ? `₹${data.today_revenue.toFixed(2)}` : '₹0.00'} 
          icon={IndianRupee} 
          loading={loading}
          color="success"
        />
        <MetricCard 
          title="Pending Orders" 
          value={data?.pending_orders ?? 0} 
          icon={ListOrdered} 
          loading={loading}
          color="info"
        />
        <MetricCard 
          title="Completed Today" 
          value={data?.completed_orders_today ?? 0} 
          icon={CheckCircle2} 
          loading={loading}
          color="primary"
        />
        <MetricCard 
          title="Total Food Items" 
          value={data?.total_food_items ?? 0} 
          icon={ListOrdered} 
          loading={loading}
          color="primary"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-surface rounded-container border border-text-disabled/20 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-warning/10 text-warning rounded-ui">
              <AlertTriangle size={20} />
            </div>
            <h2 className="text-xl font-poppins font-medium">Low Stock Alerts</h2>
          </div>
          {loading ? (
            <div className="h-12 bg-surface-bg animate-pulse rounded" />
          ) : (
            <div className="flex justify-between items-center bg-surface-bg p-4 rounded-ui">
              <span className="font-medium text-text-primary">Items running low</span>
              <span className="text-xl font-bold text-warning">{data?.low_stock_items ?? 0}</span>
            </div>
          )}
        </div>

        <div className="bg-surface rounded-container border border-text-disabled/20 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-error/10 text-error rounded-ui">
              <AlertOctagon size={20} />
            </div>
            <h2 className="text-xl font-poppins font-medium">Out of Stock</h2>
          </div>
          {loading ? (
            <div className="h-12 bg-surface-bg animate-pulse rounded" />
          ) : (
            <div className="flex justify-between items-center bg-surface-bg p-4 rounded-ui">
              <span className="font-medium text-text-primary">Depleted items</span>
              <span className="text-xl font-bold text-error">{data?.out_of_stock_items ?? 0}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
