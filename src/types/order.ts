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

export interface OrderItem {
    menuItemId : string;
    name : string;
    quantity : number;
    price : number;
}

export interface Order {
    id:string;
    orderNumber:string
    customerName:string;

    tableNumber ?: number;
    tableSection ?: string;

    items:OrderItem[];
    total: number;
    status:OrderStatus;
    orderStatus: OrderStatus;
    orderType : "Dine In" | "Takeaway";
    paymentStatus : PaymentStatus;
    createdAt : string;
}
