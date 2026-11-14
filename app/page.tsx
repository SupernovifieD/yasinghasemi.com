import styles from "@/app/home.module.css";
import { HomeStage } from "@/components/home/home-stage";
import { getBlogPreviewPosts } from "@/lib/posts";

export default function HomePage() {
  return (
    <main className={styles.home} id="main-content" tabIndex={-1}>
      <HomeStage posts={getBlogPreviewPosts()}>
        <h1>Hello, I&apos;m Yasin Ghasemi.</h1>
        <div className={styles.copy}>
          <p>
            I&apos;m a product manager with experience building products people
            value—from ideation and prototyping through launch, marketing, and
            fundraising.
          </p>
          <p>
            Explore my projects and writings, learn more about me, or get in
            touch through the links below.
          </p>
        </div>
      </HomeStage>
    </main>
  );
}
