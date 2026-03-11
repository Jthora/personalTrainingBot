/**
 * archetypeHints — per-archetype context hints that flavor the Operator Assistant
 * panel on each mission surface. Returns undefined for unknown archetypes so the
 * caller can fall back to default hints.
 */


export type ArchetypeHintSet = {
    contextHint: string;
    nextActionHint: string;
};

type MissionStep = '/mission/brief' | '/mission/triage' | '/mission/case' | '/mission/signal' | '/mission/checklist' | '/mission/debrief';

const hintsByArchetype: Record<string, Record<MissionStep, ArchetypeHintSet>> = {
    rescue_ranger: {
        '/mission/brief': { contextHint: 'Focus on extraction routes, civilian headcount, and hazard perimeter.', nextActionHint: 'Confirm extraction readiness, then move to Triage.' },
        '/mission/triage': { contextHint: 'Prioritize casualties and time-critical hazards before secondary signals.', nextActionHint: 'Stabilize the most critical leads, then advance to Case.' },
        '/mission/case': { contextHint: 'Cross-reference field evidence with medical/hazard intel before promoting findings.', nextActionHint: 'Validate all evidence chains before moving to Signal.' },
        '/mission/signal': { contextHint: 'Keep rescue channels clear — resolve or escalate each signal with explicit rationale.', nextActionHint: 'Ensure signal actions map to extraction timelines, then proceed to Checklist.' },
        '/mission/checklist': { contextHint: 'Execute field drills in triage priority order. Record every outcome immediately.', nextActionHint: 'After all checklist items are captured, proceed to Debrief.' },
        '/mission/debrief': { contextHint: 'Capture extraction outcomes, lessons learned, and readiness impact for the next response cycle.', nextActionHint: 'Document casualty outcomes and close the mission cycle.' },
    },
    cyber_sentinel: {
        '/mission/brief': { contextHint: 'Map the attack surface, identify IOCs, and set containment thresholds.', nextActionHint: 'Lock down scope and constraints before Triage.' },
        '/mission/triage': { contextHint: 'Isolate confirmed compromise indicators before investigating lower-confidence signals.', nextActionHint: 'When critical IOCs are triaged, advance to Case.' },
        '/mission/case': { contextHint: 'Chain forensic artifacts to attacker TTPs. Avoid assumptions without log evidence.', nextActionHint: 'When artifact chains are solid, move to Signal.' },
        '/mission/signal': { contextHint: 'Cross-check alert telemetry with case evidence. Resolve false positives quickly.', nextActionHint: 'When all signals are actioned, proceed to Checklist.' },
        '/mission/checklist': { contextHint: 'Execute security drills methodically. Record all pass/fail outcomes for the audit trail.', nextActionHint: 'After drills are complete, proceed to Debrief.' },
        '/mission/debrief': { contextHint: 'Capture incident response metrics, detection gaps, and hardening recommendations.', nextActionHint: 'Finalize the AAR and close the incident.' },
    },
    psi_operative: {
        '/mission/brief': { contextHint: 'Center awareness, scan for psionic interference patterns, and set intention thresholds.', nextActionHint: 'When intention and constraints are anchored, move to Triage.' },
        '/mission/triage': { contextHint: 'Filter psychic noise from genuine signals. Prioritize high-resonance leads.', nextActionHint: 'Once the signal field is stable, advance to Case.' },
        '/mission/case': { contextHint: 'Ground every insight with traceable evidence. Avoid unverified intuitive leaps.', nextActionHint: 'When findings have artifact backing, move to Signal.' },
        '/mission/signal': { contextHint: 'Align signal resolution with consciousness defense protocols.', nextActionHint: 'Clear all active signals, then proceed to Checklist.' },
        '/mission/checklist': { contextHint: 'Execute psionic combat drills with full presence. Record all shifts in state.', nextActionHint: 'After drills are captured, proceed to Debrief.' },
        '/mission/debrief': { contextHint: 'Document consciousness shifts, lesson patterns, and sovereignty gains.', nextActionHint: 'Close the cycle and prepare for the next operational briefing.' },
    },
    shadow_agent: {
        '/mission/brief': { contextHint: 'Identify operational cover, insertion vectors, and exfiltration contingencies.', nextActionHint: 'Confirm cover identities and move to Triage.' },
        '/mission/triage': { contextHint: 'Separate actionable HUMINT from noise. Prioritize time-sensitive intelligence.', nextActionHint: 'When intelligence feeds are stable, advance to Case.' },
        '/mission/case': { contextHint: 'Build the intelligence picture layer by layer. Verify every source chain.', nextActionHint: 'When the case is watertight, move to Signal.' },
        '/mission/signal': { contextHint: 'React to counter-intelligence triggers with measured, pre-planned responses.', nextActionHint: 'Resolve all signal threats, then proceed to Checklist.' },
        '/mission/checklist': { contextHint: 'Execute tradecraft drills under cover discipline. No operational signature.', nextActionHint: 'After drills are clean, proceed to Debrief.' },
        '/mission/debrief': { contextHint: 'Capture tradecraft lessons, blown cover risks, and network integrity status.', nextActionHint: 'Sanitize and close the operation file.' },
    },
    cosmic_engineer: {
        '/mission/brief': { contextHint: 'Map the frequency landscape, identify code vectors, and set quantum bounds.', nextActionHint: 'Define engineering scope, then move to Triage.' },
        '/mission/triage': { contextHint: 'Prioritize system anomalies and entropy spikes. Isolate root oscillations.', nextActionHint: 'When anomalies are categorized, advance to Case.' },
        '/mission/case': { contextHint: 'Trace equations through artifact chains. Validate with frequency analysis.', nextActionHint: 'When proofs are sound, move to Signal.' },
        '/mission/signal': { contextHint: 'Resolve signal imbalances with calibrated algorithmic responses.', nextActionHint: 'When all signals are tuned, proceed to Checklist.' },
        '/mission/checklist': { contextHint: 'Execute engineering drills with mathematical precision. Record all outputs.', nextActionHint: 'After drills complete, proceed to Debrief.' },
        '/mission/debrief': { contextHint: 'Document frequency shifts, code breakthroughs, and system optimizations.', nextActionHint: 'Compile the engineering log and close the cycle.' },
    },
    tactical_guardian: {
        '/mission/brief': { contextHint: 'Assess terrain, force disposition, and defensive perimeters.', nextActionHint: 'Confirm tactical readiness before moving to Triage.' },
        '/mission/triage': { contextHint: 'Prioritize immediate combat threats over secondary logistics.', nextActionHint: 'When threats are ranked, advance to Case.' },
        '/mission/case': { contextHint: 'Build the tactical picture from field evidence. Verify weapon effects and positioning.', nextActionHint: 'When evidence is confirmed, move to Signal.' },
        '/mission/signal': { contextHint: 'React to battlefield signals with pre-drilled responses. Maintain formation.', nextActionHint: 'After signal actions, proceed to Checklist.' },
        '/mission/checklist': { contextHint: 'Execute combat drills with full intensity. Record every rep and outcome.', nextActionHint: 'After drills, proceed to Debrief.' },
        '/mission/debrief': { contextHint: 'Capture combat lessons, conditioning gaps, and operational readiness.', nextActionHint: 'Close the tactical cycle and prepare for next briefing.' },
    },
    star_commander: {
        '/mission/brief': { contextHint: 'Review orbital parameters, fleet disposition, and contingency corridors.', nextActionHint: 'Confirm formation readiness before moving to Triage.' },
        '/mission/triage': { contextHint: 'Prioritize conjunction alerts and degraded sensor warnings before routine items.', nextActionHint: 'When critical space threats are triaged, advance to Case.' },
        '/mission/case': { contextHint: 'Validate orbital predictions against sensor data. No assumptions without telemetry.', nextActionHint: 'When the case is confirmed, move to Signal.' },
        '/mission/signal': { contextHint: 'Execute signal protocols per battle rhythm. Maintain comms discipline.', nextActionHint: 'When all signals are resolved, proceed to Checklist.' },
        '/mission/checklist': { contextHint: 'Execute zero-G conditioning drills at operational tempo. Record every metric.', nextActionHint: 'After drills, proceed to Debrief.' },
        '/mission/debrief': { contextHint: 'Capture fleet readiness, crew status, and contingency gaps for the next watch.', nextActionHint: 'File the watch report and rotate.' },
    },
    field_scholar: {
        '/mission/brief': { contextHint: 'Identify the knowledge domain, manipulation vectors, and truth thresholds.', nextActionHint: 'Set research scope, then move to Triage.' },
        '/mission/triage': { contextHint: 'Separate genuine evidence from disinformation. Prioritize source integrity.', nextActionHint: 'When sources are verified, advance to Case.' },
        '/mission/case': { contextHint: 'Build the knowledge case from primary sources. Cross-reference every claim.', nextActionHint: 'When the case is documented, move to Signal.' },
        '/mission/signal': { contextHint: 'Respond to counter-narrative signals with evidence-backed corrections.', nextActionHint: 'When all signals are addressed, proceed to Checklist.' },
        '/mission/checklist': { contextHint: 'Execute research drills thoroughly. Record all findings and counter-arguments.', nextActionHint: 'After drills, proceed to Debrief.' },
        '/mission/debrief': { contextHint: 'Document truth preservation outcomes, sovereignty gains, and research gaps.', nextActionHint: 'Archive findings and close the research cycle.' },
    },
};

/**
 * Returns archetype-specific hints for a given mission step, or undefined if
 * no custom hints exist (caller should fall back to defaults).
 */
export const getArchetypeHints = (
    archetypeId: string,
    step: string,
): ArchetypeHintSet | undefined => {
    const byStep = hintsByArchetype[archetypeId];
    if (!byStep) return undefined;
    return byStep[step as MissionStep];
};
