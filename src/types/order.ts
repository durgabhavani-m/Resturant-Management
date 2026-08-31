export type OrderStatus = 
| "Pending"
| "Preparing"
| "Ready"
| "Completed"
| "Cancelled";

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
    items:OrderItem[];
    total: number;
    status:OrderStatus;
    orderType : "Dine In" | "Takeaway";
    tableNumber?: number;
    createdAt : string;
}
