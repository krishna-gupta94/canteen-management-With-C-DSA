import React, { useEffect, useState } from 'react';
import { getOrderStatusLabel, getOrderStatusBadge } from '../utils/status';
import { api, ApiError } from '../api/client';
import { OrderDetail as OrderDetailType, ApiResponse } from '../types';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get<ApiResponse<OrderDetailType>>(`/orders/${id}`);
        if (res.success && res.data) {
          setOrder(res.data);
        }
      } catch (e: any) {
        if (e instanceof ApiError && e.status === 404) {
          setError("Order not found.");
        } else {
          setError(e.message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="p-4 text-center mt-12 text-text-secondary">Loading order details...</div>;
  if (error) return <div className="p-4 text-center mt-12 text-error font-medium">{error}</div>;
  if (!order) return null;

  const steps = ['Pending', 'Preparing', 'Ready', 'Completed'];
  let currentStep = order.status;
  if (currentStep === 4) currentStep = -1; // Cancelled

  return (
    <div className="p-4 max-w-[48rem] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-poppins font-semibold text-primary">Track Order #{order.order_id}</h1>
        <Link to={`/student/orders/${order.order_id}/receipt`}>
          <Button variant="secondary" className="border-primary text-primary">View Receipt</Button>
        </Link>
      </div>

      <div className="bg-surface rounded-container border border-text-disabled/20 p-6 mb-6">
        {order.status === 4 ? (
          <div className="text-center p-6 bg-error/10 text-error rounded-ui font-medium">
            This order was cancelled.
          </div>
        ) : (
          <div className="relative flex justify-between">
            {/* Simple Progress Bar */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-surface-bg -z-10 -translate-y-1/2">
              <div 
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(Math.max(0, Math.min(3, currentStep)) / 3) * 100}%` }}
              />
            </div>
            {steps.map((step, idx) => {
              const active = idx <= currentStep;
              return (
                <div key={step} className="flex flex-col items-center bg-surface px-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2 ${active ? 'bg-primary text-white' : 'bg-surface-bg text-text-disabled'}`}>
                    {idx + 1}
                  </div>
                  <span className={`text-sm font-medium ${active ? 'text-primary' : 'text-text-disabled'}`}>{step}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-surface rounded-container border border-text-disabled/20 p-6">
        <h2 className="text-xl font-poppins font-medium mb-4 border-b border-text-disabled/20 pb-2">Order Items</h2>
        <div className="space-y-4">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <div>
                <span className="font-medium text-text-primary">Item ID: {item.food_id}</span>
                <span className="text-text-secondary ml-2">x{item.quantity}</span>
              </div>
              <span className="font-medium">₹{(item.quantity * item.unit_price).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-text-disabled/20 flex justify-between items-center">
          <span className="font-semibold text-text-secondary">Total Amount</span>
          <span className="text-2xl font-poppins font-bold text-primary">₹{order.total_amount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
