import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Web için kök yol "/" kullanılır. İleride Electron paketinde dosyadan yüklemek için
// `vite build --base ./` ve VITE_ROUTER_MODE=hash ile derlenebilir (bkz. README).
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
