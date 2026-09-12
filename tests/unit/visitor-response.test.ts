import { describe, expect, it } from "vitest";

import { isValidVisitorIp, parseVisitorResponse } from "@/lib/visitor-ip";

describe("visitor response validation", () => {
  it.each(["203.0.113.42", "2001:db8::42"])("accepts valid IP %s", (ip) => {
    expect(isValidVisitorIp(ip)).toBe(true);
    expect(parseVisitorResponse({ ip })).toBe(ip);
  });

  it.each([
    null,
    undefined,
    [],
    { ip: null },
    { ip: "invalid" },
    { ip: "203.0.113.42", extra: true },
    { ip: "2001:db8::1%eth0" },
    { ip: "203.0.113.42, 198.51.100.2" },
  ])("uses the neutral fallback for %j", (value) => {
    expect(parseVisitorResponse(value)).toBeNull();
  });
});
