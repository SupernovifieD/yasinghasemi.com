import { siteConfig } from "@/lib/site-config";

export default function ContactPage() {
  return (
    <main id="main-content">
      <h1>Contact</h1>
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
    </main>
  );
}
