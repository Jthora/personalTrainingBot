# Story 1: First Contact

> *A civilian discovers the Training Console. In under 3 minutes, they go from "what is this?" to "I am a Psi Operative in training, mentored by Tara Van Dekar." The app must earn that identity transformation through clear messaging at every step.*

## The Promise

A new person becomes an operative with a real identity — archetype, handler, and training curriculum — through a sequence that feels like induction, not configuration.

## Emotional Arc

| Stage | What the user sees | What they should feel |
|-------|--------------------|-----------------------|
| Welcome overlay | "Train 19 Disciplines. Track Your Growth." | Intrigued — this isn't a generic app |
| "Choose Your Focus First" | Archetype picker with 8 identities | Empowered — picking who they'll become |
| Archetype descriptions | "Psychic combat specialist and counter-psyops agent..." | Immersed — the fiction feels real |
| Handler picker | Handler personality quotes, recommended badge | Mentored — someone is going to guide them |
| Intake panel | "Your Training Hub" — practical, warm | Grounded — the fiction serves real training |
| Brief surface | Archetype name in CTA, weighted kit | Activated — their identity already shapes the experience |

## Preconditions

- **Persona:** `brand-new` (empty localStorage)
- **Starting URL:** `/mission/brief` (entry point)

## Test Checkpoints

### 1.1 — Welcome overlay renders with value-first messaging

```
Navigate to /mission/brief
EXPECT visible: "Train 19 Disciplines. Track Your Growth."
EXPECT visible: "4,300+ training cards"
EXPECT visible: "Smart scheduling"
EXPECT visible: "Works offline"
EXPECT button: "Start Training Now"
EXPECT button: "Choose Your Focus First"
```

**Why this matters:** The first 5 seconds determine if someone stays. The messaging must communicate value (19 disciplines, 4300+ cards, offline) before asking for anything.

### 1.2 — "Choose Your Focus First" opens archetype picker

```
CLICK: "Choose Your Focus First"
EXPECT visible: "Archangel Knights Intake" (eyebrow)
EXPECT visible: "Choose Your Archetype" (title)
EXPECT visible: "Your archetype determines your core training modules"
EXPECT 8 archetype cards visible
EXPECT each card has: icon, name, description text
```

**Why this matters:** The archetype picker is where fiction meets function. Each card must convey a real identity, not just a label.

### 1.3 — Archetype selection shows description and enables confirm

```
CLICK: archetype card "psi_operative" (data-testid="archetype-card-psi_operative")
EXPECT visible: "Psi Operative" selected state
EXPECT visible: "Psychic combat specialist and counter-psyops agent"
EXPECT button enabled: "Confirm Archetype" (data-testid="archetype-confirm")
```

### 1.4 — Confirming archetype opens handler picker with recommendation

```
CLICK: "Confirm Archetype"
EXPECT visible: "Choose Your Handler" (title)
EXPECT visible: handler card for "tara_van_dekar" with recommended badge (data-testid="recommended-badge")
EXPECT visible: handler personality text containing "Rosicrucian" or "Keeper of Forbidden Truth"
EXPECT 5 handler cards visible
```

**Why this matters:** The recommended handler must match the archetype. If a Psi Operative sees Tiger War God recommended, the identity system is broken.

### 1.5 — Confirming handler sets operative profile and shows intake

```
CLICK: handler card "tara_van_dekar"
CLICK: "Confirm Handler" (data-testid="handler-confirm")
EXPECT visible: "Your Training Hub" (intake panel title)
EXPECT visible: "Start with 'Today's Training' on the Brief page"
```

### 1.6 — Completing intake lands on Brief with identity-aware CTA

```
CLICK: "Start Training"
EXPECT URL: /mission/brief
EXPECT visible: TodayLauncher (data-testid="today-launcher")
EXPECT button text contains: "Psi Operative Training" (data-testid="today-launch-btn")
EXPECT visible: archetype kit label "Psi Operative kit" (data-testid="archetype-kit-label")
```

**Why this matters:** This is the payoff. The identity the user just created must immediately shape their experience. If the CTA says generic "Start Today's Training" after they picked Psi Operative, the identity system feels hollow.

### 1.7 — Profile persisted in localStorage

```
READ localStorage: "operative:profile:v1"
EXPECT JSON contains: archetypeId === "psi_operative"
EXPECT JSON contains: handlerId === "tara_van_dekar"
EXPECT JSON contains: enrolledAt is a valid ISO date
```

## Failure Modes This Catches

| Failure | Impact |
|---------|--------|
| Welcome overlay shows blank or broken | First impression destroyed |
| Archetype picker shows fewer than 8 cards | Identity options incomplete |
| Recommended handler doesn't match archetype data | Trust broken — system recommended wrong mentor |
| Profile not persisted after handler confirm | Identity lost on refresh |
| TodayLauncher shows generic CTA after identity setup | Identity feels meaningless |

## Locator Reference

| Element | Locator Strategy |
|---------|------------------|
| Welcome overlay | `role="dialog" [aria-label="Welcome"]` |
| "Choose Your Focus First" | `getByRole('button', { name: /Choose Your Focus First/i })` |
| Archetype picker | `data-testid="archetype-picker"` |
| Archetype card | `data-testid="archetype-card-psi_operative"` |
| Confirm archetype | `data-testid="archetype-confirm"` |
| Handler picker | `data-testid="handler-picker"` |
| Handler card | `data-testid="handler-card-tara_van_dekar"` |
| Recommended badge | `data-testid="recommended-badge"` |
| Confirm handler | `data-testid="handler-confirm"` |
| TodayLauncher | `data-testid="today-launcher"` |
| Launch button | `data-testid="today-launch-btn"` |
| Archetype kit label | `data-testid="archetype-kit-label"` |

## Spec File

`e2e/flows/01-first-contact.spec.ts`

## Estimated Duration

~15–20 seconds (cold start + full onboarding sequence)
