import { createStore } from './createStore';

type SelectionRecord = Record<string, boolean>;

const STORAGE_VERSION = 'v2';
const STORAGE_PREFIX = `trainingSelection:${STORAGE_VERSION}:`;

const isSelectionRecord = (value: unknown): value is SelectionRecord => {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
	return Object.values(value as Record<string, unknown>).every(entry => typeof entry === 'boolean');
};

const selectionValidate = (raw: unknown): SelectionRecord | null =>
	isSelectionRecord(raw) ? raw : null;

const modulesStore = createStore<SelectionRecord | null>({
	key: `${STORAGE_PREFIX}modules`, defaultValue: null, validate: selectionValidate,
});
const subModulesStore = createStore<SelectionRecord | null>({
	key: `${STORAGE_PREFIX}subModules`, defaultValue: null, validate: selectionValidate,
});
const cardDecksStore = createStore<SelectionRecord | null>({
	key: `${STORAGE_PREFIX}cardDecks`, defaultValue: null, validate: selectionValidate,
});
const cardsStore = createStore<SelectionRecord | null>({
	key: `${STORAGE_PREFIX}cards`, defaultValue: null, validate: selectionValidate,
});

/** Data signature stored as raw string (not JSON-wrapped) — kept outside factory. */
const DATA_SIGNATURE_KEY = `${STORAGE_PREFIX}dataSignature`;
const readSignature = (): string | undefined => {
	try { return localStorage.getItem(DATA_SIGNATURE_KEY) ?? undefined; } catch { return undefined; }
};
const writeSignature = (value: string) => {
	try { localStorage.setItem(DATA_SIGNATURE_KEY, value); } catch { /* ignore */ }
};

const TrainingModuleSelectionStore = {
	getSelectedModules(): SelectionRecord | undefined { return modulesStore.get() ?? undefined; },
	saveSelectedModules(record: SelectionRecord) { modulesStore.set(record); },
	clearSelectedModules() { modulesStore.reset(); },
	getSelectedSubModules(): SelectionRecord | undefined { return subModulesStore.get() ?? undefined; },
	saveSelectedSubModules(record: SelectionRecord) { subModulesStore.set(record); },
	clearSelectedSubModules() { subModulesStore.reset(); },
	getSelectedCardDecks(): SelectionRecord | undefined { return cardDecksStore.get() ?? undefined; },
	saveSelectedCardDecks(record: SelectionRecord) { cardDecksStore.set(record); },
	clearSelectedCardDecks() { cardDecksStore.reset(); },
	getSelectedCards(): SelectionRecord | undefined { return cardsStore.get() ?? undefined; },
	saveSelectedCards(record: SelectionRecord) { cardsStore.set(record); },
	clearSelectedCards() { cardsStore.reset(); },
	clearAllSelections() {
		this.clearSelectedModules();
		this.clearSelectedSubModules();
		this.clearSelectedCardDecks();
		this.clearSelectedCards();
	},
	getDataSignature(): string | undefined { return readSignature(); },
	saveDataSignature(signature: string) { writeSignature(signature); },
	syncDataSignature(signature: string): boolean {
		const existing = this.getDataSignature();
		if (!existing) { this.saveDataSignature(signature); return true; }
		if (existing === signature) return true;
		this.clearAllSelections();
		this.saveDataSignature(signature);
		return false;
	},
};

export type { SelectionRecord };
export default TrainingModuleSelectionStore;
