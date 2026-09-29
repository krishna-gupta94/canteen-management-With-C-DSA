import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { InventorySummary, Food, ApiResponse } from '../types';
import { MetricCard } from '../components/ui/MetricCard';
import { Package, AlertTriangle, AlertOctagon, IndianRupee } from 'lucide-react';

export function AdminInventory() {
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [lowStock, setLowStock] = useState<Food[]>([]);
  const [outOfStock, setOutOfStock] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const [sumRes, lowRes, outRes] = await Promise.all([
          api.get<ApiResponse<InventorySummary>>('/admin/inventory/summary'),
          api.get<ApiResponse<Food[]>>('/admin/foods/low-stock'),
          api.get<ApiResponse<Food[]>>('/admin/foods/out-of-stock')
        ]);
        if (sumRes.success && sumRes.data) setSummary(sumRes.data);
        if (lowRes.success && lowRes.data) setLowStock(lowRes.data);
        if (outRes.success && outRes.data) setOutOfStock(outRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-poppins font-semibold text-primary mb-2">Inventory Overview</h1>
        <p className="text-text-secondary">Track stock levels and total stock value (Price x Current Stock).</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Items" value={summary?.total_items ?? 0} icon={Package} loading={loading} />
        <MetricCard title="Total Stock Value" value={`₹${(summary?.total_stock_value ?? 0).toFixed(2)}`} icon={IndianRupee} loading={loading} color="success" />
        <MetricCard title="Low Stock" value={summary?.low_stock_items ?? 0} icon={AlertTriangle} loading={loading} color="warning" />
        <MetricCard title="Out of Stock" value={summary?.out_of_stock_items ?? 0} icon={AlertOctagon} loading={loading} color="error" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-surface rounded-container border border-text-disabled/20 overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 border-b border-text-disabled/20 bg-warning/5 flex items-center gap-2">
            <AlertTriangle className="text-warning" size={20} />
            <h2 className="font-poppins font-semibold text-warning">Low Stock Items (1-5)</h2>
          </div>
          <div className="p-0 overflow-auto max-h-96">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-bg text-text-secondary sticky top-0">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium text-right">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-text-disabled/10">
                {lowStock.map(f => (
                  <tr key={f.food_id} className="hover:bg-surface-bg/50">
                    <td className="px-4 py-3 font-medium text-text-primary">{f.name}</td>
                    <td className="px-4 py-3 text-right font-bold text-warning">{f.stock}</td>
                  </tr>
                ))}
                {lowStock.length === 0 && !loading && (
                  <tr><td colSpan={2} className="px-4 py-8 text-center text-text-secondary">No low-stock items.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-surface rounded-container border border-text-disabled/20 overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 border-b border-text-disabled/20 bg-error/5 flex items-center gap-2">
            <AlertOctagon className="text-error" size={20} />
            <h2 className="font-poppins font-semibold text-error">Out of Stock Items (0)</h2>
          </div>
          <div className="p-0 overflow-auto max-h-96">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-bg text-text-secondary sticky top-0">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium text-right">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-text-disabled/10">
                {outOfStock.map(f => (
                  <tr key={f.food_id} className="hover:bg-surface-bg/50">
                    <td className="px-4 py-3 font-medium text-text-primary">{f.name}</td>
                    <td className="px-4 py-3 text-right font-bold text-error">{f.stock}</td>
                  </tr>
                ))}
                {outOfStock.length === 0 && !loading && (
                  <tr><td colSpan={2} className="px-4 py-8 text-center text-text-secondary">No out of stock items.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
