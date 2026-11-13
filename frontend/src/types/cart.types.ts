export interface CartItem {
  food_id: number;
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface CartResponse {
  success: boolean;
  data: CartItem[];
  total_amount: number;
}
