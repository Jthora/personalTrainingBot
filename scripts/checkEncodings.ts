#!/usr/bin/env node
import { argv, exit } from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';

const args = new Map<string, string>();
for (const arg of argv.slice(2)) {
  const [k, v] = arg.split('=');
  if (k && v) args.set(k.replace(/^--/, ''), v);
}

const base = args.get('base');
if (!base) {
  console.error('Usage: npm run check:encodings -- --base=https://your-host');
  exit(1);
}

const paths = [
  '/training_modules_manifest.json',
  '/training_modules_shards/fitness.json',
  '/index.html',
];

const allowed = ['br', 'gzip'];
const results: { path: string; encoding: string | null; vary: string | null; ok: boolean }[] = [];

async function check(path: string) {
  const url = new URL(path, base).toString();
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Accept-Encoding': 'br, gzip' },
    cache: 'no-store',
  });
  const encoding = res.headers.get('content-encoding');
  const vary = res.headers.get('vary');
  const ok = !!encoding && allowed.includes(encoding.toLowerCase());
  results.push({ path, encoding, vary, ok });
  // be gentle if running against prod
  await delay(50);
}

(async () => {
  for (const p of paths) {
    await check(p);
  }

  let fail = false;
  for (const r of results) {
    const status = r.ok ? 'PASS' : 'FAIL';
    console.log(`${status} ${r.path} -> encoding=${r.encoding ?? 'none'}, vary=${r.vary ?? 'none'}`);
    if (!r.ok) fail = true;
  }

  if (fail) exit(2);
})();
