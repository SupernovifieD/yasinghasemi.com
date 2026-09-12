# Visitor IP deployment boundary

The application displays `visitor` unless `VISITOR_IP_TRUST_MODE` is exactly
`trusted-proxy`. In that mode, `/api/visitor` reads only the dedicated
`X-Yasinghasemi-Client-IP` header. The application deliberately ignores
`CF-Connecting-IP`, `X-Forwarded-For`, and `X-Real-IP` because receiving one of
those headers does not prove which proxy supplied it.

The mode may be enabled only after the production ingress establishes all of
these conditions:

- Cloudflare, if used, is the only public path to the origin, with current
  official Cloudflare address ranges trusted at the site-specific proxy.
- The reverse proxy removes any client-supplied
  `X-Yasinghasemi-Client-IP` value and overwrites it with the validated remote
  address restored by that trusted ingress configuration.
- The Next.js process listens only on loopback or a private network that public
  clients cannot bypass.
- The proxy and CDN do not cache `/api/visitor`; the application already sends
  `Cache-Control: private, no-store, max-age=0`.
- Spoofing and two-client isolation tests pass through the representative proxy
  path, including IPv4 and IPv6.

Do not enable trusted mode when any condition is unverified. The safe result is
`{"ip":null}`, and the prompt remains `visitor@yasinghasemi.com`.

The repository currently publishes through GitHub Pages from `main` and the
repository root. GitHub Pages is a static host and cannot execute this Next.js
route handler. A runtime-capable Next.js deployment behind the verified ingress
is therefore required before production IP display can work. No proxy,
Cloudflare, firewall, hosting, DNS, or deployment changes were applied as part
of the site implementation.

Application tests prove parsing, trust-mode gating, response isolation, and
no-store response headers. They do not prove the production proxy trust boundary
or infrastructure log retention; those remain deployment checks.
