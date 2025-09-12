import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Web Push Lab</h1>
        <a href="/console" className={styles.btn}>
          FCMコンソールからのテスト送信
        </a>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://microayatron.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Created by microayatron.
        </a>
      </footer>
    </div>
  );
}
