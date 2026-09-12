import type { Metadata } from "next";

import { ReadingLayout } from "@/components/reading-layout";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Cookie Management",
  description: "The cookie and browser-storage inventory for yasinghasemi.com.",
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <ReadingLayout>
      <h1>Cookie Management</h1>
      <p>
        This application does not set cookies. It also does not use optional
        analytics, advertising, tracking pixels, or persistent command history.
      </p>
      <h2>No optional preferences</h2>
      <p>
        There are currently no optional cookies to accept, reject, or customize,
        so this page has no preference toggles or save button. A consent banner
        would not change any site behavior and is therefore not shown.
      </p>
      <h2>Browser memory</h2>
      <p>
        Terminal commands, output, and the displayed visitor address remain in
        application memory for the current tab session. They are not written to
        cookies, local storage, or session storage. Reloading the page resets
        them.
      </p>
      <h2>Hosting and security systems</h2>
      <p>
        A hosting provider, reverse proxy, or security service may use its own
        essential cookies independently of this application. The production
        hosting chain has not been verified for this refresh, so no blanket
        claim is made about infrastructure-managed cookies. If the deployed
        setup adds optional storage later, this page and the implementation must
        be updated together.
      </p>
      <p>
        Questions can be sent through the <a href="/contact">contact page</a>.
      </p>
    </ReadingLayout>
  );
}
