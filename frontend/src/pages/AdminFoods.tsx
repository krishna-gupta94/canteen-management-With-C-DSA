import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Food, ApiResponse } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Edit2, Trash2, Plus, Check, X } from 'lucide-react';
import { getStockStatusClass } from '../utils/status';

export function AdminFoods() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  
  // Form state
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    availability: true
  });

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const res = await api.get<ApiResponse<Food[]>>('/admin/foods');
      if (res.success && res.data) {
        setFoods(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const handleOpenModal = (food?: Food) => {
    if (food) {
      setEditingFood(food);
      setFormData({
        name: food.name,
        category: food.category,
        price: food.price.toString(),
        stock: food.stock.toString(),
        availability: food.availability
      });
    } else {
      setEditingFood(null);
      setFormData({ name: '', category: '', price: '', stock: '', availability: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        availability: formData.availability
      };

      if (editingFood) {
        await api.put(`/admin/foods/${editingFood.food_id}`, payload);
      } else {
        await api.post('/admin/foods', payload);
      }
      
      setIsModalOpen(false);
      await fetchFoods();
    } catch (e: any) {
      alert(e.message || 'Failed to save food');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this food item? This will remove it from the active menu.")) {
      try {
        await api.delete(`/admin/foods/${id}`);
        await fetchFoods();
      } catch (e: any) {
        alert(e.message || 'Failed to delete');
      }
    }
  };

  const quickUpdatePrice = async (id: number, price: number) => {
    const newPrice = prompt("Enter new price", price.toString());
    if (newPrice && !isNaN(parseFloat(newPrice))) {
      try {
        await api.put(`/admin/foods/${id}/price`, { price: parseFloat(newPrice) });
        await fetchFoods();
      } catch (e: any) {
        alert(e.message);
      }
    }
  };

  const quickUpdateStock = async (id: number, stock: number) => {
    const newStock = prompt("Enter new stock count", stock.toString());
    if (newStock && !isNaN(parseInt(newStock, 10))) {
      try {
        await api.put(`/admin/foods/${id}/stock`, { stock: parseInt(newStock, 10) });
        await fetchFoods();
      } catch (e: any) {
        alert(e.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-poppins font-semibold text-primary mb-2">Food Management</h1>
          <p className="text-text-secondary">Add, edit, or remove menu items.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2 shrink-0">
          <Plus size={18} /> Add Food
        </Button>
      </div>

      <div className="bg-surface rounded-container shadow-sm border border-text-disabled/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-surface-bg text-text-secondary border-b border-text-disabled/20">
              <tr>
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-text-disabled/10">
              {loading && foods.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-text-secondary">Loading foods...</td>
                </tr>
              ) : foods.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-text-secondary">No food items found. Add your first item.</td>
                </tr>
              ) : (
                foods.map(food => (
                  <tr key={food.food_id} className="hover:bg-surface-bg/50">
                    <td className="px-6 py-4">{food.food_id}</td>
                    <td className="px-6 py-4 font-medium">{food.name}</td>
                    <td className="px-6 py-4">{food.category}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        ₹{food.price.toFixed(2)}
                        <button onClick={() => quickUpdatePrice(food.food_id, food.price)} className="text-text-disabled hover:text-primary"><Edit2 size={14} /></button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={getStockStatusClass(food.stock)}>
                          {food.stock}
                        </span>
                        <button onClick={() => quickUpdateStock(food.food_id, food.stock)} className="text-text-disabled hover:text-primary"><Edit2 size={14} /></button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {food.availability ? (
                        <span className="px-2 py-1 rounded-pill text-xs font-medium bg-success/10 text-success inline-flex items-center gap-1">
                          <Check size={12} /> Available
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-pill text-xs font-medium bg-error/10 text-error inline-flex items-center gap-1">
                          <X size={12} /> Hidden
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button variant="ghost" onClick={() => handleOpenModal(food)} className="px-2 py-1 h-auto text-info hover:bg-info/10">
                        Edit
                      </Button>
                      <Button variant="ghost" onClick={() => handleDelete(food.food_id)} className="px-2 py-1 h-auto text-error hover:bg-error/10">
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-text-primary/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-container shadow-lg max-w-[28rem] w-full border border-text-disabled/20 overflow-hidden">
            <div className="p-6 border-b border-text-disabled/20 flex justify-between items-center bg-surface-bg">
              <h2 className="text-xl font-poppins font-semibold">{editingFood ? 'Edit Food' : 'Add Food'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-text-secondary hover:text-text-primary">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input 
                label="Name" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
              />
              <Input 
                label="Category" 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})} 
                required 
              />
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Price (₹)" 
                  type="number" 
                  step="0.01"
                  min="0.01"
                  value={formData.price} 
                  onChange={e => setFormData({...formData, price: e.target.value})} 
                  required 
                />
                <Input 
                  label="Stock" 
                  type="number" 
                  min="0"
                  value={formData.stock} 
                  onChange={e => setFormData({...formData, stock: e.target.value})} 
                  required 
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="availability"
                  checked={formData.availability}
                  onChange={e => setFormData({...formData, availability: e.target.checked})}
                  className="w-4 h-4 text-primary rounded border-text-disabled/50 focus:ring-primary"
                />
                <label htmlFor="availability" className="text-sm font-medium text-text-primary">
                  Available on Menu
                </label>
              </div>
              
              <div className="pt-4 flex gap-3">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1" isLoading={formLoading}>{editingFood ? 'Save Changes' : 'Add Item'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
