import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Order, ApiResponse } from '../types';
import { Button } from '../components/ui/Button';

import { getOrderStatusBadge } from '../utils/status';

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const endpoint = filter ? `/admin/orders?status=${filter}` : '/admin/orders';
      const res = await api.get<ApiResponse<Order[]>>(endpoint);
      if (res.success && res.data) {
        setOrders(res.data);
      } else {
        setOrders([]);
      }
    } catch (e) {
      console.error(e);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const updateStatus = async (orderId: number, newStatus: number) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      await fetchOrders();
    } catch (e: any) {
      alert(e.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-poppins font-semibold text-primary mb-2">Order Management</h1>
          <p className="text-text-secondary">View and update all orders.</p>
        </div>
        <select 
          className="flex h-11 rounded-ui border border-text-disabled/50 bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-surface rounded-container shadow-sm border border-text-disabled/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-surface-bg text-text-secondary border-b border-text-disabled/20">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Student ID</th>
                <th className="px-6 py-4 font-medium">Time</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-text-disabled/10">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-text-secondary">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-text-secondary">No orders found.</td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.order_id} className="hover:bg-surface-bg/50">
                    <td className="px-6 py-4 font-medium">#{order.order_id}</td>
                    <td className="px-6 py-4">{order.student_id}</td>
                    <td className="px-6 py-4">{new Date(order.created_at * 1000).toLocaleString()}</td>
                    <td className="px-6 py-4 font-medium">₹{order.total_amount.toFixed(2)}</td>
                    <td className="px-6 py-4">{getOrderStatusBadge(order.status)}</td>
                    <td className="px-6 py-4 flex gap-2">
                      {order.status === 0 && (
                        <>
                          <Button variant="secondary" onClick={() => updateStatus(order.order_id, 1)}>Prepare</Button>
                          <Button variant="ghost" onClick={() => updateStatus(order.order_id, 4)} className="text-error">Cancel</Button>
                        </>
                      )}
                      {order.status === 1 && (
                        <Button variant="secondary" onClick={() => updateStatus(order.order_id, 2)}>Mark Ready</Button>
                      )}
                      {order.status === 2 && (
                        <Button variant="secondary" onClick={() => updateStatus(order.order_id, 3)}>Complete</Button>
                      )}
                      {(order.status === 3 || order.status === 4) && (
                        <span className="text-text-disabled italic text-xs">No actions</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
