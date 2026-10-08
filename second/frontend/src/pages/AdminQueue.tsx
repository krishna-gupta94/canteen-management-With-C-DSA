import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { QueueOrder, ApiResponse } from '../types';
import { Button } from '../components/ui/Button';
import { ListOrdered, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminQueue() {
  const [queue, setQueue] = useState<QueueOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await api.get<ApiResponse<QueueOrder[]>>('/admin/orders/queue');
      if (res.success && res.data) {
        setQueue(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleProcessNext = async () => {
    try {
      await api.post('/admin/orders/next');
      await fetchQueue();
    } catch (e: any) {
      alert(e.message || 'Failed to process next order');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-poppins font-semibold text-primary mb-2">Live Order Queue</h1>
          <p className="text-text-secondary">Manage the pending FIFO queue.</p>
        </div>
        <Button onClick={handleProcessNext} className="gap-2 shrink-0">
          <Play size={18} fill="currentColor" /> Process Next Order
        </Button>
      </div>

      <div className="bg-surface rounded-container shadow-sm border border-text-disabled/20 overflow-hidden flex flex-col h-[calc(100vh-200px)]">
        <div className="p-4 border-b border-text-disabled/20 bg-surface-bg flex items-center justify-between">
          <div className="flex items-center gap-2 font-poppins font-medium text-text-primary">
            <ListOrdered size={20} className="text-info" />
            Queue Size: {queue.length}
          </div>
          <Button variant="ghost" onClick={fetchQueue} className="px-3 py-1 h-auto text-sm">Refresh</Button>
        </div>
        
        <div className="flex-1 overflow-auto p-4 bg-surface-bg/30">
          {loading && queue.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">Loading queue...</div>
          ) : queue.length === 0 ? (
            <div className="text-center py-24 flex flex-col items-center">
              <div className="bg-surface p-4 rounded-full border border-text-disabled/20 mb-4">
                <ListOrdered size={32} className="text-text-disabled" />
              </div>
              <p className="text-text-secondary font-medium">No active orders in the queue. You're all caught up!</p>
            </div>
          ) : (
            <div className="flex flex-nowrap overflow-x-auto gap-4 pb-4 h-full">
              {queue.map((order, idx) => (
                <div key={order.order_id} className={`shrink-0 w-72 bg-surface rounded-container border shadow-sm flex flex-col ${idx === 0 ? 'border-info ring-1 ring-info' : 'border-text-disabled/20'}`}>
                  <div className={`p-3 border-b border-text-disabled/20 font-poppins font-semibold flex justify-between items-center ${idx === 0 ? 'bg-info/10 text-info' : 'bg-surface-bg text-text-primary'}`}>
                    <span>#{order.order_id}</span>
                    {idx === 0 && <span className="text-xs uppercase tracking-wider">Next up</span>}
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">Time</p>
                      <p className="font-medium text-text-primary mb-4">{new Date(order.created_at * 1000).toLocaleTimeString()}</p>
                      <p className="text-sm text-text-secondary mb-1">Total Amount</p>
                      <p className="font-medium text-text-primary">₹{order.total_amount.toFixed(2)}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-text-disabled/20">
                      <Link to={`/admin/orders/${order.order_id}`}>
                        <Button variant="secondary" className="w-full">View Details</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
