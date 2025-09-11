const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const MODE = process.env.NODE_ENV || 'development';
const order = [
  `.env.${MODE}.local`,
  `.env.${MODE}`,
  `.env.local`,
  `.env`,
];

for (const file of order) {
  const envPath = path.resolve(__dirname, `../${file}`);
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true });
  }
}

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// 必須キーの存在チェック
const required = ['apiKey', 'projectId', 'messagingSenderId', 'appId'];
const missing = required.filter((k) => !config[k]);
if (missing.length) {
  console.error('[generate-config] Missing keys:', missing.join(', '));
  process.exit(1);
}

const out = `self.firebaseConfig = ${JSON.stringify(config)};`;
fs.writeFileSync(path.join(__dirname, '../public/firebase-config.js'), out, 'utf8');
console.log('Firebase config generated:', MODE);
