import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  root: 'ui',
  base: process.env.PAGES_BASE ?? '/',
  build: {
    outDir: '../dist/ui',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'ui'),
    },
  },
});
