type SelectionRecord = Record<string, boolean>;

const STORAGE_VERSION = 'v2';
const STORAGE_PREFIX = `trainingSelection:${STORAGE_VERSION}:`;

const withVersionedKey = (base: string) => `${STORAGE_PREFIX}${base}`;

const SELECTED_MODULES_KEY = withVersionedKey('modules');
const SELECTED_SUBMODULES_KEY = withVersionedKey('subModules');
const SELECTED_CARD_DECKS_KEY = withVersionedKey('cardDecks');
const SELECTED_CARDS_KEY = withVersionedKey('cards');
const DATA_SIGNATURE_KEY = withVersionedKey('dataSignature');

const isSelectionRecord = (value: unknown): value is SelectionRecord => {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		return false;
	}

	return Object.values(value as Record<string, unknown>).every(entry => typeof entry === 'boolean');
};

const readSelection = (key: string): SelectionRecord | undefined => {
	try {
		const raw = localStorage.getItem(key);
		if (!raw) {
			return undefined;
		}

		const parsed = JSON.parse(raw) as unknown;
		if (!isSelectionRecord(parsed)) {
			console.warn(`TrainingModuleSelectionStore: Invalid selection data for ${key}.`);
			return undefined;
		}

		return parsed;
	} catch (error) {
		console.warn(`TrainingModuleSelectionStore: Failed to read ${key}.`, error);
		return undefined;
	}
};

const writeSelection = (key: string, record: SelectionRecord) => {
	try {
		localStorage.setItem(key, JSON.stringify(record));
	} catch (error) {
		console.warn(`TrainingModuleSelectionStore: Failed to persist ${key}.`, error);
	}
};

const writeValue = (key: string, value: string) => {
	try {
		localStorage.setItem(key, value);
	} catch (error) {
		console.warn(`TrainingModuleSelectionStore: Failed to persist ${key}.`, error);
	}
};

const readValue = (key: string): string | undefined => {
	try {
		return localStorage.getItem(key) ?? undefined;
	} catch (error) {
		console.warn(`TrainingModuleSelectionStore: Failed to read ${key}.`, error);
		return undefined;
	}
};

const clearSelection = (key: string) => {
	try {
		localStorage.removeItem(key);
	} catch (error) {
		console.warn(`TrainingModuleSelectionStore: Failed to clear ${key}.`, error);
	}
};

const TrainingModuleSelectionStore = {
	getSelectedModules(): SelectionRecord | undefined {
		return readSelection(SELECTED_MODULES_KEY);
	},
	saveSelectedModules(record: SelectionRecord) {
		writeSelection(SELECTED_MODULES_KEY, record);
	},
	clearSelectedModules() {
		clearSelection(SELECTED_MODULES_KEY);
	},
	getSelectedSubModules(): SelectionRecord | undefined {
		return readSelection(SELECTED_SUBMODULES_KEY);
	},
	saveSelectedSubModules(record: SelectionRecord) {
		writeSelection(SELECTED_SUBMODULES_KEY, record);
	},
	clearSelectedSubModules() {
		clearSelection(SELECTED_SUBMODULES_KEY);
	},
	getSelectedCardDecks(): SelectionRecord | undefined {
		return readSelection(SELECTED_CARD_DECKS_KEY);
	},
	saveSelectedCardDecks(record: SelectionRecord) {
		writeSelection(SELECTED_CARD_DECKS_KEY, record);
	},
	clearSelectedCardDecks() {
		clearSelection(SELECTED_CARD_DECKS_KEY);
	},
	getSelectedCards(): SelectionRecord | undefined {
		return readSelection(SELECTED_CARDS_KEY);
	},
	saveSelectedCards(record: SelectionRecord) {
		writeSelection(SELECTED_CARDS_KEY, record);
	},
	clearSelectedCards() {
		clearSelection(SELECTED_CARDS_KEY);
	},
	clearAllSelections() {
		this.clearSelectedModules();
		this.clearSelectedSubModules();
		this.clearSelectedCardDecks();
		this.clearSelectedCards();
	},
	getDataSignature(): string | undefined {
		return readValue(DATA_SIGNATURE_KEY);
	},
	saveDataSignature(signature: string) {
		writeValue(DATA_SIGNATURE_KEY, signature);
	},
	syncDataSignature(signature: string): boolean {
		const existingSignature = this.getDataSignature();

		if (!existingSignature) {
			this.saveDataSignature(signature);
			return true;
		}

		if (existingSignature === signature) {
			return true;
		}

		this.clearAllSelections();
		this.saveDataSignature(signature);
		return false;
	},
};

export type { SelectionRecord };
export default TrainingModuleSelectionStore;
