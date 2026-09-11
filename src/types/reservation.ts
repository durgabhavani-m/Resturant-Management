export type ReservationStatus = 
| "Pending"
| "Confirmed"
| "Completed"
| "Cancelled"

export interface Reservation {
    id : string;
    customerName: string;
    phone : string;
    date : string;
    time : string;
    guests : number;
    tableNumber : number;
    status : ReservationStatus;
    createdAt : string;
}