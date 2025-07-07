export interface UpsertBillRequestBody {
  cafeId: number;
  tableNo: number;
  items: { itemId: number; quantity: number }[];
  paymentMethod?: "cash" | "online";
  specialInstructions?: string;
  orderType?: "dinein" | "takeaway";
  sessionToken: string;
}

export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "completed";
