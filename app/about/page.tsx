import type { Metadata } from "next";

import { ReadingLayout } from "@/components/reading-layout";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "About",
  description:
    "About Yasin Ghasemi's path from mining engineering into programming.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <ReadingLayout>
      <h1>About</h1>
      <p>
        I&apos;m Yasin Ghasemi, an engineer with a deep interest in creating,
        building, and understanding technology in its many forms.
      </p>
      <p>
        I have an M.Sc. in mining engineering. My master&apos;s thesis became my
        introduction to programming and grew into a project I called MinexPy.
      </p>
      <p>
        This site is where I write about the things I build, the decisions
        behind them, and what I learn along the way.
      </p>
    </ReadingLayout>
  );
}
