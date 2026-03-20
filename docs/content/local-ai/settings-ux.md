# Settings UX Principles

> OPSEC warnings as first-class UI. Absence of cloud option as a trust signal.

---

## Design Doctrine

This application is used by cadets studying self-sovereignty, operational security, and counter-psyops. The settings interface must practice what the curriculum teaches. A settings panel that offers cloud AI integration would be a cognitive dissonance event: the app teaching OPSEC while simultaneously routing cadet data to US cloud infrastructure.

The design principle: **the absence of cloud options is itself a trust signal**. It is not a missing feature. It should be communicated as an active choice.

---

## What a Settings Interface Is Not

The following features do not belong in any settings interface for this application:

- Groq API key input
- Gemini API key input
- OpenAI API key input
- Any "AI enhancement" toggle that routes to external APIs
- "Premium" tier that enables cloud AI

These are not product decisions — they are doctrine violations. If a product roadmap ever includes them, that roadmap is wrong.

---

## What a Settings Interface Can Include

Settings that are appropriate:

| Setting | Type | Doctrine alignment |
|---------|------|--------------------|
| Ollama URL | Text input | Local-only. User controls the endpoint. |
| Enable Ollama features | Toggle, default OFF | Explicit opt-in for users with local setup |
| Data export (all card data) | Action | Self-sovereignty — full data portability |
| Clear all progress | Action | Self-sovereignty — full data deletion |
| Offline mode indicator | Display | Confirm PWA is functioning correctly |

---

## Ollama Settings UX (If Implemented)

If Ollama runtime features are ever built into the app (not currently planned), the settings entry point must:

### 1. Lead with the OPSEC framing

```
Local AI (Ollama)
────────────────────────────────────────────────
This feature works only with Ollama running on
your local machine. No data is sent to any
external server. This is by design.

Cloud AI services are not offered. Using cloud
services for training content routes your study
data through corporate infrastructure subject to
legal compulsion and data retention policies.
If you want to understand why, see the
self_sovereignty module.
```

### 2. Link to the setup instructions

The settings panel should link directly to the Ollama setup documentation. Users who don't know what Ollama is should be able to get set up.

### 3. Test connection inline

```
Ollama URL: [ http://localhost:11434        ]

[ Test Connection ]

 ● Connected — llama3.2 available
```

Connection test is a simple `GET /api/tags`. Display the available models on success. Display a clear error and a link to `ollama serve` documentation on failure.

### 4. Default OFF, stay off

The toggle defaults to OFF. When the user enables it, they should see a single confirmation:

```
Enable local AI features?

Ollama will be used to enhance card hints and
explanations. This works offline. No data is
sent externally.

[ Enable ]  [ Cancel ]
```

No repeated confirmation on subsequent sessions.

---

## OPSEC Warning Language

When OPSEC-adjacent settings are present, the warning language should be:

- Direct, not alarmist — state the fact, not the fear
- Specific, not generic — name what the risk actually is
- Actionable — give the user something to do about it
- Non-coercive — warn, do not prevent

**Good**: "This feature requires a network connection. Your card data will be sent to the Ollama server at the URL you specify."

**Bad**: "⚠️ WARNING: This feature may compromise your privacy and security. Use at your own risk."

The first is informative. The second is vague theater that trains users to ignore warnings.

---

## Accessibility

All settings controls:
- Keyboard navigable (Tab sequence, Enter/Space activation)
- Screen-reader labeled with descriptive text (not just icon labels)
- Color-independent status indication (connection status uses text + icon, not color alone)
- Confirmation dialogs focusable and dismissible with Escape
