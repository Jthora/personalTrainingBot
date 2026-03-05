import type { TelemetrySchemaDrift } from './telemetryDrift';
import type { TelemetryValidationReport } from './telemetryValidation';

export type SmokeHeadlessReport = {
  ts: string;
  base: string;
  telemetryOut: string;
  telemetryReport: string;
  results: Array<{
    name: string;
    status: 'pass' | 'fail';
    exitCode: number;
    durationMs: number;
  }>;
};

export type TelemetryDriftReport = {
  baselinePath: string;
  eventsPath: string;
  mode: 'initialized' | 'updated' | 'compare';
  driftDetected: boolean;
  drift: TelemetrySchemaDrift;
};

export type TelemetryAuditInput = {
  generatedAt?: string;
  validationPath: string;
  driftPath: string;
  smokePath: string;
  validation: TelemetryValidationReport;
  drift: TelemetryDriftReport;
  smoke?: SmokeHeadlessReport;
};

const formatMs = (durationMs: number): string => {
  if (durationMs < 1000) {
    return `${durationMs}ms`;
  }

  return `${(durationMs / 1000).toFixed(2)}s`;
};

const statusSummary = (input: TelemetryAuditInput): 'pass' | 'fail' => {
  const validationOk = input.validation.issues.length === 0;
  const driftOk = !input.drift.driftDetected;
  const smokeOk = !input.smoke || input.smoke.results.every((result) => result.status === 'pass');
  return validationOk && driftOk && smokeOk ? 'pass' : 'fail';
};

export const buildTelemetryAuditMarkdown = (input: TelemetryAuditInput): string => {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const status = statusSummary(input);
  const validation = input.validation;
  const drift = input.drift;
  const smoke = input.smoke;

  const lines: string[] = [
    '# Telemetry Audit Report',
    '',
    `- Generated: ${generatedAt}`,
    `- Overall status: ${status.toUpperCase()}`,
    `- Validation report: ${input.validationPath}`,
    `- Drift report: ${input.driftPath}`,
    `- Smoke report: ${input.smokePath}`,
    '',
    '## Validation Summary',
    `- Events checked: ${validation.total}`,
    `- Issues found: ${validation.issues.length}`,
  ];

  if (validation.summary.length === 0) {
    lines.push('- Event distribution: none');
  } else {
    lines.push('- Event distribution:');
    validation.summary.forEach(({ key, count }) => {
      lines.push(`  - ${key}: ${count}`);
    });
  }

  if (validation.issues.length > 0) {
    lines.push('', '### Validation Issues');
    validation.issues.forEach((issue) => {
      lines.push(`- Event[${issue.index}] ${issue.problems.join('; ')}`);
    });
  }

  lines.push('', '## Schema Drift Summary', `- Mode: ${drift.mode}`, `- Drift detected: ${drift.driftDetected ? 'yes' : 'no'}`);

  if (!drift.driftDetected) {
    lines.push('- Drift details: none');
  } else {
    if (drift.drift.missingEventKeys.length > 0) {
      lines.push('- Missing event keys:');
      drift.drift.missingEventKeys.forEach((key) => lines.push(`  - ${key}`));
    }
    if (drift.drift.newEventKeys.length > 0) {
      lines.push('- New event keys:');
      drift.drift.newEventKeys.forEach((key) => lines.push(`  - ${key}`));
    }
    if (drift.drift.changedDataKeys.length > 0) {
      lines.push('- Changed payload keys:');
      drift.drift.changedDataKeys.forEach((entry) => {
        lines.push(`  - ${entry.eventKey}`);
        if (entry.missingKeys.length > 0) {
          lines.push(`    - missing: ${entry.missingKeys.join(', ')}`);
        }
        if (entry.newKeys.length > 0) {
          lines.push(`    - new: ${entry.newKeys.join(', ')}`);
        }
      });
    }
  }

  lines.push('', '## Smoke Run Summary');
  if (!smoke) {
    lines.push('- Smoke report unavailable for this run.');
  } else {
    lines.push(`- Base URL: ${smoke.base}`);
    lines.push(`- Steps: ${smoke.results.length}`);
    smoke.results.forEach((result) => {
      lines.push(`  - ${result.status.toUpperCase()} ${result.name} (exit ${result.exitCode}, ${formatMs(result.durationMs)})`);
    });
  }

  lines.push('', '## Reviewer Checklist', '- Confirm validation issues are empty.', '- Confirm drift is expected or baseline was intentionally updated.', '- Confirm smoke steps passed for this run.');

  return `${lines.join('\n')}\n`;
};
