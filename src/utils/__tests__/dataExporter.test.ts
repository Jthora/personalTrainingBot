import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  buildExportPayload,
  importPayload,
  EXPORT_SCHEMA_VERSION,
} from '../dataExporter';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe('dataExporter', () => {
  describe('buildExportPayload', () => {
    it('includes schemaVersion and exportedAt', () => {
      const payload = buildExportPayload();
      expect(payload.schemaVersion).toBe(EXPORT_SCHEMA_VERSION);
      expect(payload.exportedAt).toBeTruthy();
      expect(typeof payload.exportedAt).toBe('string');
    });

    it('collects all critical stores from localStorage', () => {
      localStorage.setItem('ptb:drill-history:v1', JSON.stringify([{ id: 'd:1' }]));
      localStorage.setItem('ptb:card-progress:v1', JSON.stringify([{ cardId: 'c1' }]));
      localStorage.setItem('userProgress:v1', JSON.stringify({ xp: 100 }));
      localStorage.setItem('operative:profile:v1', JSON.stringify({ archetypeId: 'psi_operative' }));

      const payload = buildExportPayload();
      expect(payload.stores['ptb:drill-history:v1']).toEqual([{ id: 'd:1' }]);
      expect(payload.stores['ptb:card-progress:v1']).toEqual([{ cardId: 'c1' }]);
      expect(payload.stores['userProgress:v1']).toEqual({ xp: 100 });
      expect(payload.stores['operative:profile:v1']).toEqual({ archetypeId: 'psi_operative' });
    });

    it('returns empty stores when localStorage is empty', () => {
      const payload = buildExportPayload();
      expect(Object.keys(payload.stores)).toHaveLength(0);
    });
  });

  describe('importPayload', () => {
    it('rejects null payload', () => {
      const result = importPayload(null);
      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it('rejects missing schemaVersion', () => {
      const result = importPayload({ stores: {} });
      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('schemaVersion');
    });

    it('rejects newer schemaVersion', () => {
      const result = importPayload({
        schemaVersion: EXPORT_SCHEMA_VERSION + 1,
        stores: {},
      });
      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('newer');
    });

    it('restores stores from valid payload', () => {
      const payload = {
        schemaVersion: EXPORT_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        stores: {
          'ptb:drill-history:v1': [{ id: 'imported:1' }],
          'operative:profile:v1': { archetypeId: 'shadow_agent' },
        },
      };

      const result = importPayload(payload, { force: true });
      expect(result.success).toBe(true);
      expect(result.restoredKeys).toHaveLength(2);
      expect(localStorage.getItem('ptb:drill-history:v1')).toContain('imported:1');
      expect(localStorage.getItem('operative:profile:v1')).toContain('shadow_agent');
    });

    it('skips existing data without force flag', () => {
      localStorage.setItem('ptb:drill-history:v1', JSON.stringify([{ id: 'existing:1' }]));

      const payload = {
        schemaVersion: EXPORT_SCHEMA_VERSION,
        stores: {
          'ptb:drill-history:v1': [{ id: 'new:1' }],
        },
      };

      const result = importPayload(payload);
      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('already has data');
      expect(localStorage.getItem('ptb:drill-history:v1')).toContain('existing:1');
    });

    it('overwrites existing data with force flag', () => {
      localStorage.setItem('ptb:drill-history:v1', JSON.stringify([{ id: 'existing:1' }]));

      const payload = {
        schemaVersion: EXPORT_SCHEMA_VERSION,
        stores: {
          'ptb:drill-history:v1': [{ id: 'forced:1' }],
        },
      };

      const result = importPayload(payload, { force: true });
      expect(result.success).toBe(true);
      expect(localStorage.getItem('ptb:drill-history:v1')).toContain('forced:1');
    });

    it('skips unknown store keys with warning', () => {
      const payload = {
        schemaVersion: EXPORT_SCHEMA_VERSION,
        stores: {
          'unknown:key:v1': { data: true },
        },
      };

      const result = importPayload(payload, { force: true });
      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('unknown');
    });
  });
});
