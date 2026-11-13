import { useState, useEffect, useCallback } from 'react';
import { ordersApi } from '../api/orders.api';
import { Order as BackendOrder, ReceiptData } from '../types/order.types';

export type Status = 'Pending' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';

export interface UIOrder {
  id: string;
  order_id: number;
  student: string;
  date: string;
  status: Status;
  items: {
    foodId: number;
    name?: string;
    quantity: number;
    price: number;
    subtotal?: number;
  }[];
  total_amount: number;
}

export const statusNumToString = (s: number): Status => {
  switch (s) {
    case 0:
      return 'Pending';
    case 1:
      return 'Preparing';
    case 2:
      return 'Ready';
    case 3:
      return 'Completed';
    case 4:
      return 'Cancelled';
    default:
      return 'Pending';
  }
};

export const statusStringToNum = (s: Status | string): number => {
  switch (s) {
    case 'Pending':
      return 0;
    case 'Preparing':
      return 1;
    case 'Ready':
      return 2;
    case 'Completed':
      return 3;
    case 'Cancelled':
      return 4;
    default:
      return 0;
  }
};

export const formatOrderForUI = (o: BackendOrder, defaultStudentName: string = 'Student'): UIOrder => {
  const dateStr = o.created_at
    ? new Date(o.created_at * 1000).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Recently';

  return {
    id: `CF-${o.order_id}`,
    order_id: o.order_id,
    student: defaultStudentName,
    date: dateStr,
    status: statusNumToString(o.status),
    items: (o.items || []).map((it) => ({
      foodId: it.food_id,
      name: it.food_name || undefined,
      quantity: it.quantity,
      price: it.unit_price,
      subtotal: it.subtotal || it.quantity * it.unit_price,
    })),
    total_amount: o.total_amount,
  };
};

export function useOrders(enabled: boolean = true) {
  const [orders, setOrders] = useState<UIOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const res = await ordersApi.getOrderHistory();
      if (res && res.success) {
        const rawList = Array.isArray(res.data) ? res.data : [];
        const studentName = localStorage.getItem('user_name') || 'Student';
        setOrders(rawList.map((o) => formatOrderForUI(o, studentName)));
      }
    } catch (err: any) {
      if (err?.status !== 401 && err?.status !== 403) {
        setError(err?.message || 'Failed to fetch order history');
      }
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const placeOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ordersApi.placeOrder();
      await fetchOrders();
      return res;
    } catch (err: any) {
      setError(err?.message || 'Failed to place order');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchOrders]);

  const getDetail = useCallback(async (orderId: number | string): Promise<BackendOrder | null> => {
    try {
      const cleanId = String(orderId).replace(/^CF-/, '');
      const res = await ordersApi.getOrderDetail(cleanId);
      return res.data || null;
    } catch (err) {
      console.error('Failed to get order detail', err);
      return null;
    }
  }, []);

  const getReceipt = useCallback(async (orderId: number | string): Promise<ReceiptData | null> => {
    try {
      const cleanId = String(orderId).replace(/^CF-/, '');
      const res = await ordersApi.getOrderReceipt(cleanId);
      return res.data || null;
    } catch (err) {
      console.error('Failed to get receipt', err);
      return null;
    }
  }, []);

  return {
    orders,
    setOrders,
    loading,
    error,
    fetchOrders,
    placeOrder,
    getDetail,
    getReceipt,
  };
}
