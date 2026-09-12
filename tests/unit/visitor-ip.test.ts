import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  readVisitorIp,
  TRUSTED_PROXY_MODE,
  VERIFIED_CLIENT_IP_HEADER,
} from "@/lib/server/visitor-ip";

describe("visitor IP trust adapter", () => {
  let headers: Headers;

  beforeEach(() => {
    headers = new Headers();
  });

  it.each(["203.0.113.42", "2001:db8:85a3::8a2e:370:7334"])(
    "accepts a valid %s value only in trusted proxy mode",
    (ip) => {
      headers.set(VERIFIED_CLIENT_IP_HEADER, ip);
      expect(readVisitorIp(headers, TRUSTED_PROXY_MODE)).toBe(ip);
      expect(readVisitorIp(headers, undefined)).toBeNull();
      expect(readVisitorIp(headers, "unknown-mode")).toBeNull();
    },
  );

  it("ignores generic forwarding headers", () => {
    headers.set("cf-connecting-ip", "203.0.113.42");
    headers.set("x-forwarded-for", "203.0.113.42, 198.51.100.2");
    headers.set("x-real-ip", "203.0.113.42");
    expect(readVisitorIp(headers, TRUSTED_PROXY_MODE)).toBeNull();
  });

  it.each([
    "",
    "not-an-ip",
    "203.0.113.42, 198.51.100.2",
    "203.0.113.999",
    "2001:db8::1%eth0",
    "x".repeat(65),
  ])("returns unavailable for invalid value %s", (value) => {
    headers.set(VERIFIED_CLIENT_IP_HEADER, value);
    expect(readVisitorIp(headers, TRUSTED_PROXY_MODE)).toBeNull();
  });

  it("does not treat an absent header as the server address", () => {
    expect(readVisitorIp(headers, TRUSTED_PROXY_MODE)).toBeNull();
  });
});
