export type userRole = "admin"| "manager"|"staff"

export interface User {
    id:string;
    name:string;
    email:string;
    role:userRole;
}