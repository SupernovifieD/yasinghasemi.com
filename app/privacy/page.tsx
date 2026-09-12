import type { Metadata } from "next";

import { ReadingLayout } from "@/components/reading-layout";
import { createPageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy Policy",
  description:
    "How this personal blog handles terminal state and hosting data.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <ReadingLayout>
      <h1>Privacy Policy</h1>
      <p>
        This is a personal publishing website. It has no user accounts, contact
        form, comments, advertising, analytics, or tracking pixels.
      </p>
      <h2>Terminal state</h2>
      <p>
        The navigation terminal keeps its command history and visible output in
        memory for the current browser tab. It does not save that history to
        cookies, local storage, a database, or analytics, and a full page reload
        resets it.
      </p>
      <h2>Hosting and security logs</h2>
      <p>
        Hosting, proxy, and security infrastructure necessarily process network
        requests and may keep operational logs independently of this
        application. The production providers and their retention practices have
        not been verified here, so this policy does not claim that the entire
        hosting chain stores no addresses.
      </p>
      <h2>External links</h2>
      <p>
        Posts and contact details link to other websites. Their privacy
        practices apply after you follow those links.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about this policy can be sent to{" "}
        <a href={siteConfig.email.href}>{siteConfig.email.label}</a> or through
        the destinations listed on the <a href="/contact">contact page</a>.
      </p>
    </ReadingLayout>
  );
}
