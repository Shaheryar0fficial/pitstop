// Copies a downloaded Firebase service account key into .env.local as one
// line, so nobody has to paste a multi-line JSON by hand.
//
//   node scripts/set-service-account.mjs "C:\Users\you\Downloads\pitstop-5ba45-firebase-adminsdk-xxxx.json"
//
// It never prints the key. Afterwards, delete the downloaded file or keep it
// somewhere private, and never put it inside this project folder (git would
// pick it up).

import { readFileSync, writeFileSync, existsSync } from "node:fs";

const keyPath = process.argv[2];
if (!keyPath) {
  console.error('Usage: node scripts/set-service-account.mjs "<path to the downloaded key .json>"');
  process.exit(1);
}

let key;
try {
  key = JSON.parse(readFileSync(keyPath, "utf8"));
} catch (e) {
  console.error(`Couldn't read that file as JSON: ${e.message}`);
  process.exit(1);
}
if (key.type !== "service_account" || !key.private_key || !key.client_email) {
  console.error("That file doesn't look like a Firebase service account key.");
  process.exit(1);
}

const envPath = ".env.local";
if (!existsSync(envPath)) {
  console.error("No .env.local here. Run this from the PitStop App folder.");
  process.exit(1);
}

const line = `FIREBASE_SERVICE_ACCOUNT=${JSON.stringify(key)}`;
let env = readFileSync(envPath, "utf8");
env = /^FIREBASE_SERVICE_ACCOUNT=.*$/m.test(env)
  ? env.replace(/^FIREBASE_SERVICE_ACCOUNT=.*$/m, () => line)
  : `${env.trimEnd()}\n${line}\n`;
writeFileSync(envPath, env);

console.log(`Done: FIREBASE_SERVICE_ACCOUNT is set for project "${key.project_id}". Now run: npm run seed`);
