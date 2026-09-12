import ipaddr from "ipaddr.js";

export function isValidVisitorIp(value: string) {
  return (
    value.length <= 64 &&
    !value.includes(",") &&
    !value.includes("%") &&
    ipaddr.isValid(value)
  );
}

export function parseVisitorResponse(value: unknown): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (Object.keys(record).length !== 1 || typeof record.ip !== "string") {
    return null;
  }
  return isValidVisitorIp(record.ip) ? record.ip : null;
}
