# Related Cards Component Specification

> A small tray of 1–5 cards at the bottom of the flashcard view. Tap once to jump.

---

## Component: `<RelatedCards />`

### Props

```typescript
interface RelatedCardsProps {
  cardId: string;
  relatedCardIds: string[];  // From card.relatedCards
  onNavigate: (cardId: string) => void;
  maxVisible?: number;  // Default: 5
}
```

### Placement

The component appears at the bottom of the card detail view (back of card, after definition + bullet points + exercises). It is not visible on the front of the card.

```
┌─────────────────────────────────┐
│  [Card Front]                   │
│  Term: BITE Model               │
│            [TAP TO FLIP]        │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  [Card Back]                    │
│  Definition...                  │
│  • Bullet point 1               │
│  • Bullet point 2               │
│                                 │
│  Exercise: ...                  │
│                                 │
│  ─────────────────────────────  │
│  Related Cards                  │
│  [Thought Reform] [DARVO]       │
│  [Loaded Language] [OPSEC]      │
└─────────────────────────────────┘
```

---

## Behavior

### Navigation

Tapping a related card pill navigates directly to that card. The navigation uses the same mechanism as deep-linking: push a new route entry that shows the target card in its module/deck context.

If the target card is in a different module/deck, the navigation resolves the correct route and preserves the back button (returns to the current card).

### Empty State

If `relatedCardIds` is empty or undefined, the component renders nothing — no heading, no empty state message, no skeleton.

### Loading

No loading state. Card data is in-memory from shards loaded at app startup.

---

## Visual Design

```typescript
// RelatedCards.tsx

export function RelatedCards({ cardId, relatedCardIds, onNavigate, maxVisible = 5 }: RelatedCardsProps) {
  if (!relatedCardIds || relatedCardIds.length === 0) return null;

  const cards = relatedCardIds
    .slice(0, maxVisible)
    .map(id => resolveCardById(id))
    .filter(Boolean);

  if (cards.length === 0) return null;

  return (
    <section aria-label="Related cards" className="related-cards">
      <h4 className="related-cards__heading">Related</h4>
      <div className="related-cards__pills" role="list">
        {cards.map(card => (
          <button
            key={card.id}
            role="listitem"
            className="related-cards__pill"
            onClick={() => onNavigate(card.id)}
            aria-label={`Go to related card: ${card.term}`}
          >
            {card.term}
          </button>
        ))}
      </div>
    </section>
  );
}
```

### CSS (tokens to be confirmed against design system)

```css
.related-cards {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border-subtle);
}

.related-cards__heading {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-sm);
}

.related-cards__pills {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.related-cards__pill {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background 0.15s ease;
}

.related-cards__pill:hover,
.related-cards__pill:focus-visible {
  background: var(--color-surface-hover);
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}
```

---

## Accessibility

- The `<section>` has `aria-label="Related cards"` — screen reader announces context
- Each pill has `aria-label` with card term — unambiguous tap target
- `role="list"` + `role="listitem"` preserve list semantics even though pills are `<button>` elements
- Full keyboard navigation (tab through pills, Enter/Space to activate)
- No animation that cannot be disabled via `prefers-reduced-motion`

---

## Tests

```
RelatedCards
  ✓ renders pills for each related card ID
  ✓ calls onNavigate with correct cardId on tap
  ✓ renders nothing when relatedCardIds is empty
  ✓ renders nothing when relatedCardIds is undefined
  ✓ respects maxVisible prop
  ✓ skips unresolvable card IDs silently
  ✓ has correct aria-label on section
  ✓ has correct aria-label on each pill
```
