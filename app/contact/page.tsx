import type { Metadata } from "next";

import styles from "@/app/contact/contact.module.css";
import { ReadingLayout } from "@/components/reading-layout";
import { createPageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "Contact",
  description: "Contact Yasin Ghasemi through GitHub, LinkedIn, or email.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <ReadingLayout placement="short">
      <h1>/contact</h1>
      <ul className={styles.destinations}>
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
    </ReadingLayout>
  );
}
