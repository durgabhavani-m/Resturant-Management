import type { StaffRole } from "../types/staff";
import type { Permission } from "../types/permission";

export const rolePermissions: Record<StaffRole, Permission[]> = {
  Admin: [
    "dashboard",
    "tables",
    "orders",
    "reservations",
    "billing",
    "customers",
    "menu",
    "reports",
    "staff",
    "settings",
  ],

  "Dine-in Staff": [
    "dashboard",
    "tables",
    "orders",
  ],

  "Counter Staff": [
    "dashboard",
    "reservations",
    "billing",
    "customers",
    "orders",
  ],
};