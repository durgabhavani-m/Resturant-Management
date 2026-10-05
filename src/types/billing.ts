export type PaymentMethod =
  | "Cash"
  | "UPI"
  | "Card"
  | "Other";

export type PaymentStatus =
  | "Pending"
  | "Paid"
  | "Refunded";

export interface Bill {
  id: string;
  billNumber: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus;
  createdAt: string;
  paidAt?: string;
}