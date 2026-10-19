export type OrderStatus = 
| "Pending"
| "Preparing"
| "Ready"
| "Completed"
| "Cancelled";

export type PaymentStatus = 
| "Pending"
| "Paid"
| "Refunded";

export interface SelectedModifier {
  groupId: string;
  groupName: string;
  optionId: string;
  name: string;
  price: number;
}

export interface OrderItem {
    menuItemId : string;
    name : string;
    quantity : number;
    price : number;
    currencyCode?: string;
    modifiers?: SelectedModifier[];
}

export interface Order {
    id:string;
    orderNumber:string
    customerName:string;

    tableNumber ?: number;
    tableSection ?: string;

    items:OrderItem[];
    total: number;
    currencyCode?: string;
    status:OrderStatus;
    orderStatus: OrderStatus;
    orderType : "Dine In" | "Takeaway";
    paymentStatus : PaymentStatus;
    createdAt : string;
}
