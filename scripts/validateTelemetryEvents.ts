import fs from 'fs';
import path from 'path';
import { type TrackedEvent } from '../src/utils/telemetry';
import { buildTelemetryValidationReport } from '../src/utils/telemetryValidation';

function readEvents(filePath: string): TrackedEvent[] {
  const full = path.resolve(process.cwd(), filePath);
  const raw = fs.readFileSync(full, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error('Expected top-level array');
    }
    return parsed as TrackedEvent[];
  } catch (err) {
    throw new Error(`Failed to parse JSON: ${(err as Error).message}`);
  }
}

function main() {
  const target = process.argv[2] ?? 'artifacts/telemetry-sample.json';
  const outputPath = process.argv[3];
  let events: TrackedEvent[] = [];
  try {
    events = readEvents(target);
  } catch (err) {
    console.error(`[telemetry-validate] ${String(err)}`);
    process.exitCode = 1;
    return;
  }

  const report = buildTelemetryValidationReport(events);

  if (outputPath) {
    try {
      fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf8');
      console.info(`[telemetry-validate] wrote report to ${outputPath}`);
    } catch (err) {
      console.warn(`[telemetry-validate] failed to write report: ${(err as Error).message}`);
    }
  }

  console.info(`[telemetry-validate] checked ${events.length} event(s)`);
  report.summary.forEach(({ key, count }) => {
    console.info(`  ${key} -> ${count}`);
  });

  if (report.issues.length === 0) {
    console.info('[telemetry-validate] no issues found');
    return;
  }

  console.error(`[telemetry-validate] found ${report.issues.length} event(s) with issues:`);
  report.issues.forEach(({ index, problems }) => {
    console.error(`  [${index}] ${problems.join('; ')}`);
  });
  process.exitCode = 1;
}

main();
