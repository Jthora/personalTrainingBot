import { beforeEach, describe, expect, it } from 'vitest';
import TrainingModuleSelectionStore from '../TrainingModuleSelectionStore';

describe('TrainingModuleSelectionStore', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('reads and writes selection records', () => {
        TrainingModuleSelectionStore.saveSelectedModules({ alpha: true, beta: true });

        expect(TrainingModuleSelectionStore.getSelectedModules()).toEqual({
            alpha: true,
            beta: true,
        });

        TrainingModuleSelectionStore.clearSelectedModules();
        expect(TrainingModuleSelectionStore.getSelectedModules()).toBeUndefined();
    });

    it('syncs data signatures and preserves selections when unchanged', () => {
        const firstSync = TrainingModuleSelectionStore.syncDataSignature('sig-a');
        expect(firstSync).toBe(true);

        TrainingModuleSelectionStore.saveSelectedModules({ alpha: true });
        const secondSync = TrainingModuleSelectionStore.syncDataSignature('sig-a');
        expect(secondSync).toBe(true);
        expect(TrainingModuleSelectionStore.getSelectedModules()).toEqual({ alpha: true });
    });

    it('clears stored selections when the data signature changes', () => {
        TrainingModuleSelectionStore.syncDataSignature('sig-a');
        TrainingModuleSelectionStore.saveSelectedModules({ alpha: true, beta: true });

        const result = TrainingModuleSelectionStore.syncDataSignature('sig-b');
        expect(result).toBe(false);
        expect(TrainingModuleSelectionStore.getSelectedModules()).toBeUndefined();
    });
});
