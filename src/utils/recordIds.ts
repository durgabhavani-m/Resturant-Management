export type RecordIdPrefix =
  | "MENU"
  | "ORDER"
  | "BILL"
  | "TABLE"
  | "STAFF"
  | "CUSTOMER"
  | "RESERVATION";

export const getNextRecordId = (
  prefix: RecordIdPrefix,
  ids: string[]
): string => {
  const highestId = ids.reduce((highest, id) => {
    const match = new RegExp(`^${prefix}-(\\d+)$`).exec(id);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  return `${prefix}-${highestId + 1}`;
};

export const normalizeRecordId = (
  id: string | undefined,
  prefix: RecordIdPrefix
): string => {
  const value = id?.trim();

  if (!value) {
    return getNextRecordId(prefix, []);
  }

  return value.startsWith(`${prefix}-`) ? value : `${prefix}-${value}`;
};

export const resolveRecordId = (id: string, prefix: RecordIdPrefix): string => {
  const aliasesValue = localStorage.getItem("restaurant_record_id_aliases");
  const aliases = aliasesValue
    ? JSON.parse(aliasesValue) as Record<string, string>
    : {};
  return aliases[`${prefix}:${id}`] ?? normalizeRecordId(id, prefix);
};

type StoredRecord = Record<string, unknown> & { id?: string };

const migrateCollection = (
  storageKey: string,
  prefix: RecordIdPrefix
): { records: StoredRecord[]; idMap: Map<string, string>; stored: boolean } => {
  const storedValue = localStorage.getItem(storageKey);
  if (storedValue === null) {
    return { records: [], idMap: new Map(), stored: false };
  }

  const parsedRecords = JSON.parse(storedValue) as StoredRecord[];
  const idMap = new Map<string, string>();
  const records = parsedRecords.map((record, index) => {
    const id = `${prefix}-${index + 1}`;
    if (record.id && !idMap.has(record.id)) idMap.set(record.id, id);
    return { ...record, id };
  });

  localStorage.setItem(storageKey, JSON.stringify(records));
  return { records, idMap, stored: true };
};

export const migrateStoredRecordIds = (): void => {
  const menu = migrateCollection("restaurant_menu", "MENU");
  const tables = migrateCollection("restaurant_tables", "TABLE");
  const staff = migrateCollection("restaurant_staff", "STAFF");
  const customers = migrateCollection("restaurant_customers", "CUSTOMER");
  const reservations = migrateCollection("reservation_customers", "RESERVATION");
  const orders = migrateCollection("restaurant_orders", "ORDER");
  const bills = migrateCollection("restaurant_bills", "BILL");

  const remapMenuId = (id: unknown): unknown => {
    if (typeof id !== "string") return id;
    if (!menu.idMap.has(id)) {
      menu.idMap.set(id, getNextRecordId("MENU", Array.from(menu.idMap.values())));
    }
    return menu.idMap.get(id);
  };

  orders.records.forEach((order) => {
    if (!Array.isArray(order.items)) return;
    order.items = order.items.map((item) => {
      if (!item || typeof item !== "object") return item;
      const orderItem = item as Record<string, unknown>;
      return { ...orderItem, menuItemId: remapMenuId(orderItem.menuItemId) };
    });
  });
  if (orders.stored) {
    localStorage.setItem("restaurant_orders", JSON.stringify(orders.records));
  }

  bills.records.forEach((bill) => {
    if (typeof bill.orderId === "string") {
      bill.orderId = orders.idMap.get(bill.orderId) ?? bill.orderId;
    }
  });
  if (bills.stored) {
    localStorage.setItem("restaurant_bills", JSON.stringify(bills.records));
  }

  const currentUserValue = localStorage.getItem("restaurant_current_user");
  if (currentUserValue) {
    const currentUser = JSON.parse(currentUserValue) as StoredRecord;
    if (typeof currentUser.id === "string") {
      currentUser.id = staff.idMap.get(currentUser.id) ?? currentUser.id;
      localStorage.setItem("restaurant_current_user", JSON.stringify(currentUser));
    }
  }

  const savedAliasesValue = localStorage.getItem("restaurant_record_id_aliases");
  const savedAliases = savedAliasesValue
    ? JSON.parse(savedAliasesValue) as Record<string, string>
    : {};
  const aliases = Object.fromEntries([
    ...Object.entries(savedAliases),
    ...Array.from(menu.idMap, ([oldId, newId]) => [`MENU:${oldId}`, newId]),
    ...Array.from(tables.idMap, ([oldId, newId]) => [`TABLE:${oldId}`, newId]),
    ...Array.from(staff.idMap, ([oldId, newId]) => [`STAFF:${oldId}`, newId]),
    ...Array.from(customers.idMap, ([oldId, newId]) => [`CUSTOMER:${oldId}`, newId]),
    ...Array.from(reservations.idMap, ([oldId, newId]) => [`RESERVATION:${oldId}`, newId]),
    ...Array.from(orders.idMap, ([oldId, newId]) => [`ORDER:${oldId}`, newId]),
    ...Array.from(bills.idMap, ([oldId, newId]) => [`BILL:${oldId}`, newId]),
  ]);
  localStorage.setItem("restaurant_record_id_aliases", JSON.stringify(aliases));
};
