import type { Metadata } from "next";

import { ReadingLayout } from "@/components/reading-layout";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Terms of Service",
  description:
    "Terms for reading and using the yasinghasemi.com personal blog.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <ReadingLayout>
      <h1>Terms of Service</h1>
      <p>
        These terms apply to your use of yasinghasemi.com, a personal blog and
        publishing website.
      </p>
      <h2>Reading and access</h2>
      <p>
        You may read, link to, and share links to public pages. Do not interfere
        with the site, attempt to bypass its public routes, or use automated
        access in a way that disrupts availability for others.
      </p>
      <h2>Published content</h2>
      <p>
        Unless a specific page says otherwise, the articles and original site
        content belong to the author and remain protected by applicable
        copyright. Brief quotation, linking, and other uses permitted by law are
        not restricted by these terms. A repository license, when present,
        applies to code covered by that license and does not automatically
        license the articles.
      </p>
      <h2>Personal writing</h2>
      <p>
        Posts reflect personal information, experience, and opinion at the time
        they were written. They are not a promise of future results, a service
        guarantee, or professional advice. You are responsible for how you use
        the information.
      </p>
      <h2>Links and availability</h2>
      <p>
        Links to third-party websites are provided for context. Their content
        and availability are outside this site&apos;s control. This site may
        also change, move, or become temporarily unavailable without notice.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about these terms can be sent through the{" "}
        <a href="/contact">contact page</a>.
      </p>
    </ReadingLayout>
  );
}
