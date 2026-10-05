export type RecordIdPrefix =
  | "MENU"
  | "ORDER"
  | "BILL"
  | "TABLE"
  | "STAFF"
  | "CUSTOMER"
  | "RESERVATION";

export const createRecordId = (prefix: RecordIdPrefix): string =>
  `${prefix}-${crypto.randomUUID()}`;

export const normalizeRecordId = (
  id: string | undefined,
  prefix: RecordIdPrefix
): string => {
  const value = id?.trim();

  if (!value) {
    return createRecordId(prefix);
  }

  return value.startsWith(`${prefix}-`) ? value : `${prefix}-${value}`;
};
