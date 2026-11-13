import { api } from './client';
import { Food, ApiResponse } from '../types/food.types';
import { Order } from '../types/order.types';
import { DashboardSummary, InventorySummary } from '../types/admin.types';

export const adminApi = {
  getDashboard: () =>
    api.get<ApiResponse<DashboardSummary>>('/admin/dashboard'),

  getInventorySummary: () =>
    api.get<ApiResponse<InventorySummary>>('/admin/inventory/summary'),

  getFoods: () =>
    api.get<ApiResponse<Food[]>>('/admin/foods'),

  getLowStockFoods: () =>
    api.get<ApiResponse<Food[]>>('/admin/foods/low-stock'),

  getOutOfStockFoods: () =>
    api.get<ApiResponse<Food[]>>('/admin/foods/out-of-stock'),

  addFood: (food: { name: string; category: string; description: string; price: number; stock: number; availability: boolean }) =>
    api.post<ApiResponse<{ food_id: number }>>('/admin/foods', {
      ...food,
      availability: food.availability ? 1 : 0
    }),

  updateFood: (id: number, food: Partial<Food>) =>
    api.put<ApiResponse<Food>>(`/admin/foods/${id}`, {
      ...food,
      availability: food.availability !== undefined ? (food.availability ? 1 : 0) : undefined
    }),

  deleteFood: (id: number) =>
    api.delete<ApiResponse>(`/admin/foods/${id}`),

  updateFoodPrice: (id: number, price: number) =>
    api.put<ApiResponse<Food>>(`/admin/foods/${id}/price`, { price }),

  updateFoodStock: (id: number, stock: number) =>
    api.put<ApiResponse<Food>>(`/admin/foods/${id}/stock`, { stock }),

  getOrders: (statusFilter?: string) => {
    const qs = statusFilter ? `?status=${encodeURIComponent(statusFilter.toLowerCase())}` : '';
    return api.get<ApiResponse<Order[]>>(`/admin/orders${qs}`);
  },

  getOrderQueue: () =>
    api.get<ApiResponse<Order[]>>('/admin/orders/queue'),

  processNextOrder: () =>
    api.post<ApiResponse<Order>>('/admin/orders/next'),

  updateOrderStatus: (orderId: number | string, status: number) =>
    api.put<ApiResponse<Order>>(`/admin/orders/${orderId}/status`, { status }),
};
