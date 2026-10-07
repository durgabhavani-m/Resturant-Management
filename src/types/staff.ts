export type StaffRole = 
| "Admin"
| "Dine-in Staff"
| "Counter Staff";

export type StaffStatus = "Active" | "Inactive";

export interface Staff{
    id:string;
    name:string;
    email:string;
    phone:string;
    role:StaffRole;
    status: StaffStatus;
    createdAt:string;
    password?: string;
}