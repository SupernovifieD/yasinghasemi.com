import { getLegacyStaticRedirects } from "./legacy-routes";
import { siteConfig } from "./site-config";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function renderStaticRedirect(canonicalPath: string) {
  if (!/^\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(canonicalPath)) {
    throw new Error(`Unsafe canonical redirect path: ${canonicalPath}`);
  }

  const canonicalUrl = new URL(canonicalPath, siteConfig.origin).href;
  const safePath = escapeHtml(canonicalPath);
  const safeCanonicalUrl = escapeHtml(canonicalUrl);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <meta http-equiv="refresh" content="0; url=${safePath}">
    <link rel="canonical" href="${safeCanonicalUrl}">
    <title>Redirecting…</title>
  </head>
  <body>
    <p>Moved permanently to <a href="${safePath}">${safePath}</a>.</p>
    <script>window.location.replace(${JSON.stringify(canonicalPath)});</script>
  </body>
</html>
`;
}

export function getStaticRedirectOutputs() {
  return getLegacyStaticRedirects().map(({ outputPath, canonicalPath }) => ({
    outputPath,
    canonicalPath,
    content: renderStaticRedirect(canonicalPath),
  }));
}
