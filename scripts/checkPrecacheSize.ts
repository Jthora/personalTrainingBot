#!/usr/bin/env node
import { exit } from 'node:process';

const PRECACHE = [
  '/',
  '/index.html',
  '/training_modules_manifest.json',
  '/training_modules_shards/fitness.json',
];

const args = new Map<string, string>();
for (const arg of process.argv.slice(2)) {
  const [k, v] = arg.split('=');
  if (k && v) args.set(k.replace(/^--/, ''), v);
}

const base = args.get('base') ?? 'http://localhost:4173';
const budgetKb = Number(args.get('budgetKb') ?? '2048');

const normalize = (url: string) => url.endsWith('/') ? url.slice(0, -1) : url;
const baseUrl = normalize(base);

async function headSize(path: string) {
  const url = `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  const resp = await fetch(url, { method: 'HEAD' });
  if (!resp.ok) throw new Error(`HEAD ${url} -> ${resp.status}`);
  const len = resp.headers.get('content-length');
  return len ? Number(len) : 0;
}

(async () => {
  try {
    let total = 0;
    for (const path of PRECACHE) {
      const size = await headSize(path);
      total += size;
      console.log(`${path} ${size} bytes`);
    }
    const totalKb = Math.round((total / 1024) * 100) / 100;
    console.log(`Total: ${totalKb} KB (budget ${budgetKb} KB)`);
    if (totalKb > budgetKb) {
      console.error(`FAIL: precache exceeds budget by ${Math.round(totalKb - budgetKb)} KB`);
      exit(2);
    }
  } catch (err) {
    console.error('FAIL: precache size check', err);
    exit(2);
  }
})();
