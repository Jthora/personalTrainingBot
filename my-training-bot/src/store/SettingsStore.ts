import Web3AuthService from '../services/Web3AuthService';

export interface UserProfile {
    nickname?: string;
    avatar?: string;
}

export interface UserPreferences {
    theme: 'light' | 'dark';
    profile: UserProfile;
}

const PREFERENCES_STORAGE_KEY = 'ptb:user-preferences';

export class SettingsStore {
    private static instance: SettingsStore;
    private initialized = false;
    private preferences: UserPreferences = {
        theme: 'dark',
        profile: {},
    };
    private readonly web3AuthService = Web3AuthService.getInstance();

    static getInstance(): SettingsStore {
        if (!SettingsStore.instance) {
            SettingsStore.instance = new SettingsStore();
        }
        return SettingsStore.instance;
    }

    private constructor() {}

    async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }
        this.initialized = true;

        this.loadPreferences();
    await this.web3AuthService.getWalletAddress();
    }

    getUserPreferences(): UserPreferences {
        return this.preferences;
    }

    async connectWeb3(): Promise<string | null> {
    const address = await this.web3AuthService.connect();
    return address;
    }

    async disconnectWeb3(): Promise<void> {
    await this.web3AuthService.disconnect();
    }

    updateProfile(profile: UserProfile): void {
        this.preferences = {
            ...this.preferences,
            profile,
        };
        this.savePreferences();
    }

    updateTheme(theme: 'light' | 'dark'): void {
        this.preferences = {
            ...this.preferences,
            theme,
        };
        this.savePreferences();
    }

    private loadPreferences(): void {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            const stored = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as Partial<UserPreferences>;
                this.preferences = {
                    theme: parsed.theme === 'light' ? 'light' : 'dark',
                    profile: parsed.profile ?? {},
                };
            }
        } catch (error) {
            console.warn('SettingsStore: failed to parse stored preferences', error);
        }
    }

    private savePreferences(): void {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(this.preferences));
        } catch (error) {
            console.warn('SettingsStore: failed to persist preferences', error);
        }
    }
}

export default SettingsStore;
