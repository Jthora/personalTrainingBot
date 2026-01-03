export type AppEnv = 'development' | 'staging' | 'production';

const normalizeEnv = (value?: string): AppEnv => {
    const normalized = (value || '').toLowerCase();
    if (normalized.includes('prod')) return 'production';
    if (normalized.includes('stag')) return 'staging';
    return 'development';
};

export const getAppEnv = (): AppEnv => {
    const envVar = typeof process !== 'undefined' ? process.env.VITE_APP_ENV ?? process.env.NODE_ENV : undefined;
    const mode = typeof import.meta !== 'undefined' ? (import.meta as any).env?.MODE as string | undefined : undefined;
    return normalizeEnv(envVar || mode);
};
