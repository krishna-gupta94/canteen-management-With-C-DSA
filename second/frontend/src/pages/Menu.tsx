import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import { Food, ApiResponse } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function Menu() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');

  const fetchFoods = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = '/foods';
      
      if (search) {
        endpoint = `/foods/search?q=${encodeURIComponent(search)}`;
      } else if (category) {
        endpoint = `/foods/filter?category=${encodeURIComponent(category)}`;
      }

      if (sort) {
        endpoint += (endpoint.includes('?') ? '&' : '?') + `sort=${sort}`;
      }

      const res = await api.get<ApiResponse<Food[]>>(endpoint);
      if (res.success && res.data) {
        setFoods(res.data);
      } else {
        setFoods([]);
      }
    } catch (e) {
      console.error(e);
      setFoods([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFoods();
    }, 300); // debounce
    return () => clearTimeout(timer);
  }, [fetchFoods]);

  const handleAddToCart = async (foodId: number) => {
    try {
      await api.post('/cart', { food_id: foodId, quantity: 1 });
      alert('Added to cart!');
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="p-4 max-w-[64rem] mx-auto">
      <h1 className="text-3xl font-poppins font-semibold mb-6 text-primary">Menu</h1>
      
      <div className="bg-surface p-4 rounded-container border border-text-disabled/20 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input 
            placeholder="Search food..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCategory(''); }}
          />
        </div>
        <div className="flex gap-4">
          <select 
            className="flex h-11 w-full rounded-ui border border-text-disabled/50 bg-transparent px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            value={category}
            onChange={(e) => { setCategory(e.target.value); setSearch(''); }}
          >
            <option value="">All Categories</option>
            <option value="Snacks">Snacks</option>
            <option value="Beverages">Beverages</option>
            <option value="Meals">Meals</option>
            <option value="Desserts">Desserts</option>
          </select>
          <select 
            className="flex h-11 w-full rounded-ui border border-text-disabled/50 bg-transparent px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="">Default Sort</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-text-secondary">Loading menu...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {foods.map(food => (
              <div key={food.food_id} className="bg-surface rounded-container shadow-sm border border-text-disabled/20 p-4 flex flex-col">
                <h3 className="font-poppins text-lg font-medium text-text-primary">{food.name}</h3>
                <p className="text-sm text-text-secondary mb-2">{food.category}</p>
                <div className="flex justify-between items-center mt-auto pt-4">
                  <span className="font-semibold text-text-primary">₹{food.price.toFixed(2)}</span>
                  {food.availability && food.stock > 0 ? (
                    <Button onClick={() => handleAddToCart(food.food_id)}>Add to Cart</Button>
                  ) : (
                    <span className="text-error text-sm font-medium">Out of Stock</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {foods.length === 0 && (
            <div className="text-center text-text-secondary py-12">
              No food items found matching your criteria.
            </div>
          )}
        </>
      )}
    </div>
  );
}
