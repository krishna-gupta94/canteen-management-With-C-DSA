import { useState, useEffect, useCallback, useMemo } from 'react';
import { cartApi } from '../api/cart.api';
import { CartItem } from '../types/cart.types';

export function useCart(enabled: boolean = true) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const res = await cartApi.getCart();
      if (res && res.success) {
        setItems(res.data || []);
        setTotalAmount(res.total_amount || 0);
      }
    } catch (err: any) {
      // If 401 or not logged in as student, just keep empty
      if (err?.status !== 401 && err?.status !== 403) {
        setError(err?.message || 'Failed to fetch cart');
      }
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const cartMap = useMemo(() => {
    const map: Record<number, number> = {};
    for (const item of items) {
      map[item.food_id] = item.quantity;
    }
    return map;
  }, [items]);

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const addItem = useCallback(async (foodId: number, quantity: number = 1) => {
    setError(null);
    try {
      await cartApi.addItem(foodId, quantity);
      await fetchCart();
    } catch (err: any) {
      setError(err?.message || 'Failed to add item to cart');
      throw err;
    }
  }, [fetchCart]);

  const updateQuantity = useCallback(async (foodId: number, newQty: number) => {
    setError(null);
    try {
      if (newQty <= 0) {
        await cartApi.removeItem(foodId);
      } else {
        await cartApi.updateItem(foodId, newQty);
      }
      await fetchCart();
    } catch (err: any) {
      setError(err?.message || 'Failed to update item quantity');
      throw err;
    }
  }, [fetchCart]);

  const removeItem = useCallback(async (foodId: number) => {
    setError(null);
    try {
      await cartApi.removeItem(foodId);
      await fetchCart();
    } catch (err: any) {
      setError(err?.message || 'Failed to remove item');
      throw err;
    }
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    setError(null);
    try {
      await cartApi.clearCart();
      setItems([]);
      setTotalAmount(0);
    } catch (err: any) {
      setError(err?.message || 'Failed to clear cart');
      throw err;
    }
  }, []);

  return {
    items,
    cartMap,
    itemCount,
    totalAmount,
    loading,
    error,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart: fetchCart,
  };
}
