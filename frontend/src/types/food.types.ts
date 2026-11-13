export interface Food {
  food_id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  availability: boolean;
  stock_status?: string;
  image?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  total_amount?: number;
  order_id?: number;
  total?: number;
}
