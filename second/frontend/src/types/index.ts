export interface Food {
  food_id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  availability: boolean;
}

export interface CartItem {
  food_id: number;
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export interface OrderItem {
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  order_id: number;
  student_id: number;
  total_amount: number;
  status: number;
  created_at: number;
}

export interface OrderDetail extends Order {
  item_count: number;
  items: {
    food_id: number;
    quantity: number;
    unit_price: number;
  }[];
}

export interface Receipt {
  canteen_name: string;
  order_id: number;
  date_time: string;
  status: string;
  total: number;
  items: OrderItem[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface DashboardSummary {
  total_food_items: number;
  available_food_items: number;
  unavailable_food_items: number;
  low_stock_items: number;
  out_of_stock_items: number;
  pending_orders: number;
  preparing_orders: number;
  ready_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  today_order_count: number;
  completed_orders_today: number;
  today_revenue: number;
}

export interface InventorySummary {
  total_items: number;
  available_items: number;
  unavailable_items: number;
  low_stock_items: number;
  out_of_stock_items: number;
  total_stock_value: number;
}

export interface QueueOrder {
  order_id: number;
  student_id: number;
  total_amount: number;
  status: number;
  created_at: number;
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
