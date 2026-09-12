import { TerminalSession } from "@/components/terminal/terminal-session";
import type { PublicRouteRegistry } from "@/lib/terminal/routes";

export function SiteHeader({ registry }: { registry: PublicRouteRegistry }) {
  return <TerminalSession registry={registry} />;
}
