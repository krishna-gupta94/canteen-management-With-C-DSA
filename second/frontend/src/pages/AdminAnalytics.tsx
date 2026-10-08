import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { PopularFood, ApiResponse } from '../types';
import { Trophy } from 'lucide-react';

export function AdminAnalytics() {
  const [popular, setPopular] = useState<PopularFood[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get<ApiResponse<PopularFood[]>>('/admin/popular-foods');
        if (res.success && res.data) {
          setPopular(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-poppins font-semibold text-primary mb-2">Analytics</h1>
        <p className="text-text-secondary">Discover what's trending in your canteen.</p>
      </div>

      <div className="bg-surface rounded-container border border-text-disabled/20 shadow-sm overflow-hidden max-w-[48rem]">
        <div className="p-4 border-b border-text-disabled/20 bg-surface-bg flex items-center gap-2">
          <Trophy className="text-accent" size={20} />
          <h2 className="font-poppins font-medium text-text-primary">Popular Foods Leaderboard</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-bg/50 text-text-secondary">
              <tr>
                <th className="px-6 py-4 font-medium">Rank</th>
                <th className="px-6 py-4 font-medium">Food Name</th>
                <th className="px-6 py-4 font-medium text-right">Quantity Sold</th>
                <th className="px-6 py-4 font-medium text-right">Order Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-text-disabled/10">
              {loading && popular.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-text-secondary">Loading leaderboard...</td>
                </tr>
              ) : popular.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-text-secondary">No analytics data available yet.</td>
                </tr>
              ) : (
                popular.map((item, idx) => (
                  <tr key={item.food_id} className="hover:bg-surface-bg transition-colors">
                    <td className="px-6 py-4">
                      {idx === 0 && <span className="text-accent font-bold text-lg">🥇 1</span>}
                      {idx === 1 && <span className="text-text-disabled font-bold text-lg">🥈 2</span>}
                      {idx === 2 && <span className="text-[#CD7F32] font-bold text-lg">🥉 3</span>}
                      {idx > 2 && <span className="text-text-secondary font-medium pl-2">{idx + 1}</span>}
                    </td>
                    <td className="px-6 py-4 font-medium text-text-primary">{item.name}</td>
                    <td className="px-6 py-4 text-right font-medium">{item.quantity_sold}</td>
                    <td className="px-6 py-4 text-right text-text-secondary">{item.order_count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
