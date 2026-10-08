import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { DailySales, ApiResponse } from '../types';
import { MetricCard } from '../components/ui/MetricCard';
import { IndianRupee, FileText, XCircle, CheckCircle2 } from 'lucide-react';
import { Input } from '../components/ui/Input';

export function AdminSales() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sales, setSales] = useState<DailySales | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        const res = await api.get<ApiResponse<DailySales>>(`/admin/sales/daily?date=${date}`);
        if (res.success && res.data) {
          setSales(res.data);
        } else {
          setSales(null);
        }
      } catch (e) {
        console.error(e);
        setSales(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, [date]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-poppins font-semibold text-primary mb-2">Daily Sales</h1>
          <p className="text-text-secondary">View finalized revenue. Only COMPLETED orders contribute to revenue.</p>
        </div>
        <div className="w-full sm:w-48">
          <Input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
          />
        </div>
      </div>

      {!loading && !sales ? (
        <div className="bg-surface p-12 rounded-container border border-text-disabled/20 text-center text-text-secondary">
          No completed sales data available for this date.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            title="Finalized Revenue" 
            value={sales ? `₹${sales.revenue.toFixed(2)}` : '₹0.00'} 
            icon={IndianRupee} 
            loading={loading} 
            color="success" 
          />
          <MetricCard 
            title="Total Orders" 
            value={sales?.total_orders ?? 0} 
            icon={FileText} 
            loading={loading} 
            color="primary" 
          />
          <MetricCard 
            title="Completed" 
            value={sales?.completed_orders ?? 0} 
            icon={CheckCircle2} 
            loading={loading} 
            color="success" 
          />
          <MetricCard 
            title="Cancelled" 
            value={sales?.cancelled_orders ?? 0} 
            icon={XCircle} 
            loading={loading} 
            color="error" 
          />
        </div>
      )}
    </div>
  );
}
