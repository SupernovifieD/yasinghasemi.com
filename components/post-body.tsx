import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const allowedProtocols = new Set(["http:", "https:", "mailto:"]);

export function safeMarkdownUrl(url: string) {
  if (
    url.startsWith("//") ||
    url.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(url)
  ) {
    return "";
  }

  if (
    url.startsWith("/") ||
    url.startsWith("#") ||
    url.startsWith("./") ||
    url.startsWith("../")
  ) {
    return url;
  }

  try {
    const parsed = new URL(url);
    return allowedProtocols.has(parsed.protocol) ? url : "";
  } catch {
    return /^[^:]+$/.test(url) ? url : "";
  }
}

export function PostBody({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} urlTransform={safeMarkdownUrl}>
      {children}
    </ReactMarkdown>
  );
}
