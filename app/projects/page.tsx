import type { Metadata } from "next";

import { ReadingLayout } from "@/components/reading-layout";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Projects",
  description: "Projects by Yasin Ghasemi.",
  path: "/projects",
});

export default function ProjectsPage() {
  return (
    <ReadingLayout placement="short">
      <h1>/projects</h1>
      <p>Projects are coming soon.</p>
    </ReadingLayout>
  );
}
