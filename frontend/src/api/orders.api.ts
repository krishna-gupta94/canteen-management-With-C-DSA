import { api } from './client';
import { Order, ReceiptData } from '../types/order.types';
import { ApiResponse } from '../types/food.types';

export const ordersApi = {
  placeOrder: () =>
    api.post<ApiResponse<{ order_id: number; total: number }>>('/orders'),

  getOrderHistory: () =>
    api.get<ApiResponse<Order[]>>('/orders/history'),

  getOrderDetail: (orderId: number | string) =>
    api.get<ApiResponse<Order>>(`/orders/${orderId}`),

  getOrderReceipt: (orderId: number | string) =>
    api.get<ApiResponse<ReceiptData>>(`/orders/${orderId}/receipt`),
};
