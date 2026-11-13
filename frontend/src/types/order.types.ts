export type OrderStatus = 0 | 1 | 2 | 3 | 4; // 0: Pending, 1: Preparing, 2: Ready, 3: Completed, 4: Cancelled

export interface OrderItem {
  food_id: number;
  name?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  order_id: number;
  student_id: number;
  status: OrderStatus;
  items: OrderItem[];
  item_count?: number;
  total_amount: number;
  created_at: number;
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface ReceiptData {
  canteen_name: string;
  order_id: number;
  date_time: string;
  student_name: string;
  student_email: string;
  items: ReceiptItem[];
  total: number;
  status: string;
}
