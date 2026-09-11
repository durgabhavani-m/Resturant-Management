export type TableStatus = 
| "Available"
| "Occupied"
| "Reserved"
| "Cleaning";

export interface RestaurantTable{
    id:string;
    tableNumber:number;
    capacity:number;
    section:string;
    status:TableStatus;
}