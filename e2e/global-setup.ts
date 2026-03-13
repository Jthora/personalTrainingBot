import { spawn, type ChildProcess } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let server: ChildProcess | null = null;

async function waitForPort(port: number, timeout = 15_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(`http://localhost:${port}/`);
      if (res.ok) return;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server did not start on port ${port} within ${timeout}ms`);
}

export default async function globalSetup() {
  const projectRoot = resolve(__dirname, '..');
  console.log('[globalSetup] Starting vite preview on port 4199...');
  
  server = spawn('npx', ['vite', 'preview', '--port', '4199', '--host'], {
    cwd: projectRoot,
    stdio: 'pipe',
    detached: true,
  });

  server.stdout?.on('data', (d: Buffer) => {
    const text = d.toString().trim();
    if (text) console.log('[vite]', text);
  });

  server.stderr?.on('data', (d: Buffer) => {
    const text = d.toString().trim();
    if (text) console.error('[vite-err]', text);
  });

  await waitForPort(4199);
  console.log('[globalSetup] Server ready on port 4199');

  // Store PID for teardown
  process.env.__VITE_PID = String(server.pid);
}
