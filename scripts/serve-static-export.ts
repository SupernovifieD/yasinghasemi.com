import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";

const outputRoot = resolve(process.cwd(), "out");
const port = Number.parseInt(process.env.PORT ?? "3000", 10);

const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

async function findExportedFile(pathname: string) {
  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  const relativePath = decodedPath.replace(/^\/+/, "");
  const candidates = relativePath
    ? [relativePath, `${relativePath}.html`, `${relativePath}/index.html`]
    : ["index.html"];

  for (const candidate of candidates) {
    const filePath = resolve(outputRoot, candidate);
    if (!filePath.startsWith(`${outputRoot}${sep}`)) continue;

    try {
      if ((await stat(filePath)).isFile()) return filePath;
    } catch {
      // Try the next static-file form.
    }
  }

  return null;
}

const server = createServer(async (request, response) => {
  if (!request.url || !["GET", "HEAD"].includes(request.method ?? "")) {
    response.writeHead(405).end();
    return;
  }

  const pathname = new URL(request.url, "http://127.0.0.1").pathname;
  const filePath = await findExportedFile(pathname);
  const responsePath = filePath ?? resolve(outputRoot, "404.html");
  const statusCode = filePath ? 200 : 404;

  response.writeHead(statusCode, {
    "Content-Type":
      contentTypes[extname(responsePath)] ?? "application/octet-stream",
  });

  if (request.method === "HEAD") {
    response.end();
    return;
  }

  createReadStream(responsePath).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Serving static export at http://127.0.0.1:${port}`);
});
