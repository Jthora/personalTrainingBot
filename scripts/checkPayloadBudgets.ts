import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { gzipSizeSync } from 'gzip-size';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = process.env.DIST_DIR ?? path.resolve(__dirname, '..', 'dist');

interface AssetStat {
    file: string;
    raw: number;
    gzip: number;
}

interface Budget {
    name: string;
    matcher: (asset: AssetStat) => boolean;
    limit: number;
    type: 'gzip' | 'raw';
}

const readAssets = (distDir: string): AssetStat[] => {
    if (!fs.existsSync(distDir)) {
        throw new Error(`dist directory not found at ${distDir}. Run build first or set DIST_DIR.`);
    }
    const walk = (dir: string): string[] => {
        return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
            const full = path.join(dir, entry.name);
            return entry.isDirectory() ? walk(full) : [full];
        });
    };
    return walk(distDir)
        .filter((file) => !file.endsWith('.map'))
        .map((file) => {
            const buf = fs.readFileSync(file);
            return {
                file: path.relative(distDir, file),
                raw: buf.length,
                gzip: gzipSizeSync(buf),
            };
        });
};

const formatKB = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;

const budgets: Budget[] = [
    {
        name: 'training_modules_combined.json (gzip)',
        matcher: (a) => /training_modules_combined.*\.json$/.test(a.file),
        limit: 650 * 1024,
        type: 'gzip',
    },
    {
        name: 'vendor chunk (gzip)',
        matcher: (a) => /vendor-.*\.js$/.test(a.file),
        limit: 180 * 1024,
        type: 'gzip',
    },
    {
        name: 'react-vendor chunk (gzip)',
        matcher: (a) => /react-vendor-.*\.js$/.test(a.file),
        limit: 90 * 1024,
        type: 'gzip',
    },
    {
        name: 'index chunk (gzip)',
        matcher: (a) => /index-.*\.js$/.test(a.file),
        limit: 70 * 1024,
        type: 'gzip',
    },
    {
        name: 'workouts bundle (gzip)',
        matcher: (a) => /workouts-.*\.js$/.test(a.file),
        limit: 130 * 1024,
        type: 'gzip',
    },
    {
        name: 'total JS gzip',
        matcher: (a) => a.file.endsWith('.js'),
        limit: 500 * 1024,
        type: 'gzip',
    },
    {
        name: 'total CSS gzip',
        matcher: (a) => a.file.endsWith('.css'),
        limit: 120 * 1024,
        type: 'gzip',
    },
    {
        name: 'total PNG raw',
        matcher: (a) => a.file.endsWith('.png'),
        limit: 3 * 1024 * 1024,
        type: 'raw',
    },
];

const evaluateBudgets = (assets: AssetStat[]) => {
    const results = budgets.map((budget) => {
        const matched = assets.filter(budget.matcher);
        const total = matched.reduce((sum, a) => sum + (budget.type === 'gzip' ? a.gzip : a.raw), 0);
        const pass = total <= budget.limit;
        return { budget: budget.name, value: total, limit: budget.limit, type: budget.type, pass };
    });

    const failures = results.filter((r) => !r.pass);

    console.log('\nPayload budget check (dist:', DIST_DIR, ')');
    console.log('Budget'.padEnd(40), 'Value'.padEnd(12), 'Limit'.padEnd(12), 'Status');
    console.log('-'.repeat(80));
    results.forEach((r) => {
        const value = formatKB(r.value);
        const limit = formatKB(r.limit);
        const status = r.pass ? 'PASS' : 'FAIL';
        console.log(r.budget.padEnd(40), value.padEnd(12), limit.padEnd(12), status);
    });

    if (failures.length) {
        console.error(`\nBudget check failed for ${failures.length} item(s).`);
        process.exitCode = 1;
    } else {
        console.log('\nAll budgets passed.');
    }
};

const main = () => {
    const assets = readAssets(DIST_DIR);
    evaluateBudgets(assets);
};

main();
