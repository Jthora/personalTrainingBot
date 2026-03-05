import { describe, expect, it } from 'vitest';
import {
    invalidLeadFixture,
    invalidOperationFixture,
    validArtifactFixture,
    validCaseFixture,
    validDebriefFixture,
    validIntelPacketFixture,
    validLeadFixture,
    validOperationFixture,
    validSignalFixture,
} from '../fixtures';
import { DEFAULT_ENTITY_VERSION, isValidEntityVersion } from '../lifecycle';
import { validateMissionEntity, validateStatusTransition } from '../validation';

describe('mission domain validation', () => {
    it('accepts valid canonical entities', () => {
        const entities = [
            validOperationFixture,
            validCaseFixture,
            validLeadFixture,
            validSignalFixture,
            validArtifactFixture,
            validIntelPacketFixture,
            validDebriefFixture,
        ];

        entities.forEach(entity => {
            const result = validateMissionEntity(entity);
            expect(result.valid).toBe(true);
            expect(result.issues).toEqual([]);
        });
    });

    it('rejects invalid entity payloads', () => {
        const badOperation = validateMissionEntity(invalidOperationFixture);
        expect(badOperation.valid).toBe(false);
        expect(badOperation.issues.length).toBeGreaterThan(0);

        const badLead = validateMissionEntity(invalidLeadFixture);
        expect(badLead.valid).toBe(false);
        expect(badLead.issues.some(issue => issue.path === 'confidence')).toBe(true);
    });

    it('validates lifecycle transitions', () => {
        const validTransition = validateStatusTransition({
            entityKind: 'operation',
            currentStatus: 'briefing',
            nextStatus: 'triage',
        });
        expect(validTransition.valid).toBe(true);

        const invalidTransition = validateStatusTransition({
            entityKind: 'operation',
            currentStatus: 'completed',
            nextStatus: 'active',
        });
        expect(invalidTransition.valid).toBe(false);
    });

    it('validates entity version format', () => {
        expect(isValidEntityVersion(DEFAULT_ENTITY_VERSION)).toBe(true);
        expect(isValidEntityVersion('v42')).toBe(true);
        expect(isValidEntityVersion('version-42')).toBe(false);
    });
});
