/**
 * drillStepBuilder.ts — Builds DrillRunner-compatible steps from training content.
 *
 * Bridges the gap between TrainingModuleCache (cards) and DrillRunStore (steps)
 * by creating drill steps with `cardId` set so that DrillRunner can render
 * card content, exercises, and learning objectives inline.
 *
 * Cards are prioritised by spaced-repetition state:
 *   1. Due for review (nextReviewAt ≤ now)
 *   2. Unseen / never reviewed
 *   3. Not yet due (scheduled for future review)
 */

import TrainingModuleCache from '../cache/TrainingModuleCache';
import CardProgressStore from '../store/CardProgressStore';
import { isDue } from './srScheduler';
import type { Card } from '../types/Card';

export type DrillStepInput = {
  id: string;
  label: string;
  cardId: string;
  routePath?: string;
};

/**
 * Build drill steps from a specific card deck.
 * Each card in the deck becomes a step with `cardId` set.
 *
 * @param deckId — The card deck ID (e.g. `"deck-morning"`)
 * @param maxCards — Optional cap on the number of steps. Picks the first N cards.
 * @returns Array of step inputs ready for `DrillRunStore.start()`, or empty if deck not found.
 */
export function buildDrillStepsFromDeck(
  deckId: string,
  maxCards?: number,
): DrillStepInput[] {
  const cache = TrainingModuleCache.getInstance();
  if (!cache.isLoaded()) return [];

  // Walk modules to find the deck
  for (const [, mod] of cache.cache) {
    for (const sub of mod.submodules) {
      for (const deck of sub.cardDecks) {
        if (deck.id === deckId) {
          return cardsToSteps(deck.cards, maxCards);
        }
      }
    }
  }

  return [];
}

/**
 * Build drill steps from across a module's selected decks.
 * Respects TrainingModuleCache selection state — skips unselected submodules/decks/cards.
 *
 * @param moduleId — Training module ID (e.g. `"cybersecurity"`)
 * @param maxCards — Optional cap on total steps. Cards are drawn round-robin from selected decks.
 * @returns Array of step inputs with `cardId` set, or empty if module not found/loaded.
 */
export function buildDrillStepsFromModule(
  moduleId: string,
  maxCards?: number,
): DrillStepInput[] {
  const cache = TrainingModuleCache.getInstance();
  if (!cache.isLoaded()) return [];

  const mod = cache.getTrainingModule(moduleId);
  if (!mod) return [];

  const allCards: Card[] = [];
  for (const sub of mod.submodules) {
    if (!cache.isSubModuleSelected(sub.id)) continue;
    for (const deck of sub.cardDecks) {
      if (!cache.isCardDeckSelected(deck.id)) continue;
      for (const card of deck.cards) {
        if (cache.isCardSelected(card.id)) {
          allCards.push(card);
        }
      }
    }
  }

  return cardsToSteps(allCards, maxCards);
}

/**
 * Convert an array of Cards into drill steps, prioritised by SR state.
 *
 * Bucket order: due for review → unseen → not yet due.
 * Within each bucket, original (deck) order is preserved.
 */
function cardsToSteps(cards: Card[], maxCards?: number): DrillStepInput[] {
  const now = Date.now();

  const due: Card[] = [];
  const unseen: Card[] = [];
  const future: Card[] = [];

  for (const card of cards) {
    const progress = CardProgressStore.getCardProgress(card.id);
    if (!progress) {
      unseen.push(card);
    } else if (isDue(progress.nextReviewAt, now)) {
      due.push(card);
    } else {
      future.push(card);
    }
  }

  const sorted = [...due, ...unseen, ...future];
  const limited =
    maxCards != null && maxCards > 0 ? sorted.slice(0, maxCards) : sorted;

  return limited.map((card, i) => ({
    id: `card-step-${i}-${card.id}`,
    label: card.title,
    cardId: card.id,
  }));
}

/**
 * Build drill steps from specific card IDs (for retry-weak-cards flows).
 * Looks up each card in TrainingModuleCache and creates steps in the given order.
 *
 * @param cardIds — Array of card IDs to include.
 * @param maxCards — Optional cap on steps.
 * @returns Array of step inputs with `cardId` set, or empty if cache not loaded.
 */
export function buildDrillStepsFromCards(
  cardIds: string[],
  maxCards?: number,
): DrillStepInput[] {
  const cache = TrainingModuleCache.getInstance();
  if (!cache.isLoaded()) return [];

  const cards: Card[] = [];
  for (const id of cardIds) {
    const card = cache.getCardById(id);
    if (card) cards.push(card);
  }

  const limited =
    maxCards != null && maxCards > 0 ? cards.slice(0, maxCards) : cards;

  return limited.map((card, i) => ({
    id: `retry-step-${i}-${card.id}`,
    label: card.title,
    cardId: card.id,
  }));
}
