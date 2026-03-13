import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        environmentMatchGlobs: [
            ['scripts/**', 'node'],
        ],
        globals: true,
        exclude: ['e2e/**', 'node_modules/**'],
        setupFiles: './vitest.setup.ts',
        coverage: {
            reporter: ['text', 'html'],
        },
    },
});
