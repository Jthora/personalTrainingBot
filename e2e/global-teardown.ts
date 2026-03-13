export default async function globalTeardown() {
  const pid = process.env.__VITE_PID;
  if (pid) {
    console.log('[globalTeardown] Killing vite preview (PID:', pid, ')');
    try {
      // Kill process group (negative PID kills the group)
      process.kill(-Number(pid), 'SIGTERM');
    } catch {
      try {
        process.kill(Number(pid), 'SIGTERM');
      } catch {
        // already dead
      }
    }
  }
}
