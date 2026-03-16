import { readdirSync, statSync, writeFileSync, existsSync } from 'fs';
import { resolve, join, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SCREENSHOT_DIR = resolve(__dirname, '../../artifacts/beta-screenshots');

interface ScenarioEntry {
  name: string;
  images: string[];
}

/**
 * Global teardown for the Beta Test Suite.
 * Generates an HTML gallery viewer for all captured screenshots.
 */
export default function globalTeardown(): void {
  if (!existsSync(SCREENSHOT_DIR)) {
    console.log('\n⚠️  No screenshots directory found — skipping gallery generation\n');
    return;
  }

  const scenarios: ScenarioEntry[] = [];
  let totalImages = 0;

  const dirs = readdirSync(SCREENSHOT_DIR)
    .filter((d) => statSync(join(SCREENSHOT_DIR, d)).isDirectory())
    .sort();

  for (const dir of dirs) {
    const dirPath = join(SCREENSHOT_DIR, dir);
    const images = readdirSync(dirPath)
      .filter((f) => f.endsWith('.png'))
      .sort();
    scenarios.push({ name: dir, images });
    totalImages += images.length;
  }

  const html = generateGalleryHTML(scenarios, totalImages);
  const outputPath = resolve(SCREENSHOT_DIR, 'index.html');
  writeFileSync(outputPath, html, 'utf-8');

  console.log(`\n📸 Beta screenshot gallery generated: ${outputPath}`);
  console.log(`   ${scenarios.length} scenarios, ${totalImages} screenshots\n`);
}

function generateGalleryHTML(scenarios: ScenarioEntry[], totalImages: number): string {
  const scenarioSections = scenarios
    .map(
      (s) => `
    <section class="scenario">
      <h2>${formatScenarioName(s.name)} <span class="count">(${s.images.length} screenshots)</span></h2>
      ${
        s.images.length === 0
          ? '<p class="empty">No screenshots captured</p>'
          : `<div class="grid">
        ${s.images
          .map(
            (img) => `
          <figure>
            <a href="${s.name}/${img}" target="_blank">
              <img src="${s.name}/${img}" alt="${img}" loading="lazy" />
            </a>
            <figcaption>${formatCaption(img)}</figcaption>
          </figure>`,
          )
          .join('\n')}
      </div>`
      }
    </section>`,
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Beta Test Suite — Screenshot Gallery</title>
  <style>
    :root {
      --bg: #0a0a0f;
      --surface: #12121a;
      --text: #e0e0e8;
      --muted: #888;
      --accent: #4fc3f7;
      --border: #1e1e2e;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: 2rem;
    }
    header {
      text-align: center;
      margin-bottom: 3rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border);
    }
    header h1 { font-size: 1.8rem; color: var(--accent); margin-bottom: .5rem; }
    .summary {
      display: flex;
      gap: 2rem;
      justify-content: center;
      color: var(--muted);
      font-size: .9rem;
    }
    .summary strong { color: var(--text); }
    .scenario { margin-bottom: 3rem; }
    .scenario h2 {
      font-size: 1.2rem;
      margin-bottom: 1rem;
      padding-bottom: .5rem;
      border-bottom: 1px solid var(--border);
    }
    .scenario h2 .count { color: var(--muted); font-weight: normal; font-size: .85rem; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
    }
    figure {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
      transition: border-color .2s;
    }
    figure:hover { border-color: var(--accent); }
    figure a { display: block; }
    figure img {
      width: 100%;
      height: auto;
      display: block;
      cursor: zoom-in;
    }
    figcaption {
      padding: .6rem .8rem;
      font-size: .8rem;
      color: var(--muted);
      font-family: 'SF Mono', Monaco, monospace;
    }
    .empty { color: var(--muted); font-style: italic; }
    @media (max-width: 600px) {
      body { padding: 1rem; }
      .grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header>
    <h1>Starcom Academy — Beta Test Screenshots</h1>
    <div class="summary">
      <span><strong>${scenarios.length}</strong> scenarios</span>
      <span><strong>${totalImages}</strong> screenshots</span>
      <span>Generated ${new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC</span>
    </div>
  </header>
  ${scenarioSections}
</body>
</html>`;
}

function formatScenarioName(dirName: string): string {
  return dirName
    .replace(/^\d+-/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCaption(filename: string): string {
  return basename(filename, '.png').replace(/-/g, ' ');
}
