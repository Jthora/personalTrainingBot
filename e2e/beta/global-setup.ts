import { mkdirSync, rmSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SCREENSHOT_DIR = resolve(__dirname, '../../artifacts/beta-screenshots');

const SCENARIO_DIRS = [
  '01-fresh-cadet',
  '02-returning-operative',
  '03-mission-commander',
  '04-knowledge-seeker',
  '05-profile-sovereign',
  '06-edge-gremlin',
  '07-navigation-atlas',
  '08-module-explorer',
];

/**
 * Global setup for the Beta Test Suite.
 * Clears previous screenshot artifacts and creates fresh scenario directories.
 */
export default function globalSetup(): void {
  // Clear previous run
  if (existsSync(SCREENSHOT_DIR)) {
    rmSync(SCREENSHOT_DIR, { recursive: true, force: true });
  }

  // Create scenario directories
  for (const dir of SCENARIO_DIRS) {
    mkdirSync(resolve(SCREENSHOT_DIR, dir), { recursive: true });
  }

  console.log(`\n📸 Beta screenshots directory ready: ${SCREENSHOT_DIR}`);
  console.log(`   ${SCENARIO_DIRS.length} scenario directories created\n`);
}
