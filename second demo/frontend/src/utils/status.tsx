import React from 'react';

export const getOrderStatusBadge = (status: number) => {
  switch (status) {
    case 0: return <span className="px-2 py-1 rounded-pill text-xs font-medium bg-info/10 text-info">Pending</span>;
    case 1: return <span className="px-2 py-1 rounded-pill text-xs font-medium bg-warning/10 text-warning">Preparing</span>;
    case 2: return <span className="px-2 py-1 rounded-pill text-xs font-medium bg-success/10 text-success">Ready</span>;
    case 3: return <span className="px-2 py-1 rounded-pill text-xs font-medium bg-success/20 text-success">Completed</span>;
    case 4: return <span className="px-2 py-1 rounded-pill text-xs font-medium bg-error/10 text-error">Cancelled</span>;
    default: return <span className="px-2 py-1 rounded-pill text-xs font-medium bg-text-disabled/10 text-text-secondary">Unknown</span>;
  }
};

export const getOrderStatusLabel = (status: number) => {
  switch (status) {
    case 0: return 'Pending';
    case 1: return 'Preparing';
    case 2: return 'Ready';
    case 3: return 'Completed';
    case 4: return 'Cancelled';
    default: return 'Unknown';
  }
};

export const getStockStatusBadge = (stock: number) => {
  if (stock === 0) {
    return <span className="text-error font-bold text-sm">Out of Stock</span>;
  }
  if (stock >= 1 && stock <= 5) {
    return <span className="text-warning font-bold text-sm">Low Stock</span>;
  }
  return <span className="text-success font-medium text-sm">Available</span>;
};

export const getStockStatusClass = (stock: number) => {
  if (stock === 0) return 'text-error font-bold';
  if (stock >= 1 && stock <= 5) return 'text-warning font-bold';
  return 'text-text-primary';
};
