import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { gzipSizeSync } from 'gzip-size';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = process.env.DIST_DIR ?? path.resolve(__dirname, '..', 'dist');
const OUTPUT_DIR = path.resolve(__dirname, '..', 'artifacts');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'size-report.json');
const TOP_N = Number(process.env.TOP_N ?? 15);

interface AssetEntry {
    file: string;
    size: number;
    gzip: number;
    ext: string;
}

const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    const units = ['KB', 'MB', 'GB'];
    const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length);
    const value = bytes / Math.pow(1024, exponent);
    const unit = exponent === 0 ? 'B' : units[exponent - 1];
    return `${value.toFixed(value >= 100 ? 0 : 2)} ${unit}`;
};

const walkFiles = (dir: string): string[] => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    return entries.flatMap((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return walkFiles(full);
        return [full];
    });
};

const collectAssets = (distDir: string): AssetEntry[] => {
    if (!fs.existsSync(distDir)) {
        throw new Error(`dist directory not found at ${distDir}. Run build first or set DIST_DIR.`);
    }

    const files = walkFiles(distDir).filter((file) => !file.endsWith('.map'));
    return files.map((file) => {
        const buffer = fs.readFileSync(file);
        const size = buffer.length;
    const gzip = gzipSizeSync(buffer);
        return {
            file: path.relative(distDir, file),
            size,
            gzip,
            ext: path.extname(file).replace('.', '') || 'unknown',
        };
    });
};

const summarizeByExt = (assets: AssetEntry[]) => {
    return assets.reduce<Record<string, { size: number; gzip: number; count: number }>>((acc, asset) => {
        const bucket = acc[asset.ext] ?? { size: 0, gzip: 0, count: 0 };
        bucket.size += asset.size;
        bucket.gzip += asset.gzip;
        bucket.count += 1;
        acc[asset.ext] = bucket;
        return acc;
    }, {});
};

const main = () => {
    const assets = collectAssets(DIST_DIR);
    const sorted = [...assets].sort((a, b) => b.size - a.size).slice(0, TOP_N);
    const totals = summarizeByExt(assets);

    console.log(`\nPayload size report (top ${TOP_N}) from: ${DIST_DIR}\n`);
    console.log('File'.padEnd(60), 'Raw'.padEnd(12), 'Gzip'.padEnd(12));
    console.log('-'.repeat(90));
    sorted.forEach((asset) => {
        console.log(
            asset.file.padEnd(60),
            formatBytes(asset.size).padEnd(12),
            formatBytes(asset.gzip).padEnd(12)
        );
    });

    console.log('\nBy extension:');
    Object.entries(totals)
        .sort(([, a], [, b]) => b.size - a.size)
        .forEach(([ext, stats]) => {
            console.log(`${ext.padEnd(8)} count=${String(stats.count).padEnd(4)} raw=${formatBytes(stats.size).padEnd(10)} gzip=${formatBytes(stats.gzip)}`);
        });

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(
        OUTPUT_FILE,
        JSON.stringify(
            {
                generatedAt: new Date().toISOString(),
                distDir: DIST_DIR,
                top: sorted,
                totals,
            },
            null,
            2
        )
    );
    console.log(`\nSaved detailed report to ${OUTPUT_FILE}\n`);
};

main();
