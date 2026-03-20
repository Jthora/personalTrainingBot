/**
 * SOP (Standard Operating Procedure) hints for the Operator Assistant.
 *
 * Each mission route has a set of hints that guide the operative through
 * the current step: what the SOP says, contextual advice, and what to do next.
 */
import type { MissionRoutePath } from '../utils/missionTelemetryContracts';

export type GuidanceMode = 'assist' | 'ops';

export interface SopHint {
  sopPrompt: string;
  contextHint: string;
  nextActionHint: string;
}

export const assistantHints: Partial<Record<MissionRoutePath, SopHint>> = {
  '/mission/brief': {
    sopPrompt: 'SOP: Confirm objective, constraints, and escalation threshold before moving to Triage.',
    contextHint: 'Use Mission Header and Readiness to anchor priorities before acting.',
    nextActionHint: 'When objective and constraints are clear, continue to Triage.',
  },
  '/mission/triage': {
    sopPrompt: 'SOP: Acknowledge critical signals first, then assign/defer lower-priority items.',
    contextHint: 'Keep one primary case in focus to avoid split decision paths.',
    nextActionHint: 'Once triage queue is stable, continue to Case.',
  },
  '/mission/case': {
    sopPrompt: 'SOP: Promote only evidence-backed findings; avoid assumptions without artifacts.',
    contextHint: 'Cross-check Timeline and Artifact List before escalating conclusions.',
    nextActionHint: 'When findings are traceable, continue to Signal.',
  },
  '/mission/signal': {
    sopPrompt: 'SOP: Resolve or escalate each active signal with explicit rationale.',
    contextHint: 'Keep signal actions synchronized with case evidence and mission constraints.',
    nextActionHint: 'When signal actions are clear, continue to Checklist.',
  },
  '/mission/checklist': {
    sopPrompt: 'SOP: Execute checklist in order, recording outcomes and exceptions immediately.',
    contextHint: 'Use drill completion outcomes as direct input to Debrief quality.',
    nextActionHint: 'After execution outcomes are captured, continue to Debrief.',
  },
  '/mission/debrief': {
    sopPrompt: 'SOP: Capture outcomes, lessons learned, and readiness impact before closing cycle.',
    contextHint: 'Ensure unresolved risks are clearly listed for next mission brief.',
    nextActionHint: 'When AAR is complete, start the next mission brief.',
  },
  '/mission/stats': {
    sopPrompt: 'SOP: Review cadet metrics, competency trends, and progress toward next milestone.',
    contextHint: 'Use the dashboard to identify weak competency dimensions and prioritize drills.',
    nextActionHint: 'After reviewing stats, return to Brief to start your next mission cycle.',
  },
  '/mission/plan': {
    sopPrompt: 'SOP: Review weekly training plan, adjust schedule, and confirm upcoming drills.',
    contextHint: 'Use the plan view to see your week at a glance and ensure balanced training load.',
    nextActionHint: 'When your plan is set, head to Checklist to execute today\'s drills.',
  },
  '/mission/training': {
    sopPrompt: 'SOP: Browse training modules, explore card decks, and launch focused drills.',
    contextHint: 'Select modules and decks to tailor your training across 19 operational disciplines.',
    nextActionHint: 'Pick a module or deck and start a training drill to build domain competency.',
  },
};

export const FALLBACK_ROUTE: MissionRoutePath = '/mission/brief';
