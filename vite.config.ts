import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { visualizer } from 'rollup-plugin-visualizer'

const chunkGroups = [
  { name: 'handlers', patterns: [/src\/components\/Handler/i, /src\/data\/handlers/i, /src\/data\/handlerModuleMapping/i] },
  { name: 'drills', patterns: [/src\/components\/(Drill|Training)/i] },
  { name: 'scheduler', patterns: [/src\/components\/(Schedule|Scheduler|Calendar)/i] },
  { name: 'share', patterns: [/src\/components\/(Share|CardTable)/i, /CardSharePage/i] },
  { name: 'sounds', patterns: [/src\/assets\/sounds/i] },
  { name: 'mission-shell', patterns: [/src\/pages\/MissionFlow\/MissionShell/i, /src\/components\/(MissionIntakePanel|ArchetypePicker|HandlerPicker|CelebrationLayer)/i] },
  { name: 'recap', patterns: [/src\/components\/Recap/i, /src\/data\/recapVariants/i, /src\/data\/recapCopy/i] },
  { name: 'stores', patterns: [/src\/store\//i] },
  { name: 'domain', patterns: [/src\/domain\//i] },
  { name: 'gun-p2p', patterns: [/src\/services\/gun/i] },
  { name: 'readiness', patterns: [/src\/utils\/readiness\//i] },
  { name: 'caches', patterns: [/src\/cache\//i] },
  { name: 'context', patterns: [/src\/context\//i] },
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
            if (/qrcode|jsqr/.test(id)) return 'qr-vendor'
            if (/\/gun\//.test(id)) return 'gun-vendor'
            return 'vendor'
          }

          const tmMatch = id.match(/src\/data\/training_modules\/([^/]+)\.json/i)
          if (tmMatch) {
            return `tm-${tmMatch[1]}`
          }

          const tcdDrillMatch = id.match(/src\/data\/training_handler_data\/drills\/([^/]+)\.json/i)
          if (tcdDrillMatch) {
            return `tcd-drill-${tcdDrillMatch[1]}`
          }

          const tcdMatch = id.match(/src\/data\/training_handler_data\/([^/]+)\.json/i)
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
