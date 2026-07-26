import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// The frontend is a static SPA served by Cloudflare Pages.
// During local dev, /api requests are proxied to `wrangler dev` (port 8787).
export default defineConfig({
  plugins: [react()],
  root: 'src/frontend',
  publicDir: path.resolve(__dirname, 'src/frontend/public'),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/frontend'),
      '@shared': path.resolve(__dirname, 'shared'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Keep the big vendors in their own cacheable chunks.
          react: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
    },
  },
});
