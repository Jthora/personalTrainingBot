# Roles and Permissions (Lightweight)

## Approach
- Role tags (e.g., lead, analyst, trainee) without enforced ACL in the first drop.
- Document assumptions and risks of soft enforcement.

## Assumptions (current drop)
- Signals and AAR entries are local-only; no server-side auth or partitioning.
- Tags communicate intent/context only (view/edit treated the same across roles).
- Offline queue uses shared local storage; any profile on the device can flush it.
- Exports are unencrypted JSON/text; consumers are expected to handle safely.

## Risks and mitigations
- No ACL: cross-role visibility/edit risk on shared devices; short-term mitigation is “single user per device” guidance in release notes.
- Offline queue replay: actions flush in arrival order, not actor-ordered; document that ordering is best-effort and surface last-sync time in UI later.
- Export leakage: exports include role tags and summaries; add warning inline and avoid auto-sharing in this phase.
- Trust boundary: Signals/AAR are not validated against a roster; treat entries as user-authored notes until directory sync exists.
- Future work: add role-scoped views, per-entry ownership metadata, and server-enforced ACL before multi-user rollout.

## Future Considerations
- Audit log, explicit permissions, and sharing scopes.

## Acceptance
- Role tag model documented; UX shows role labels; risk note included and published.
