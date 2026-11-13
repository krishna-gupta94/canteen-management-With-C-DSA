export interface DashboardSummary {
  today_revenue: number;
  pending_orders: number;
  completed_orders_today: number;
  total_food_items: number;
  low_stock_items: number;
  out_of_stock_items: number;
}

export interface InventorySummary {
  total_items: number;
  total_stock_value: number;
  low_stock_items: number;
  out_of_stock_items: number;
}

export interface DailySales {
  date: string;
  total_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  revenue: number;
}

export interface PopularFood {
  food_id: number;
  name: string;
  quantity_sold: number;
  order_count: number;
}
