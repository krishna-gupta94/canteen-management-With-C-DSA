import { api } from './client';
import { Food, ApiResponse } from '../types/food.types';

export const foodsApi = {
  getMenu: () =>
    api.get<ApiResponse<Food[]>>('/foods'),

  searchFoods: (query: string) =>
    api.get<ApiResponse<Food[]>>(`/foods/search?q=${encodeURIComponent(query)}`),

  filterFoods: (category?: string, sort?: string) => {
    let endpoint = '/foods';
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (sort) params.append('sort', sort);
    const qs = params.toString();
    if (qs) endpoint = `/foods/filter?${qs}`;
    return api.get<ApiResponse<Food[]>>(endpoint);
  },
};
