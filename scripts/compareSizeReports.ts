import fs from 'fs';

interface AssetEntry {
    file: string;
    size: number;
    gzip: number;
    ext: string;
}

interface SizeReport {
    generatedAt: string;
    distDir: string;
    top: AssetEntry[];
    totals: Record<string, { size: number; gzip: number; count: number }>;
}

const loadReport = (path: string): SizeReport => {
    const raw = fs.readFileSync(path, 'utf8');
    return JSON.parse(raw) as SizeReport;
};

const toMap = (assets: AssetEntry[]): Map<string, AssetEntry> => {
    const map = new Map<string, AssetEntry>();
    assets.forEach((asset) => map.set(asset.file, asset));
    return map;
};

const formatKb = (bytes: number | undefined): string => {
    if (bytes === undefined || Number.isNaN(bytes)) return '';
    return `${(bytes / 1024).toFixed(1)} KB`;
};

const compareAssets = (base: AssetEntry[], current: AssetEntry[]) => {
    const baseMap = toMap(base);
    const currMap = toMap(current);
    const keys = new Set<string>([...baseMap.keys(), ...currMap.keys()]);

    return Array.from(keys).map((file) => {
        const b = baseMap.get(file);
        const c = currMap.get(file);
        const rawDelta = (c?.size ?? 0) - (b?.size ?? 0);
        const gzipDelta = (c?.gzip ?? 0) - (b?.gzip ?? 0);
        return {
            file,
            baseRaw: b?.size ?? null,
            currRaw: c?.size ?? null,
            rawDelta,
            baseGzip: b?.gzip ?? null,
            currGzip: c?.gzip ?? null,
            gzipDelta,
        };
    });
};

const main = () => {
    const [baselinePath, currentPath] = process.argv.slice(2);
    if (!baselinePath || !currentPath) {
        console.error('Usage: npx tsx scripts/compareSizeReports.ts <baseline.json> <current.json>');
        process.exit(1);
    }

    const baseline = loadReport(baselinePath);
    const current = loadReport(currentPath);
    const rows = compareAssets(baseline.top, current.top)
        .sort((a, b) => Math.abs((b.gzipDelta ?? 0)) - Math.abs((a.gzipDelta ?? 0)))
        .slice(0, 15);

    console.log(`Baseline: ${baseline.generatedAt}`);
    console.log(`Current : ${current.generatedAt}`);
    console.log('\nTop deltas (by gzip, top 15):');
    console.table(rows.map((row) => ({
        file: row.file,
        baseRaw: formatKb(row.baseRaw ?? undefined),
        currRaw: formatKb(row.currRaw ?? undefined),
        rawDelta: formatKb(row.rawDelta ?? undefined),
        baseGzip: formatKb(row.baseGzip ?? undefined),
        currGzip: formatKb(row.currGzip ?? undefined),
        gzipDelta: formatKb(row.gzipDelta ?? undefined),
    })));
};

main();
