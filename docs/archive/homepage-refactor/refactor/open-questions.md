# Open Questions (with proposed resolutions)

- Focus mode URL: prefer /home/plan?mode=focus (flat IA); /home/plan/focus not needed unless embedding Training fully.
- Plan vs Training: keep Training at /training for execution; Plan can expose a focus toggle that routes there. Embedding is optional and heavier.
- CardProvider state persistence: persist dealt cards across tab switches; do not reset on re-entry unless user regenerates.
- Web3/profile placement: move into Settings tab; leave a lightweight status/icon in header only if discoverability suffers.
- Alignment chip: primary home is Coach page; optional small echo in Plan. Avoid header duplication.
- Up Next outside Plan: avoid duplicates; keep Up Next solely on Plan (and within Training as execution context).
- Visual refresh scope: structural refactor first; only light theming tweaks unless time permits.
