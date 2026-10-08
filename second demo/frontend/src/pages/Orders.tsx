import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Order, ApiResponse } from '../types';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

import { getOrderStatusBadge } from '../utils/status';

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get<ApiResponse<Order[]>>('/orders/history');
        if (res.success && res.data) {
          setOrders(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="p-4 text-center mt-12 text-text-secondary">Loading orders...</div>;

  if (orders.length === 0) {
    return (
      <div className="p-4 max-w-[42rem] mx-auto mt-12 text-center">
        <h2 className="text-2xl font-poppins font-medium mb-2">No orders yet.</h2>
        <p className="text-text-secondary mb-8">Explore the menu and place your first order.</p>
        <Link to="/student/menu">
          <Button>Browse Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-[56rem] mx-auto">
      <h1 className="text-3xl font-poppins font-semibold text-primary mb-6">Order History</h1>
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.order_id} className="bg-surface rounded-container border border-text-disabled/20 shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-semibold text-lg text-text-primary">Order #{order.order_id}</span>
                {getOrderStatusBadge(order.status)}
              </div>
              <p className="text-sm text-text-secondary">
                {new Date(order.created_at * 1000).toLocaleString()}
              </p>
              <p className="font-medium text-text-primary mt-2">
                Total: ₹{order.total_amount.toFixed(2)}
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Link to={`/student/orders/${order.order_id}`} className="flex-1">
                <Button variant="secondary" className="w-full">Track</Button>
              </Link>
              <Link to={`/student/orders/${order.order_id}/receipt`} className="flex-1">
                <Button variant="ghost" className="w-full">Receipt</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
