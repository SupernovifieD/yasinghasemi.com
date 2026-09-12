import type { Metadata } from "next";

import styles from "@/app/contact/contact.module.css";
import { createPageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "Contact",
  description: "Contact Yasin Ghasemi through GitHub, LinkedIn, or email.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main className={styles.contact} id="main-content" tabIndex={-1}>
      <div>
        <h1>/contact</h1>
        <ul>
          <li>
            <a href={siteConfig.social.github}>GitHub</a>
          </li>
          <li>
            <a href={siteConfig.social.linkedin}>LinkedIn</a>
          </li>
          <li>
            <a href={siteConfig.email.href}>{siteConfig.email.label}</a>
          </li>
        </ul>
      </div>
    </main>
  );
}
