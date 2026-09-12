import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { GET } from "@/app/api/visitor/route";
import {
  TRUSTED_PROXY_MODE,
  VERIFIED_CLIENT_IP_HEADER,
} from "@/lib/server/visitor-ip";

const originalTrustMode = process.env.VISITOR_IP_TRUST_MODE;

afterEach(() => {
  if (originalTrustMode === undefined) {
    delete process.env.VISITOR_IP_TRUST_MODE;
  } else {
    process.env.VISITOR_IP_TRUST_MODE = originalTrustMode;
  }
});

describe("GET /api/visitor", () => {
  it("returns only an unavailable IP without configured trust", async () => {
    delete process.env.VISITOR_IP_TRUST_MODE;
    const response = GET(
      new Request("https://yasinghasemi.com/api/visitor", {
        headers: { "x-forwarded-for": "203.0.113.42" },
      }),
    );

    expect(await response.json()).toEqual({ ip: null });
    expect([...response.headers.keys()].sort()).toEqual([
      "cache-control",
      "content-security-policy",
      "content-type",
      "x-content-type-options",
    ]);
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it.each(["203.0.113.42", "2001:db8::42"])(
    "returns the dedicated trusted value for %s",
    async (ip) => {
      process.env.VISITOR_IP_TRUST_MODE = TRUSTED_PROXY_MODE;
      const response = GET(
        new Request("https://yasinghasemi.com/api/visitor", {
          headers: { [VERIFIED_CLIENT_IP_HEADER]: ip },
        }),
      );

      expect(await response.json()).toEqual({ ip });
      expect(response.headers.get("cache-control")).toBe(
        "private, no-store, max-age=0",
      );
    },
  );
});
