import { api } from './client';
import { CartResponse } from '../types/cart.types';
import { ApiResponse } from '../types/food.types';

export const cartApi = {
  getCart: () =>
    api.get<CartResponse>('/cart'),

  addItem: (food_id: number, quantity: number = 1) =>
    api.post<ApiResponse>('/cart', { food_id, quantity }),

  updateItem: (food_id: number, quantity: number) =>
    api.put<ApiResponse>(`/cart/${food_id}`, { quantity }),

  removeItem: (food_id: number) =>
    api.delete<ApiResponse>(`/cart/${food_id}`),

  clearCart: () =>
    api.delete<ApiResponse>('/cart'),
};
