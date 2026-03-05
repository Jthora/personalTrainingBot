import { describe, expect, it } from 'vitest';
import { buildTelemetryAuditMarkdown } from '../telemetryAuditReport';

describe('buildTelemetryAuditMarkdown', () => {
  it('renders passing summary sections', () => {
    const markdown = buildTelemetryAuditMarkdown({
      generatedAt: '2026-03-05T00:00:00.000Z',
      validationPath: 'artifacts/telemetry-validate-report.json',
      driftPath: 'artifacts/telemetry-schema-drift-report.json',
      smokePath: 'artifacts/smoke-headless-report.json',
      validation: {
        total: 3,
        summary: [
          { key: 'ia:tab_view', count: 2 },
          { key: 'signals:signal_create', count: 1 },
        ],
        issues: [],
      },
      drift: {
        baselinePath: 'artifacts/telemetry-schema-baseline.json',
        eventsPath: 'artifacts/telemetry-headless.json',
        mode: 'compare',
        driftDetected: false,
        drift: {
          missingEventKeys: [],
          newEventKeys: [],
          changedDataKeys: [],
        },
      },
      smoke: {
        ts: '2026-03-05T00:00:00.000Z',
        base: 'http://localhost:4173',
        telemetryOut: 'artifacts/telemetry-headless.json',
        telemetryReport: 'artifacts/telemetry-validate-report.json',
        results: [
          {
            name: 'Telemetry validation',
            status: 'pass',
            exitCode: 0,
            durationMs: 532,
          },
        ],
      },
    });

    expect(markdown).toContain('Overall status: PASS');
    expect(markdown).toContain('## Validation Summary');
    expect(markdown).toContain('## Schema Drift Summary');
    expect(markdown).toContain('## Smoke Run Summary');
  });

  it('renders failures and drift details', () => {
    const markdown = buildTelemetryAuditMarkdown({
      generatedAt: '2026-03-05T00:00:00.000Z',
      validationPath: 'v.json',
      driftPath: 'd.json',
      smokePath: 's.json',
      validation: {
        total: 1,
        summary: [],
        issues: [{ index: 0, problems: ['Missing data.tab'] }],
      },
      drift: {
        baselinePath: 'b.json',
        eventsPath: 'e.json',
        mode: 'compare',
        driftDetected: true,
        drift: {
          missingEventKeys: ['ia:tab_view'],
          newEventKeys: ['ia:deep_link_load'],
          changedDataKeys: [{ eventKey: 'signals:signal_create', missingKeys: ['role'], newKeys: ['source'] }],
        },
      },
      smoke: {
        ts: '2026-03-05T00:00:00.000Z',
        base: 'http://localhost:4173',
        telemetryOut: 'a.json',
        telemetryReport: 'b.json',
        results: [{ name: 'Telemetry validation', status: 'fail', exitCode: 1, durationMs: 1337 }],
      },
    });

    expect(markdown).toContain('Overall status: FAIL');
    expect(markdown).toContain('### Validation Issues');
    expect(markdown).toContain('Missing event keys:');
    expect(markdown).toContain('Changed payload keys:');
    expect(markdown).toContain('FAIL Telemetry validation');
  });
});
