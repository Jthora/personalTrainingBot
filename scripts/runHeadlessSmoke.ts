#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

type Step = {
  name: string;
  cmd: string[];
  env?: NodeJS.ProcessEnv;
};

type StepResult = {
  name: string;
  status: 'pass' | 'fail';
  exitCode: number;
  durationMs: number;
};

function runStep(step: Step): Promise<{ exitCode: number; durationMs: number }> {
  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(step.cmd[0], step.cmd.slice(1), {
      stdio: 'inherit',
      env: { ...process.env, ...step.env },
    });

    child.on('error', (err) => {
      console.error(`[smoke] spawn error for ${step.name}: ${err.message}`);
      resolve({ exitCode: 1, durationMs: Date.now() - started });
    });

    child.on('close', (code) => {
      resolve({ exitCode: code ?? 1, durationMs: Date.now() - started });
    });
  });
}

function writeReport(reportPath: string, summary: unknown) {
  try {
    const full = path.resolve(process.cwd(), reportPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, JSON.stringify(summary, null, 2), 'utf8');
    console.info(`[smoke] wrote report to ${full}`);
  } catch (err) {
    console.warn(`[smoke] failed to write report: ${(err as Error).message}`);
  }
}

async function main() {
  const base = process.env.BASE_URL ?? 'http://localhost:4173';
  const telemetryOut = process.env.TELEMETRY_OUT ?? 'artifacts/telemetry-headless.json';
  const telemetryReport = process.env.TELEMETRY_REPORT ?? 'artifacts/telemetry-validate-report.json';
  const telemetryBaseline = process.env.TELEMETRY_BASELINE ?? 'artifacts/telemetry-schema-baseline.json';
  const telemetryDriftReport = process.env.TELEMETRY_DRIFT_REPORT ?? 'artifacts/telemetry-schema-drift-report.json';
  const telemetryAuditReport = process.env.TELEMETRY_AUDIT_OUT ?? 'artifacts/telemetry-audit-report.md';
  const smokeReport = process.env.SMOKE_REPORT ?? 'artifacts/smoke-headless-report.json';
  const scenarioReport = process.env.SCENARIO_REPORT ?? 'artifacts/psi-operative-scenario-report.json';

  const steps: Step[] = [
    { name: 'Deep links (online)', cmd: ['npx', 'tsx', 'scripts/checkDeepLinks.ts', `--base=${base}`] },
    { name: 'Deep links (offline cached)', cmd: ['npx', 'tsx', 'scripts/checkDeepLinksOffline.ts', `--base=${base}`] },
    { name: 'Offline critical path', cmd: ['npx', 'tsx', 'scripts/checkOfflineCriticalPath.ts', `--base=${base}`] },
    { name: 'Offline recovery checks', cmd: ['npx', 'tsx', 'scripts/checkOfflineRecovery.ts', `--base=${base}`] },
    {
      name: 'Mission route payload report',
      cmd: ['npx', 'tsx', 'scripts/reportMissionRoutePayloads.ts', `--base=${base}`, '--output=artifacts/mission-route-payload-report.json'],
    },
    { name: 'Mission route payload budgets', cmd: ['npx', 'tsx', 'scripts/checkMissionRouteBudgets.ts', 'artifacts/mission-route-payload-report.json'] },
    {
      name: 'Mission render profile',
      cmd: ['npx', 'tsx', 'scripts/profileMissionRenderCycles.ts', `--base=${base}`, '--output=artifacts/mission-render-profile-report.json'],
    },
    {
      name: 'Psi Operative end-to-end scenario',
      cmd: ['npx', 'tsx', 'scripts/runPsiOperativeScenario.ts', `--base=${base}`, `--report=${scenarioReport}`],
    },
    { name: 'Telemetry trigger', cmd: ['npx', 'tsx', 'scripts/triggerTelemetryFlows.ts'], env: { BASE_URL: base, TELEMETRY_OUT: telemetryOut } },
    { name: 'Telemetry validation', cmd: ['npx', 'tsx', 'scripts/validateTelemetryEvents.ts', telemetryOut, telemetryReport] },
    {
      name: 'Telemetry schema drift',
      cmd: ['npx', 'tsx', 'scripts/checkTelemetrySchemaDrift.ts', telemetryOut, telemetryBaseline, telemetryDriftReport],
    },
  ];

  const results: StepResult[] = [];

  for (const step of steps) {
    console.log(`\n[smoke] ${step.name}`);
    const { exitCode, durationMs } = await runStep(step);
    const status: StepResult['status'] = exitCode === 0 ? 'pass' : 'fail';
    results.push({ name: step.name, status, exitCode, durationMs });
    if (status === 'fail') {
      console.error(`[smoke] ${step.name} failed (exit ${exitCode})`);
    }
  }

  const auditStep: Step = {
    name: 'Telemetry audit report',
    cmd: ['npx', 'tsx', 'scripts/generateTelemetryAuditReport.ts', telemetryReport, telemetryDriftReport, smokeReport, telemetryAuditReport],
  };

  writeReport(smokeReport, {
    ts: new Date().toISOString(),
    base,
    telemetryOut,
    scenarioReport,
    telemetryReport,
    telemetryDriftReport,
    telemetryAuditReport,
    results,
  });

  console.log(`\n[smoke] ${auditStep.name}`);
  const auditResult = await runStep(auditStep);
  if (auditResult.exitCode !== 0) {
    console.error(`[smoke] ${auditStep.name} failed (exit ${auditResult.exitCode})`);
    results.push({
      name: auditStep.name,
      status: 'fail',
      exitCode: auditResult.exitCode,
      durationMs: auditResult.durationMs,
    });
  } else {
    results.push({
      name: auditStep.name,
      status: 'pass',
      exitCode: 0,
      durationMs: auditResult.durationMs,
    });
  }

  const failed = results.some((r) => r.status === 'fail');
  writeReport(smokeReport, {
    ts: new Date().toISOString(),
    base,
    telemetryOut,
    scenarioReport,
    telemetryReport,
    telemetryDriftReport,
    telemetryAuditReport,
    results,
  });

  if (failed) {
    console.error('[smoke] failures detected');
    process.exitCode = 1;
  } else {
    console.log('[smoke] suite complete');
  }
}

main();
