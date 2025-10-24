import FcmClient from '@/components/FcmClient';

export default function Page() {
  return (
    <main style={{ padding: 24 }}>
      <h1 className="text-2xl font-bold mb-4">FCM Web Push（実装編）</h1>
      <FcmClient />
    </main>
  );
}
