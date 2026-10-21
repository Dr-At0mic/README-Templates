import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// No backend: the browser talks to api.github.com directly (it serves CORS headers),
// so the user's token never passes through anything we host.
export default defineConfig({
  plugins: [react()],
  // Keep Rust compile output visible during `tauri dev`.
  clearScreen: false,
  server: {
    port: 5173,
    // The desktop shell loads this exact URL (src-tauri/tauri.conf.json devUrl), so never drift to another port.
    strictPort: true,
    // Cargo writes thousands of files under src-tauri/target while compiling; watching them crashes Vite on Windows.
    watch: { ignored: ['**/src-tauri/**'] },
  },
});
