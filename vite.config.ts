import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { visualizer } from 'rollup-plugin-visualizer'

const chunkGroups = [
  { name: 'coaches', patterns: [/src\/components\/Coach/i, /src\/data\/coaches/i, /src\/data\/coachModuleMapping/i] },
  { name: 'workouts', patterns: [/src\/components\/(Workout|Training)/i] },
  { name: 'scheduler', patterns: [/src\/components\/(Schedule|Scheduler|Calendar)/i] },
  { name: 'share', patterns: [/src\/components\/(Share|CardTable)/i, /CardSharePage/i] },
  { name: 'sounds', patterns: [/src\/assets\/sounds/i] },
]

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      plugins: process.env.VISUALIZER
        ? [visualizer({ filename: 'stats.html', template: 'treemap', gzipSize: true, brotliSize: true })]
        : [],
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react-vendor'
            return 'vendor'
          }

          const tmMatch = id.match(/src\/data\/training_modules\/([^/]+)\.json/i)
          if (tmMatch) {
            return `tm-${tmMatch[1]}`
          }

          const tcdWorkoutMatch = id.match(/src\/data\/training_coach_data\/workouts\/([^/]+)\.json/i)
          if (tcdWorkoutMatch) {
            return `tcd-workout-${tcdWorkoutMatch[1]}`
          }

          const tcdMatch = id.match(/src\/data\/training_coach_data\/([^/]+)\.json/i)
          if (tcdMatch) {
            return `tcd-${tcdMatch[1]}`
          }

          for (const group of chunkGroups) {
            if (group.patterns.some((pattern) => pattern.test(id))) {
              return group.name
            }
          }

          return undefined
        },
      },
    },
  },
})
