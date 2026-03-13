# Story 2: Impatient Recruit

> *Someone who found this link on social media. They don't want to read. They don't want to configure. They want to train NOW. The app lets them — and after they've tasted the value, it earns the right to ask "who do you want to become?"*

## The Promise

You can train before you configure. Value before commitment. And the moment you've proven the app is worth your time, it offers you an identity.

## Emotional Arc

| Stage | What the user sees | What they should feel |
|-------|--------------------|-----------------------|
| Welcome overlay | "Start Training Now" button | Relief — no forced setup |
| Training tab | Drill available immediately | Satisfied — promised fast, delivered fast |
| First drill | Real training card content, timer, steps | Engaged — this is actual training, not a demo |
| Drill completion | "+35 XP" feedback, reflection form | Accomplished — first win |
| Archetype prompt | "Nice work on your first drill! Pick an archetype..." | Ready — they've proven the app works, now they're willing to invest |
| After selection | CTA updates to archetype name | Rewarded — their choice immediately changed the experience |

## Preconditions

- **Persona:** `brand-new` (empty localStorage)
- **Starting URL:** `/mission/brief`

## Test Checkpoints

### 2.1 — "Start Training Now" fast-path button exists

```
Navigate to /mission/brief
EXPECT visible: "Start Training Now" button
```

### 2.2 — Fast-path skips all onboarding gates

```
CLICK: "Start Training Now"
EXPECT URL: /mission/training
EXPECT NOT visible: archetype picker
EXPECT NOT visible: handler picker
EXPECT NOT visible: intake panel
```

**Why this matters:** If any gate leaks through, the fast-path is broken and the impatient recruit bounces.

### 2.3 — Fast-path flag set in localStorage

```
READ localStorage: "mission:fast-path:v1"
EXPECT value: "active"
READ localStorage: "operative:profile:v1"
EXPECT value: null (no profile yet)
```

### 2.4 — Training surface has a drill available

```
EXPECT visible: drill content OR training module browser
EXPECT: at least one actionable training element on screen
```

**Why this matters:** If the training tab is empty after fast-path, the entire promise is broken. The user pressed "Start Training Now" and got nothing.

### 2.5 — Drill can be completed end-to-end

```
Start a drill (via TodayLauncher or direct module action)
EXPECT: drill steps visible with checkboxes
CHECK all steps
EXPECT: reflection form appears (if enhanced mode)
CLICK: "Record drill"
EXPECT visible: XP delta text (data-testid="drill-completion-xp")
```

### 2.6 — Post-drill archetype prompt appears

```
AFTER drill recorded:
EXPECT visible: "Nice work on your first drill!" (data-testid="post-drill-archetype-prompt")
EXPECT visible: archetype picker within the prompt
EXPECT visible: 8 archetype cards
```

**Why this matters:** This is the conversion moment. The user just proved the app works. Now we ask them to commit to an identity. If this prompt doesn't appear, fast-path users never get personalized training.

### 2.7 — Selecting archetype from prompt updates experience

```
CLICK: archetype card (e.g., "cyber_sentinel")
CLICK: "Confirm Archetype"
EXPECT: prompt dismissed
EXPECT: rest interval appears (data-testid="rest-interval")

Navigate to /mission/brief
EXPECT: TodayLauncher button contains "Cyber Sentinel Training"
```

### 2.8 — Fast-path flag cleared and profile persisted

```
READ localStorage: "mission:fast-path:v1"
EXPECT value: null (cleared)
READ localStorage: "operative:profile:v1"
EXPECT JSON contains: archetypeId === "cyber_sentinel"
EXPECT JSON contains: handlerId matches recommended handler for cyber_sentinel
```

## Failure Modes This Catches

| Failure | Impact |
|---------|--------|
| Fast-path button missing from welcome overlay | Impatient users leave |
| Fast-path still shows onboarding gates | Promise broken — "now" means now |
| Training tab empty after fast-path | User pressed "train now" and got nothing |
| Post-drill prompt never fires | Fast-path users never personalize, get generic kits forever |
| Archetype selection from prompt doesn't persist | User makes a choice that's silently lost |
| Fast-path flag not cleared after selection | Flag leaks, causes unexpected prompts later |

## Locator Reference

| Element | Locator Strategy |
|---------|------------------|
| "Start Training Now" | `getByRole('button', { name: /Start Training Now/i })` |
| Archetype prompt | `data-testid="post-drill-archetype-prompt"` |
| Drill completion XP | `data-testid="drill-completion-xp"` |
| Rest interval | `data-testid="rest-interval"` |
| Archetype cards (in prompt) | `data-testid="archetype-card-cyber_sentinel"` |

## Spec File

`e2e/flows/02-impatient-recruit.spec.ts`

## Estimated Duration

~25–30 seconds (fast-path + drill execution + archetype selection)
