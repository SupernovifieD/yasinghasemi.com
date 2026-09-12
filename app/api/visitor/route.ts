import { getVisitorIp } from "@/lib/server/visitor-ip";

export const dynamic = "force-dynamic";

const responseHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "X-Content-Type-Options": "nosniff",
};

export function GET(request: Request) {
  return Response.json(
    { ip: getVisitorIp(request.headers) },
    { headers: responseHeaders },
  );
}
