# Local AI — OPSEC Doctrine

> No cloud. No API keys. No telemetry. If AI runs, it runs on your machine.

---

## The Doctrine

AI assistance for content generation is a developer tool. It runs on the developer's machine during the build process. It never runs on a cadet's device. It never sends content to external servers.

If runtime AI is ever required (not currently planned), the only acceptable implementation is Ollama running on localhost. Groq, Gemini, OpenAI, Anthropic, and any other cloud API are off the table — not because they are technically unavailable, but because offering them to cadets:

1. Routes cadet training content through US cloud infrastructure subject to legal compulsion
2. Creates API key dependency that centralizes control and creates single points of failure
3. Teaches cadets that cloud services are trustworthy by normalizing their use in a sovereignty context
4. Contradicts the `self_sovereignty` module — which explicitly covers why third-party platforms undermine sovereign identity

### The BYOK Trap

"Bring Your Own Key" panels — letting cadets input their own Groq or Gemini API keys — appear to solve the problem. They do not. They require cadets to hold API credentials, route private training data through cloud infrastructure, and depend on continued account status with a corporate provider. BYOK is scope creep that violates doctrine while appearing to respect it.

### What Offline Means

"Offline-first" in this codebase means the PWA works with no network connection. It does not mean "works with only your local network." The distinction matters: a feature that requires Ollama on localhost is not offline-first — it requires a specific technical environment. Most cadets will not have Ollama running. Most cadets should not need it.

---

## Architecture Boundary

```
Developer machine (build time)
  ├── generateContent.ts → Groq/Gemini (cloud, ephemeral, never committed)
  └── computeSemanticLinks.ts → TF-IDF (local, no network)

Deployed PWA (cadet device, fully offline)
  ├── Training shard data (static, committed, auditable)
  ├── relatedCards (precomputed, no runtime computation)
  └── NO AI → NO network → NO external dependency
```

If Ollama integration is ever added, it lives entirely in `generateContent.ts` as a third backend option. It never becomes a user-facing feature.

---

## Related Documents

- [Ollama integration specification](./ollama-integration.md) — how to add Ollama as a `--backend=ollama` option in generateContent.ts
- [Settings UX principles](./settings-ux.md) — how OPSEC doctrine shapes any settings interface
