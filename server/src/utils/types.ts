
export interface UpsertBillRequestBody {
  cafeId: number;
  tableNo: number;
  items: { itemId: number; quantity: number }[];
  paymentMethod?: "counter" | "online";
  specialInstructions?: string;
  orderType?: string;
  sessionToken: string; 
}


export type OrderStatus = "pending" | "accepted" | "preparing" | "ready" | "completed";