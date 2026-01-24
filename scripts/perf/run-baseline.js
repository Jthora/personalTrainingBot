#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { launch as launchChrome } from 'chrome-launcher';
import CDP from 'chrome-remote-interface';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRESETS = {
    android4g: {
        title: 'Mid-tier Android 4G',
        downloadThroughput: 1.5 * 1024 * 1024 / 8, // Mbps → bytes per second
        uploadThroughput: 750 * 1024 / 8,
        latency: 300,
    },
    desktopWifi: {
        title: 'Desktop WiFi',
        downloadThroughput: 40 * 1024 * 1024 / 8,
        uploadThroughput: 10 * 1024 * 1024 / 8,
        latency: 20,
    },
};

const STORAGE_MASK = ['all'];

const defaultUrl = process.env.PERF_URL || 'http://localhost:5173/';
const outDir = path.resolve(__dirname, '../../artifacts/perf');
const runId = new Date().toISOString().replace(/[:.]/g, '-');

async function resolveChromePath() {
    if (process.env.CHROME_PATH) {
        return process.env.CHROME_PATH;
    }
    try {
        const puppeteer = await import('puppeteer');
        const candidate = puppeteer.executablePath();
        if (candidate && candidate !== 'unknown') {
            return candidate;
        }
    } catch (error) {
        console.warn('Failed to resolve Chrome via puppeteer, falling back to default lookup', error.message || error);
    }
    return null;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function capturePass({ client, url, label, clearStorage }) {
    const { Network, Page, Storage } = client;

    const inflight = new Map();
    const resourceTotals = {
        totalRequests: 0,
        totalTransfer: 0,
        totalEncoded: 0,
        totalDecoded: 0,
        totalDuration: 0,
        byInitiator: {},
    };

    const onRequestWillBeSent = (params) => {
        const initiatorType = params.initiator?.type || 'other';
        inflight.set(params.requestId, { initiatorType, startTime: params.timestamp });
        resourceTotals.totalRequests += 1;
        resourceTotals.byInitiator[initiatorType] = (resourceTotals.byInitiator[initiatorType] || 0) + 1;
    };

    const onResponseReceived = (params) => {
        const entry = inflight.get(params.requestId);
        if (!entry) return;

        const encodedHeader = params.response.encodedDataLength || 0;
        const contentLengthHeader = params.response.headers['content-length'] || params.response.headers['Content-Length'];
        const contentLength = Number(contentLengthHeader);
        if (!Number.isNaN(contentLength)) {
            entry.encodedBodySize = contentLength;
            entry.decodedBodySize = contentLength;
        }
        entry.encodedBodySize = entry.encodedBodySize || encodedHeader;
    };

    const onLoadingFinished = (params) => {
        const entry = inflight.get(params.requestId);
        const transferSize = params.encodedDataLength || 0;
        const durationMs = entry?.startTime ? (params.timestamp - entry.startTime) * 1000 : 0;

        resourceTotals.totalTransfer += transferSize;
        resourceTotals.totalEncoded += entry?.encodedBodySize || transferSize;
        resourceTotals.totalDecoded += entry?.decodedBodySize || entry?.encodedBodySize || transferSize;
        resourceTotals.totalDuration += durationMs;

        inflight.delete(params.requestId);
    };

    const onLoadingFailed = (params) => {
        inflight.delete(params.requestId);
    };

    client.on('Network.requestWillBeSent', onRequestWillBeSent);
    client.on('Network.responseReceived', onResponseReceived);
    client.on('Network.loadingFinished', onLoadingFinished);
    client.on('Network.loadingFailed', onLoadingFailed);

    if (clearStorage) {
        try {
            await Storage.clearDataForOrigin({ origin: new URL(url).origin, storageTypes: STORAGE_MASK.join(',') });
        } catch (error) {
            console.warn('Failed to clear storage', error);
        }
    }

    await Page.addScriptToEvaluateOnNewDocument({
        source: "window.localStorage.setItem('featureFlagOverrides', JSON.stringify({ performanceInstrumentation: true }));",
    });

    await Page.navigate({ url });
    await Page.loadEventFired();

    // Allow app to finish idle warm timers.
    await sleep(3000);

    const { result } = await client.Runtime.evaluate({
        expression: `(() => {
            const marks = performance.getEntriesByType('mark').map(m => ({ type: 'mark', name: m.name, startTime: m.startTime }));
            const measures = performance.getEntriesByType('measure').map(m => ({ type: 'timing', name: m.name, value: m.duration }));
            return [
                ...marks,
                ...measures,
            ];
        })()`,
        returnByValue: true,
    });

    const events = result.value || [];
    events.push({ type: 'resource-summary', name: 'resource-summary', value: resourceTotals });

    client.removeListener('Network.requestWillBeSent', onRequestWillBeSent);
    client.removeListener('Network.responseReceived', onResponseReceived);
    client.removeListener('Network.loadingFinished', onLoadingFinished);
    client.removeListener('Network.loadingFailed', onLoadingFailed);
    const filePath = path.join(outDir, `${runId}-${label}.json`);
    fs.writeFileSync(filePath, JSON.stringify(events, null, 2));
    console.log(`Saved ${events.length} entries to ${filePath}`);
    return { events, filePath };
}

async function runSequence({ presetKey, url, samples, warm }) {
    const preset = PRESETS[presetKey];
    if (!preset) throw new Error(`Unknown preset ${presetKey}`);

    console.log(`Launching Chrome for ${preset.title} (${warm ? 'warm' : 'cold'})`);
    const chromePath = await resolveChromePath();
    const chrome = await launchChrome({ chromeFlags: ['--headless=new'], chromePath });
    const client = await CDP({ port: chrome.port });
    const { Network, Page, Emulation } = client;

    await Promise.all([
        Network.enable(),
        Page.enable(),
    ]);

    await Network.setCacheDisabled({ cacheDisabled: !warm });

    await Network.emulateNetworkConditions({
        offline: false,
        downloadThroughput: preset.downloadThroughput,
        uploadThroughput: preset.uploadThroughput,
        latency: preset.latency,
    });

    await Emulation.setCPUThrottlingRate({ rate: presetKey === 'android4g' ? 4 : 1.5 });

    const labelBase = `${presetKey}-${warm ? 'warm' : 'cold'}`;
    const results = [];
    for (let i = 0; i < samples; i += 1) {
        const label = `${labelBase}-run${i + 1}`;
        results.push(await capturePass({ client, url, label, clearStorage: !warm }));
    }

    await client.close();
    await chrome.kill();
    return results;
}

function parseArgs() {
    const args = process.argv.slice(2);
    const options = { preset: 'android4g', samples: 3, warm: false, url: defaultUrl };
    for (let i = 0; i < args.length; i += 1) {
        const arg = args[i];
        if (arg === '--preset') options.preset = args[i + 1];
        if (arg === '--samples') options.samples = Number(args[i + 1]);
        if (arg === '--warm') options.warm = true;
        if (arg === '--url') options.url = args[i + 1];
    }
    return options;
}

async function main() {
    const { preset, samples, warm, url } = parseArgs();
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }
    try {
        await runSequence({ presetKey: preset, url, samples, warm });
        console.log('Done');
    } catch (error) {
        console.error('Perf capture failed', error);
        process.exitCode = 1;
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
