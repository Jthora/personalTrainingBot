import fs from 'fs';
import path from 'path';
import type { TrackedEvent } from '../src/utils/telemetry';
import {
  buildTelemetrySchemaSnapshot,
  diffTelemetrySchemas,
  hasTelemetrySchemaDrift,
  type TelemetrySchemaSnapshot,
} from '../src/utils/telemetryDrift';

const defaultEventsPath = 'artifacts/telemetry-headless.json';
const defaultBaselinePath = 'artifacts/telemetry-schema-baseline.json';
const defaultOutputPath = 'artifacts/telemetry-schema-drift-report.json';

const readJson = <T>(targetPath: string): T => {
  const full = path.resolve(process.cwd(), targetPath);
  const raw = fs.readFileSync(full, 'utf8');
  return JSON.parse(raw) as T;
};

const writeJson = (targetPath: string, value: unknown) => {
  const full = path.resolve(process.cwd(), targetPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(value, null, 2), 'utf8');
};

function main() {
  const eventsPath = process.argv[2] ?? defaultEventsPath;
  const baselinePath = process.argv[3] ?? defaultBaselinePath;
  const outputPath = process.argv[4] ?? defaultOutputPath;
  const updateBaseline = process.argv.includes('--update-baseline');

  let events: TrackedEvent[] = [];
  try {
    events = readJson<TrackedEvent[]>(eventsPath);
    if (!Array.isArray(events)) {
      throw new Error('Telemetry events input must be an array');
    }
  } catch (error) {
    console.error(`[telemetry-drift] Failed to read events: ${(error as Error).message}`);
    process.exitCode = 1;
    return;
  }

  const current = buildTelemetrySchemaSnapshot(events);

  let baseline: TelemetrySchemaSnapshot | null = null;
  try {
    baseline = readJson<TelemetrySchemaSnapshot>(baselinePath);
  } catch {
    baseline = null;
  }

  if (!baseline || updateBaseline) {
    writeJson(baselinePath, current);
    const report = {
      baselinePath,
      eventsPath,
      mode: baseline ? 'updated' : 'initialized',
      driftDetected: false,
      drift: { missingEventKeys: [], newEventKeys: [], changedDataKeys: [] },
    };
    writeJson(outputPath, report);
    console.info(`[telemetry-drift] ${baseline ? 'Updated' : 'Initialized'} baseline at ${baselinePath}`);
    return;
  }

  const drift = diffTelemetrySchemas(baseline, current);
  const driftDetected = hasTelemetrySchemaDrift(drift);

  const report = {
    baselinePath,
    eventsPath,
    mode: 'compare',
    driftDetected,
    drift,
  };
  writeJson(outputPath, report);
  console.info(`[telemetry-drift] Wrote drift report to ${outputPath}`);

  if (!driftDetected) {
    console.info('[telemetry-drift] No schema drift detected');
    return;
  }

  console.error('[telemetry-drift] Schema drift detected');
  process.exitCode = 1;
}

main();
