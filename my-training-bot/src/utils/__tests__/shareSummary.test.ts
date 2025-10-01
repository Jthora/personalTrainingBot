import { describe, expect, it } from 'vitest';
import { generateShareSummary } from '../shareSummary';
import type { Card } from '../../types/Card';
import type { CardMeta } from '../../cache/TrainingModuleCache';

const baseCard: Card = {
    id: 'card-001',
    title: 'Prime your mind \\((a^2 + b^2)\\)',
    description: 'Stay sharp with deliberate problem solving.',
    bulletpoints: [
        "Warm-up: reflect on yesterday's wins",
        'Focus block: tackle the top 3 blockers',
        'Cooldown: journaling for 5 minutes',
    ],
    duration: 25,
    difficulty: 'Intermediate',
};

const baseMeta: CardMeta = {
    moduleId: 'module-1',
    moduleName: 'Cognitive Sculpt',
    moduleColor: '#0044ff',
    subModuleId: 'sub-1',
    subModuleName: 'Decision Drills',
    cardDeckId: 'deck-1',
    cardDeckName: 'Morning Momentum',
};

describe('generateShareSummary', () => {
    it('returns text within 280 characters including url and hashtags', () => {
        const shortUrl = 'https://ptb.local/c/abc123';
        const summary = generateShareSummary({ card: baseCard, meta: baseMeta, shortUrl });

        expect(summary.text.length).toBeLessThanOrEqual(280);
        expect(summary.text).toContain(shortUrl);
        expect(summary.hashtags).toEqual(['#Intermediate', '#CognitiveSculpt']);
        expect(summary.text).toContain('#Intermediate');
        expect(summary.text).toContain('#CognitiveSculpt');
    });

    it('sanitizes whitespace and truncates with priority order', () => {
        const noisyCard: Card = {
            ...baseCard,
            title: ' Ultra focus  \n reboot ',
            description: 'Deep work  \n session with notes',
            bulletpoints: [
                'First: identify the ONE thing',
                'Second: commit 50 minutes',
                'Third: defrag \n\n distractions',
            ],
        };

        const summary = generateShareSummary({ card: noisyCard, meta: baseMeta, maxLength: 140 });

        expect(summary.summary.startsWith('Ultra focus reboot'));
        expect(summary.summary).toMatch(/• First: identify the ONE thing/);
        expect(summary.summary.length).toBeLessThanOrEqual(140);
        expect(summary.text.length).toBeLessThanOrEqual(140);
    });
});
