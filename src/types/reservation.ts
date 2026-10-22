export type ReservationStatus = 
| "Pending"
| "Confirmed"
| "Seated"
| "Completed"
| "Cancelled"
| "No-show";

export interface Reservation {
    id : string;
    customerName: string;
    phone : string;
    date : string;
    time : string;
    guests : number;
    tableNumber : number;
    tableSection: string;
    status : ReservationStatus;
    createdAt : string;
}