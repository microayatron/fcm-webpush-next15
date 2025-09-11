import Image from "next/image";
import styles from "./page.module.css";
import FcmClient from '@/components/FcmClient';

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className="text-2xl font-bold mb-4">FCM Web Push（実装編）</h1>
        <FcmClient />
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
