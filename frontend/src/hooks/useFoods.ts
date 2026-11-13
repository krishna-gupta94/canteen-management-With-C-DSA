import { useState, useEffect, useCallback } from 'react';
import { foodsApi } from '../api/foods.api';
import { Food } from '../types/food.types';

export const DEFAULT_FOOD_IMAGES: Record<string, string> = {
  Snacks: 'https://images.unsplash.com/photo-1708146464361-5c5ce4f9abb6?auto=format&fit=crop&w=900&q=85',
  Meals: 'https://images.unsplash.com/photo-1680993032090-1ef7ea9b51e5?auto=format&fit=crop&w=900&q=85',
  Beverages: 'https://images.unsplash.com/photo-1665660710687-b44c50751054?auto=format&fit=crop&w=1400&q=88',
  Desserts: 'https://images.unsplash.com/photo-1736239092023-ba677fd6751c?auto=format&fit=crop&w=1800&q=88',
  Default: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=85',
};

export const normalizeFood = (f: any): Food & { id: number } => {
  const food_id = f.food_id || f.id || 0;
  const category = f.category || 'Meals';
  const image = f.image || DEFAULT_FOOD_IMAGES[category] || DEFAULT_FOOD_IMAGES.Default;

  return {
    food_id,
    id: food_id,
    name: f.name || 'Unnamed Food',
    category,
    description: f.description || '',
    price: Number(f.price) || 0,
    stock: Number(f.stock) || 0,
    availability: f.availability !== undefined ? Boolean(f.availability) : f.stock > 0,
    stock_status: f.stock_status,
    image,
  };
};

export function useFoods() {
  const [foods, setFoods] = useState<(Food & { id: number })[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFoods = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await foodsApi.getMenu();
      const list = Array.isArray(res.data) ? res.data : [];
      setFoods(list.map(normalizeFood));
    } catch (err: any) {
      setError(err?.message || 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      return fetchFoods();
    }
    setLoading(true);
    setError(null);
    try {
      const res = await foodsApi.searchFoods(query);
      const list = Array.isArray(res.data) ? res.data : [];
      setFoods(list.map(normalizeFood));
    } catch (err: any) {
      setError(err?.message || 'Failed to search foods');
    } finally {
      setLoading(false);
    }
  }, [fetchFoods]);

  const filter = useCallback(async (category?: string, sort?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await foodsApi.filterFoods(category, sort);
      const list = Array.isArray(res.data) ? res.data : [];
      setFoods(list.map(normalizeFood));
    } catch (err: any) {
      setError(err?.message || 'Failed to filter foods');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    foods,
    setFoods,
    loading,
    error,
    reloadFoods: fetchFoods,
    search,
    filter,
  };
}
