import React, { useEffect, useState } from 'react';
import { api, ApiError } from '../api/client';
import { Cart as CartType, ApiResponse } from '../types';
import { Button } from '../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

export function Cart() {
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get<ApiResponse<CartType>>('/cart');
      if (res.success) {
        setCart({ items: (res.data as any) || [], total: (res as any).total_amount || 0 });
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (foodId: number, quantity: number) => {
    if (quantity < 1) return;
    try {
      await api.put(`/cart/${foodId}`, { quantity });
      await fetchCart();
    } catch (e: any) {
      if (e instanceof ApiError && e.status === 409) {
        alert("Insufficient stock available.");
      } else {
        alert(e.message);
      }
    }
  };

  const removeItem = async (foodId: number) => {
    try {
      await api.delete(`/cart/${foodId}`);
      await fetchCart();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      await fetchCart();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleCheckout = async () => {
    try {
      const res = await api.post<ApiResponse<{ order_id: number }>>('/orders');
      if (res.success) {
        navigate(`/student/orders/${(res as any).order_id}`);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (loading && !cart) {
    return <div className="p-4 text-center text-text-secondary mt-12">Loading cart...</div>;
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="p-4 max-w-[42rem] mx-auto mt-12 text-center flex flex-col items-center">
        <div className="bg-surface p-6 rounded-full inline-flex items-center justify-center mb-6 border border-text-disabled/20">
          <ShoppingBag size={48} className="text-text-disabled" />
        </div>
        <h2 className="text-2xl font-poppins font-medium mb-2">Your cart is empty.</h2>
        <p className="text-text-secondary mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/student/menu">
          <Button>Browse Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-[56rem] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-poppins font-semibold text-primary">Your Cart</h1>
        <Button variant="ghost" onClick={clearCart} className="text-error hover:bg-error/10">Clear Cart</Button>
      </div>
      
      <div className="bg-surface rounded-container shadow-sm border border-text-disabled/20 overflow-hidden">
        <div className="divide-y divide-text-disabled/20">
          {cart.items.map(item => (
            <div key={item.food_id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-medium text-lg text-text-primary">{item.name}</h3>
                <p className="text-text-secondary text-sm">₹{item.unit_price.toFixed(2)} each</p>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                <div className="flex items-center gap-3">
                  <button onClick={() => updateQuantity(item.food_id, item.quantity - 1)} className="p-1 rounded-md bg-surface-bg border border-text-disabled/20 hover:bg-text-disabled/10">
                    <Minus size={16} />
                  </button>
                  <span className="w-6 text-center font-medium">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.food_id, item.quantity + 1)} className="p-1 rounded-md bg-surface-bg border border-text-disabled/20 hover:bg-text-disabled/10">
                    <Plus size={16} />
                  </button>
                </div>
                <div className="font-medium text-lg w-20 text-right">
                  ₹{item.subtotal.toFixed(2)}
                </div>
                <button onClick={() => removeItem(item.food_id)} className="text-text-disabled hover:text-error transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 bg-surface-bg/50 border-t border-text-disabled/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm text-text-secondary">Total Amount</p>
            <p className="text-2xl font-poppins font-bold text-primary">₹{cart.total.toFixed(2)}</p>
          </div>
          <Button onClick={handleCheckout} className="w-full sm:w-auto px-8 py-3 text-lg h-auto">
            Place Order
          </Button>
        </div>
      </div>
    </div>
  );
}
