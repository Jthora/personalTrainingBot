import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { trackEvent } from '../utils/telemetry';

type SyncState = 'idle' | 'running' | 'success' | 'error';

type SettingsContextValue = {
	lowDataMode: boolean;
	setLowDataMode: (value: boolean) => void;
	toggleLowDataMode: () => void;
	syncState: SyncState;
	syncError: string | null;
	lastSyncAt: number | null;
	triggerSync: () => Promise<void>;
};

const STORAGE_KEY = 'ptb:low-data-mode';

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [lowDataMode, setLowDataModeState] = useState<boolean>(() => {
		if (typeof window === 'undefined') return false;
		try {
			return window.localStorage.getItem(STORAGE_KEY) === '1';
		} catch (err) {
			console.warn('SettingsContext: failed to read low-data mode', err);
			return false;
		}
	});
	const [syncState, setSyncState] = useState<SyncState>('idle');
	const [syncError, setSyncError] = useState<string | null>(null);
	const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);

	const persistLowData = useCallback((next: boolean) => {
		setLowDataModeState(next);
		try {
			window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
		} catch (err) {
			console.warn('SettingsContext: failed to persist low-data mode', err);
		}
		trackEvent({ category: 'settings', action: 'toggle_low_data', data: { enabled: next }, source: 'ui' });
	}, []);

	const toggleLowDataMode = useCallback(() => {
		persistLowData(!lowDataMode);
	}, [lowDataMode, persistLowData]);

	const triggerSync = useCallback(async () => {
		if (syncState === 'running') return;
		setSyncState('running');
		setSyncError(null);
		trackEvent({ category: 'settings', action: 'preload_trigger', data: { phase: 'start' }, source: 'ui' });
		try {
			const manifestResp = await fetch('/training_modules_manifest.json', { cache: 'reload' });
			if (!manifestResp.ok) throw new Error(`manifest status ${manifestResp.status}`);
			const shardResp = await fetch('/training_modules_shards/fitness.json', { cache: 'reload' });
			if (!shardResp.ok) throw new Error(`shard status ${shardResp.status}`);
			setSyncState('success');
			setLastSyncAt(Date.now());
			trackEvent({ category: 'settings', action: 'preload_trigger', data: { phase: 'complete', status: 'success' }, source: 'ui' });
		} catch (err) {
			setSyncState('error');
			setSyncError((err as Error).message);
			trackEvent({ category: 'settings', action: 'preload_trigger', data: { phase: 'complete', status: 'error', error: (err as Error).message }, source: 'ui' });
		}
	}, [syncState]);

	const value = useMemo(
		() => ({
			lowDataMode,
			setLowDataMode: persistLowData,
			toggleLowDataMode,
			syncState,
			syncError,
			lastSyncAt,
			triggerSync,
		}),
		[lastSyncAt, lowDataMode, persistLowData, syncError, syncState, toggleLowDataMode, triggerSync]
	);

	return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
	const ctx = useContext(SettingsContext);
	if (!ctx) {
		throw new Error('useSettings must be used within SettingsProvider');
	}
	return ctx;
};

export const readLowDataPreference = (): boolean => {
	try {
		return typeof window !== 'undefined' && window.localStorage.getItem(STORAGE_KEY) === '1';
	} catch (err) {
		console.warn('SettingsContext: failed to read persisted preference', err);
		return false;
	}
};

export default SettingsContext;
