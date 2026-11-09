import styles from "@/app/home.module.css";
import { HomeStage } from "@/components/home/home-stage";
import { getBlogPreviewPosts } from "@/lib/posts";

export default function HomePage() {
  return (
    <main className={styles.home} id="main-content" tabIndex={-1}>
      <HomeStage posts={getBlogPreviewPosts()}>
        <h1>Hello, I&apos;m Yasin Ghasemi.</h1>
        <div className={styles.copy}>
          <p>I build things and write about the process.</p>
          <p>
            This is where I share notes on my projects, the decisions behind
            them, and what I learn along the way.
          </p>
        </div>
      </HomeStage>
    </main>
  );
}
