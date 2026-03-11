/**
 * pinToIpfs.ts — Pin training module shards to IPFS via Pinata.
 *
 * Reads every shard listed in public/training_modules_manifest.json,
 * uploads it to Pinata's pinning service, and writes the returned CID
 * back into the manifest under each entry's `ipfsCid` field.
 *
 * Once the manifest contains CIDs, the app's `ipfsFetcher.ts` (when the
 * `ipfsContent` feature flag is on) will serve content from IPFS gateways
 * instead of the static hosting fallback — completing the decentralized
 * content distribution architecture.
 *
 * Prerequisites:
 *   PINATA_JWT — Pinata v3 JWT from https://app.pinata.cloud/developers/api-keys
 *
 * Usage:
 *   PINATA_JWT=<your-jwt> npx tsx scripts/pinToIpfs.ts
 *   PINATA_JWT=<your-jwt> DRY_RUN=true npx tsx scripts/pinToIpfs.ts
 *
 * Idempotency:
 *   If an entry already has an `ipfsCid` AND `--force` is not set, the shard
 *   is skipped. Set FORCE=true to re-pin all shards.
 *
 * Output:
 *   Writes updated manifest to public/training_modules_manifest.json in-place.
 *   Logs a summary of pinned / skipped / failed shards.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { FormData, Blob } from 'node:buffer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Config ───────────────────────────────────────────────────────────────────

const MANIFEST_PATH = path.resolve(__dirname, '..', 'public', 'training_modules_manifest.json');
const SHARDS_DIR    = path.resolve(__dirname, '..', 'public', 'training_modules_shards');

const PINATA_JWT    = process.env.PINATA_JWT ?? '';
const DRY_RUN       = process.env.DRY_RUN === 'true';
const FORCE         = process.env.FORCE === 'true';
const PINATA_API    = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
const REQUEST_DELAY = 500; // ms between requests — Pinata free tier rate limit

// ─── Types ────────────────────────────────────────────────────────────────────

interface ManifestEntry {
  id: string;
  shard: string;
  ipfsCid?: string;
  hash?: string;
  size?: number;
  version?: string;
  subModuleCount?: number;
  cardDeckCount?: number;
}

interface Manifest {
  generatedAt?: string;
  version?: string;
  modules: ManifestEntry[];
}

interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Upload a file buffer to Pinata and return the IPFS CID.
 */
const pinFileToPinata = async (
  filename: string,
  content: Buffer,
): Promise<string> => {
  // Use the global fetch available in Node 18+ / tsx
  const body = new FormData();
  const blob = new Blob([content], { type: 'application/json' });
  body.append('file', blob, filename);
  body.append(
    'pinataMetadata',
    JSON.stringify({ name: `ptb-shard-${filename}` }),
  );
  body.append(
    'pinataOptions',
    JSON.stringify({ cidVersion: 1 }),
  );

  const response = await fetch(PINATA_API, {
    method: 'POST',
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: body as any,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Pinata returned ${response.status}: ${text}`);
  }

  const result = (await response.json()) as PinataResponse;
  return result.IpfsHash;
};

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  // ── Validate env ──────────────────────────────────────────────
  if (!PINATA_JWT && !DRY_RUN) {
    console.error(
      '❌ PINATA_JWT env var is required.\n' +
      '   Get a JWT from https://app.pinata.cloud/developers/api-keys\n' +
      '   Usage: PINATA_JWT=<jwt> npx tsx scripts/pinToIpfs.ts\n' +
      '   Dry run: DRY_RUN=true npx tsx scripts/pinToIpfs.ts',
    );
    process.exit(1);
  }

  // ── Load manifest ─────────────────────────────────────────────
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`❌ Manifest not found at: ${MANIFEST_PATH}`);
    process.exit(1);
  }

  const manifest: Manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  const total = manifest.modules.length;

  console.log(`\n⬡ PTB IPFS Pinning Script`);
  console.log(`  Manifest: ${MANIFEST_PATH}`);
  console.log(`  Shards:   ${total}`);
  console.log(`  Mode:     ${DRY_RUN ? 'DRY RUN (no uploads)' : 'LIVE'}`);
  console.log(`  Force:    ${FORCE ? 'yes (re-pin all)' : 'no (skip existing)'}`);
  console.log('');

  let pinned = 0;
  let skipped = 0;
  let failed = 0;

  for (const [i, entry] of manifest.modules.entries()) {
    const prefix = `[${String(i + 1).padStart(2, '0')}/${total}] ${entry.id}`;

    // ── Skip if already pinned ────────────────────────────────
    if (entry.ipfsCid && !FORCE) {
      console.log(`  ${prefix}: ⟳ skipped (CID: ${entry.ipfsCid.slice(0, 16)}…)`);
      skipped += 1;
      continue;
    }

    // ── Resolve shard file path ───────────────────────────────
    // Shard path in manifest is relative to public/, e.g. /training_modules_shards/fitness.json
    const shardRelative = entry.shard.replace(/^\//, '');
    const shardPath = path.resolve(__dirname, '..', 'public', shardRelative);

    if (!fs.existsSync(shardPath)) {
      console.error(`  ${prefix}: ✗ shard file not found at ${shardPath}`);
      failed += 1;
      continue;
    }

    const content = fs.readFileSync(shardPath);
    const filename = path.basename(shardPath);

    // ── Dry run ───────────────────────────────────────────────
    if (DRY_RUN) {
      console.log(`  ${prefix}: ◌ would pin ${filename} (${(content.length / 1024).toFixed(1)} KB)`);
      skipped += 1;
      continue;
    }

    // ── Pin to Pinata ─────────────────────────────────────────
    try {
      const cid = await pinFileToPinata(filename, content);
      entry.ipfsCid = cid;
      pinned += 1;
      console.log(`  ${prefix}: ✓ ${cid}`);
    } catch (err) {
      console.error(`  ${prefix}: ✗ ${err instanceof Error ? err.message : err}`);
      failed += 1;
    }

    // Rate-limit courtesy delay
    if (i < total - 1) {
      await sleep(REQUEST_DELAY);
    }
  }

  // ── Write updated manifest ─────────────────────────────────
  if (!DRY_RUN && pinned > 0) {
    const updated = JSON.stringify(manifest, null, 4);
    fs.writeFileSync(MANIFEST_PATH, updated, 'utf-8');
    console.log(`\n  ✓ Manifest updated: ${MANIFEST_PATH}`);
  }

  // ── Summary ───────────────────────────────────────────────
  console.log(`\n  ─────────────────────────────`);
  console.log(`  Pinned:  ${pinned}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Failed:  ${failed}`);
  console.log(`  ─────────────────────────────`);

  if (failed > 0) {
    process.exit(1);
  }

  if (pinned > 0) {
    console.log('\n  Next step: enable ipfsContent feature flag and deploy.');
    console.log('  The app will now serve shards from IPFS gateways');
    console.log('  with HTTP fallback for maximum resilience.\n');
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
