import styles from "@/app/contact/contact.module.css";
import { siteConfig } from "@/lib/site-config";

export default function ContactPage() {
  return (
    <main className={styles.contact} id="main-content">
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
