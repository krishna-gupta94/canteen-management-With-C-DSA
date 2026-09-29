import React, { useEffect, useState } from 'react';
import { api, ApiError } from '../api/client';
import { Receipt as ReceiptType, ApiResponse } from '../types';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ChevronLeft, Printer } from 'lucide-react';

export function ReceiptView() {
  const { id } = useParams<{ id: string }>();
  const [receipt, setReceipt] = useState<ReceiptType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const res = await api.get<ApiResponse<ReceiptType>>(`/orders/${id}/receipt`);
        if (res.success && res.data) {
          setReceipt(res.data);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReceipt();
  }, [id]);

  if (loading) return <div className="p-4 text-center mt-12 text-text-secondary">Loading receipt...</div>;
  if (error) return <div className="p-4 text-center mt-12 text-error font-medium">{error}</div>;
  if (!receipt) return null;

  return (
    <div className="p-4 max-w-[42rem] mx-auto">
      <div className="flex items-center justify-between mb-6 no-print">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 -ml-4">
          <ChevronLeft size={20} /> Back
        </Button>
        <Button variant="secondary" onClick={() => window.print()} className="gap-2">
          <Printer size={18} /> Print
        </Button>
      </div>

      <div className="bg-surface rounded-container border border-text-disabled/20 p-8 shadow-sm print:shadow-none print:border-none print:p-0">
        <div className="text-center mb-8 border-b border-text-disabled/20 pb-6 border-dashed">
          <h1 className="text-3xl font-poppins font-bold text-text-primary mb-2">{receipt.canteen_name}</h1>
          <p className="text-text-secondary text-sm">Order Receipt</p>
        </div>

        <div className="flex justify-between mb-8 text-sm">
          <div>
            <p className="text-text-secondary mb-1">Order Number</p>
            <p className="font-medium text-text-primary">#{receipt.order_id}</p>
          </div>
          <div className="text-right">
            <p className="text-text-secondary mb-1">Date & Time</p>
            <p className="font-medium text-text-primary">{receipt.date_time}</p>
          </div>
        </div>

        <div className="mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-text-disabled/20 text-text-secondary text-left">
                <th className="pb-2 font-medium">Item</th>
                <th className="pb-2 font-medium text-center">Qty</th>
                <th className="pb-2 font-medium text-right">Price</th>
                <th className="pb-2 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-text-disabled/10">
              {receipt.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 font-medium text-text-primary">{item.name}</td>
                  <td className="py-3 text-center">{item.quantity}</td>
                  <td className="py-3 text-right text-text-secondary">₹{item.unit_price.toFixed(2)}</td>
                  <td className="py-3 text-right font-medium">₹{item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-text-disabled/20 border-dashed pt-4 flex justify-between items-center mb-6">
          <span className="font-semibold text-text-primary">Total Amount</span>
          <span className="text-2xl font-poppins font-bold text-primary">₹{receipt.total.toFixed(2)}</span>
        </div>
        
        <div className="text-center">
          <span className="inline-block px-3 py-1 bg-surface-bg border border-text-disabled/20 rounded-pill text-xs font-medium text-text-secondary">
            Status: {receipt.status}
          </span>
        </div>
      </div>
    </div>
  );
}
