import { useState, useEffect, useCallback } from 'react';
import { foodsApi } from '../api/foods.api';
import { Food } from '../types/food.types';

export const DEFAULT_FOOD_IMAGES: Record<string, string> = {
  Snacks: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85',
  Meals: 'https://images.unsplash.com/photo-1680993032090-1ef7ea9b51e5?auto=format&fit=crop&w=900&q=85',
  Beverages: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=900&q=85',
  Desserts: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=85',
  Chinese: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=900&q=85',
  'South Indian': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=85',
  'Fast Food': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=85',
  Pasta: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=85',
  Italian: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=85',
  Default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=85',
};

const resolveFoodImage = (name: string, category: string, explicitImage?: string): string => {
  if (explicitImage && explicitImage.trim().length > 0 && !explicitImage.includes('example.com') && !explicitImage.includes('photo-1621996346565')) {
    return explicitImage;
  }
  const n = (name || '').toLowerCase().trim();
  const c = (category || '').toLowerCase().trim();

  if (n.includes('pasta') || n.includes('macaroni') || n.includes('spaghetti') || n.includes('penne') || n.includes('lasagna')) {
    return 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=85';
  }
  if (n.includes('burger')) return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85';
  if (n.includes('momo') || n.includes('dumpling')) return 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=900&q=85';
  if (n.includes('dosa') || n.includes('idli') || n.includes('vada')) return 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=85';
  if (n.includes('pizza')) return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=85';
  if (n.includes('chai') || n.includes('tea')) return 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=900&q=85';
  if (n.includes('coffee') || n.includes('cappuccino') || n.includes('latte')) return 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=85';
  if (n.includes('sandwich') || n.includes('toast') || n.includes('wrap')) return 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=85';
  if (n.includes('noodle') || n.includes('chowmein') || n.includes('fried rice')) return 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=900&q=85';
  if (n.includes('biryani') || n.includes('rice') || n.includes('pulao')) return 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=900&q=85';
  if (n.includes('thali') || n.includes('curry') || n.includes('paneer') || n.includes('dal')) return 'https://images.unsplash.com/photo-1680993032090-1ef7ea9b51e5?auto=format&fit=crop&w=900&q=85';
  if (n.includes('cake') || n.includes('ice cream') || n.includes('sweet') || n.includes('dessert') || n.includes('gulab')) return 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=85';
  if (n.includes('shake') || n.includes('juice') || n.includes('smoothie')) return 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=900&q=85';

  if (c.includes('pasta') || c.includes('italian')) return DEFAULT_FOOD_IMAGES['Pasta'];
  if (c.includes('south')) return DEFAULT_FOOD_IMAGES['South Indian'];
  if (c.includes('chinese')) return DEFAULT_FOOD_IMAGES['Chinese'];
  if (c.includes('fast')) return DEFAULT_FOOD_IMAGES['Fast Food'];
  if (c.includes('bev') || c.includes('drink')) return DEFAULT_FOOD_IMAGES['Beverages'];
  if (c.includes('snack')) return DEFAULT_FOOD_IMAGES['Snacks'];
  if (c.includes('dessert')) return DEFAULT_FOOD_IMAGES['Desserts'];
  if (c.includes('meal')) return DEFAULT_FOOD_IMAGES['Meals'];

  return DEFAULT_FOOD_IMAGES.Default;
};

export const normalizeFood = (f: any): Food & { id: number } => {
  const food_id = f.food_id || f.id || 0;
  const category = (f.category || 'Meals').trim();
  const name = (f.name || 'Unnamed Food').trim();
  const image = resolveFoodImage(name, category, f.image);

  return {
    food_id,
    id: food_id,
    name,
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
