import { api } from './client';
import { PopularFood, DailySales } from '../types/admin.types';
import { ApiResponse } from '../types/food.types';

export const analyticsApi = {
  getPopularFoods: () =>
    api.get<ApiResponse<PopularFood[]>>('/admin/popular-foods'),

  getDailySales: (date?: string) => {
    const qs = date ? `?date=${encodeURIComponent(date)}` : '';
    return api.get<ApiResponse<DailySales>>(`/admin/sales/daily${qs}`);
  },
};
