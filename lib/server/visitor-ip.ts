import "server-only";

import { isValidVisitorIp } from "@/lib/visitor-ip";

export const VERIFIED_CLIENT_IP_HEADER = "x-yasinghasemi-client-ip";
export const TRUSTED_PROXY_MODE = "trusted-proxy";

export function readVisitorIp(
  headers: Headers,
  trustMode: string | undefined,
): string | null {
  if (trustMode !== TRUSTED_PROXY_MODE) return null;

  const candidate = headers.get(VERIFIED_CLIENT_IP_HEADER)?.trim();
  if (
    !candidate ||
    candidate.length > 64 ||
    candidate.includes(",") ||
    candidate.includes("%") ||
    !isValidVisitorIp(candidate)
  ) {
    return null;
  }

  return candidate;
}

export function getVisitorIp(headers: Headers) {
  return readVisitorIp(headers, process.env.VISITOR_IP_TRUST_MODE);
}
