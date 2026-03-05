import fs from 'node:fs';
import path from 'node:path';
import { buildTelemetryAuditMarkdown, type SmokeHeadlessReport, type TelemetryDriftReport } from '../src/utils/telemetryAuditReport';
import type { TelemetryValidationReport } from '../src/utils/telemetryValidation';

const resolveFromCwd = (targetPath: string): string => path.resolve(process.cwd(), targetPath);

const readJson = <T>(targetPath: string): T => {
  const full = resolveFromCwd(targetPath);
  const raw = fs.readFileSync(full, 'utf8');
  return JSON.parse(raw) as T;
};

const writeText = (targetPath: string, value: string) => {
  const full = resolveFromCwd(targetPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, value, 'utf8');
};

function main() {
  const validationPath = process.argv[2] ?? process.env.TELEMETRY_REPORT ?? 'artifacts/telemetry-validate-report.json';
  const driftPath = process.argv[3] ?? process.env.TELEMETRY_DRIFT_REPORT ?? 'artifacts/telemetry-schema-drift-report.json';
  const smokePath = process.argv[4] ?? process.env.SMOKE_REPORT ?? 'artifacts/smoke-headless-report.json';
  const outputPath = process.argv[5] ?? process.env.TELEMETRY_AUDIT_OUT ?? 'artifacts/telemetry-audit-report.md';

  let validation: TelemetryValidationReport;
  let drift: TelemetryDriftReport;
  let smoke: SmokeHeadlessReport | undefined;

  try {
    validation = readJson<TelemetryValidationReport>(validationPath);
    drift = readJson<TelemetryDriftReport>(driftPath);
  } catch (error) {
    console.error(`[telemetry-audit] Failed to read validation/drift report: ${(error as Error).message}`);
    process.exitCode = 1;
    return;
  }

  try {
    smoke = readJson<SmokeHeadlessReport>(smokePath);
  } catch {
    smoke = undefined;
  }

  const markdown = buildTelemetryAuditMarkdown({
    validationPath,
    driftPath,
    smokePath,
    validation,
    drift,
    smoke,
  });

  try {
    writeText(outputPath, markdown);
    console.info(`[telemetry-audit] wrote report to ${outputPath}`);
  } catch (error) {
    console.error(`[telemetry-audit] Failed to write report: ${(error as Error).message}`);
    process.exitCode = 1;
  }
}

main();
