export const PAGE_PERMISSIONS = [
  "dashboard",
  "tables",
  "orders",
  "reservations",
  "billing",
  "menu",
  "reports",
  "staff",
  "settings",
] as const;

export type Permission = (typeof PAGE_PERMISSIONS)[number];